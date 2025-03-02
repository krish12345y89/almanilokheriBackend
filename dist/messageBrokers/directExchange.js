import amqplib from "amqplib";
import { ErrorHandle } from "../utils/errorHandling.js";
import { config } from "dotenv";
import { ActiveEvent, registerdEvent } from "../service/user.js";
import Mail from "../mail/main.js";
config();
export class DirectExchange {
    constructor(config, next) {
        this.connection = null;
        this.channel = null;
        this.exchange = null;
        this.reconnectAttempts = 0;
        this.maxRetries = 5;
        this.config = config;
        this.next = next;
        this.mail = new Mail();
        this.initialise();
    }
    async initialise() {
        try {
            console.log("Attempting to establish connection...");
            this.connection = await amqplib.connect(this.config.uri);
            console.log("Connection established");
            this.connection.on("error", (err) => {
                console.error("Connection error:", err);
                this.reconnect();
            });
            this.connection.on("close", () => {
                console.warn("Connection closed, attempting to reconnect...");
                this.reconnect();
            });
            this.channel = await this.connection.createChannel();
            console.log("Channel created");
            this.exchange = await this.channel.assertExchange(this.config.exchangeName, "direct", { durable: true, arguments: { "x-delayed-type": "direct" } });
            console.log("Exchange asserted successfully");
            this.channel.prefetch(1);
            console.log("Prefetch set to 1");
            this.reconnectAttempts = 0;
        }
        catch (error) {
            console.error("Failed to initialize connection or channel:", error);
            setTimeout(() => this.reconnect(), 5000);
        }
    }
    async reconnect() {
        if (this.reconnectAttempts >= this.maxRetries) {
            console.error("Maximum reconnection attempts reached. Stopping retries.");
            return;
        }
        const delay = Math.min(5000 * Math.pow(2, this.reconnectAttempts), 60000); // Cap at 1 minute
        this.reconnectAttempts++;
        console.warn(`Reconnecting in ${delay / 1000} seconds...`);
        if (!(await this.isServerAvailable())) {
            console.warn("AMQP server is unavailable. Retrying later...");
            setTimeout(() => this.reconnect(), 60000);
            return;
        }
        setTimeout(() => this.initialise(), delay);
    }
    async isServerAvailable() {
        try {
            const testConnection = await amqplib.connect(this.config.uri);
            await testConnection.close();
            return true;
        }
        catch {
            return false;
        }
    }
    handleError(error, action) {
        console.error(`Error during ${action}:`, error);
        if (this.next) {
            this.next(new ErrorHandle(`${action} failed`, 500));
        }
    }
    async sendMessage(data, queueName, routingKey, delay) {
        try {
            if (!this.channel) {
                await this.initialise();
                if (!this.channel)
                    throw new Error("Channel not initialized");
            }
            await this.channel.assertQueue(queueName, {
                durable: true,
                arguments: { "x-queue-mode": "lazy" },
            });
            console.log(`Queue '${queueName}' asserted successfully`);
            await this.channel.bindQueue(queueName, this.config.exchangeName, routingKey);
            console.log(`Queue '${queueName}' bound to exchange '${this.config.exchangeName}' with routingKey '${routingKey}'`);
            this.channel.publish(this.config.exchangeName, routingKey, Buffer.from(JSON.stringify(data)), {
                persistent: true,
                headers: { "x-delay": delay },
            });
            console.log(`Message sent successfully to exchange , ${data}`);
            this.receiveMessage(queueName);
        }
        catch (error) {
            this.handleError(error, "sendMessage");
        }
    }
    async receiveMessage(queueName) {
        try {
            if (!this.channel) {
                await this.initialise();
                if (!this.channel)
                    throw new Error("Channel not initialized");
            }
            await this.channel.consume(queueName, (data) => {
                if (data) {
                    try {
                        const consumedData = JSON.parse(data.content.toString());
                        console.log("Message received successfully:", consumedData);
                        switch (consumedData.event) {
                            case registerdEvent:
                                this.mail.registered(consumedData.data.name, consumedData.data.email);
                            case ActiveEvent:
                                this.mail.accept(consumedData.data.name, consumedData.data.email);
                        }
                        this.channel?.ack(data);
                    }
                    catch (err) {
                        console.error("Failed to process message:", err);
                        this.channel?.nack(data, false, false);
                    }
                }
            }, { noAck: false });
        }
        catch (error) {
            this.handleError(error, "receiveMessage");
        }
    }
    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
                console.log("Channel successfully closed");
            }
            if (this.connection) {
                await this.connection.close();
                console.log("Connection successfully closed");
            }
        }
        catch (error) {
            console.error("Failed to close connection or channel:", error);
        }
    }
}
