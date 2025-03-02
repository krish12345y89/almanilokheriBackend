import amqplib from "amqplib";
import { v4 as uuid } from "uuid";
import { ErrorHandle } from "../utils/errorHandling.js";
export class Rpc {
    constructor(config, next) {
        this.connection = null;
        this.channel = null;
        this.reconnectAttempts = 0;
        this.maxRetries = 5;
        this.config = config;
        this.next = next;
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
            console.log("Channel created successfully");
            this.reconnectAttempts = 0;
        }
        catch (error) {
            console.error("Initialization failed:", error);
            setTimeout(() => this.reconnect(), 5000);
        }
    }
    async reconnect() {
        if (this.reconnectAttempts >= this.maxRetries) {
            console.error("Maximum reconnection attempts reached. Stopping retries.");
            return;
        }
        const delay = Math.min(5000 * Math.pow(2, this.reconnectAttempts), 60000); // Exponential backoff with a cap
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
    async requestData(queueName, data) {
        try {
            if (!this.channel) {
                await this.initialise();
                if (!this.channel)
                    throw new Error("Channel not initialized");
            }
            const correlationalId = uuid();
            const q = await this.channel.assertQueue("", { exclusive: true });
            console.log(`Temporary queue '${q.queue}' asserted successfully.`);
            await this.channel.assertQueue(queueName, { durable: true });
            console.log(`Queue '${queueName}' asserted successfully.`);
            const sendedData = Buffer.from(JSON.stringify(data));
            await this.channel.sendToQueue(queueName, sendedData, {
                replyTo: q.queue,
                persistent: true,
                correlationId: correlationalId,
            });
            return new Promise((res, rej) => {
                const timeout = setTimeout(() => {
                    rej("Failed to retrieve the data: Timeout");
                }, 20000); // 20 seconds timeout
                this.channel.consume(q.queue, (msg) => {
                    if (msg && msg.properties.correlationId === correlationalId) {
                        clearTimeout(timeout);
                        const consumed = JSON.parse(msg.content.toString());
                        console.log({
                            sendedData: sendedData.toString(),
                            receivedData: consumed,
                        });
                        this.channel.ack(msg);
                        res(consumed);
                    }
                }, { noAck: false });
            });
        }
        catch (error) {
            this.handleError(error, "requestData");
        }
    }
    async sendData(queueName, fakeResponse) {
        try {
            if (!this.channel) {
                await this.initialise();
                if (!this.channel)
                    throw new Error("Channel not initialized");
            }
            const sendedData = Buffer.from(JSON.stringify(fakeResponse));
            await this.channel.assertQueue(queueName, { durable: true });
            console.log(`Queue '${queueName}' asserted successfully for sending data.`);
            await this.channel.consume(queueName, async (data) => {
                if (data && data.content) {
                    const consumed = JSON.parse(data.content.toString());
                    const replyTo = data.properties.replyTo;
                    const correlationId = data.properties.correlationId;
                    console.log({ consumedData: consumed });
                    this.channel?.ack(data);
                    await this.channel?.sendToQueue(replyTo, sendedData, {
                        correlationId: correlationId,
                        persistent: true,
                    });
                    console.log("Data sent successfully.");
                }
                else {
                    console.error("Failed to retrieve data from the queue.");
                }
            }, { noAck: false });
        }
        catch (error) {
            this.handleError(error, "sendData");
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
