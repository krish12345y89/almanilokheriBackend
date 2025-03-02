import amqplib from "amqplib";
export class FanoutExchange {
    constructor(config) {
        this.connection = null;
        this.channel = null;
        this.exchange = null;
        this.config = config;
        this.initialise();
    }
    async initialise() {
        try {
            this.connection = await amqplib.connect(this.config.uri);
            console.log("Connection established");
            this.channel = await this.connection.createChannel();
            console.log("Channel created");
            this.exchange = await this.channel.assertExchange(this.config.exchangeName, "fanout", { durable: true });
            console.log("Exchange asserted successfully");
        }
        catch (error) {
            console.error("Failed to initialize connection or channel:", error);
        }
    }
    async sendMessage(data) {
        try {
            if (!this.channel) {
                await this.initialise();
                if (!this.channel) {
                    throw new Error("failed to initaise the channel");
                }
            }
            await this.channel.publish(this.config.exchangeName, "", Buffer.from(JSON.stringify(data)), {
                persistent: true,
            });
            console.log("Message sent successfully to exchange");
        }
        catch (error) {
            console.error("Failed to send message:", error);
        }
    }
    async receiveMessage(queueName) {
        try {
            if (!this.channel) {
                await this.initialise();
                if (!this.channel) {
                    throw new Error("failed to initaise the channel");
                }
            }
            await this.channel.assertQueue(queueName, { durable: true });
            console.log(`Queue '${queueName}' asserted successfully`);
            await this.channel.bindQueue(queueName, this.config.exchangeName, "");
            console.log(`Queue '${queueName}' bound to exchange '${this.config.exchangeName}'`);
            await this.channel.consume(queueName, (data) => {
                if (data && this.channel) {
                    const consumed = JSON.parse(data.content.toString());
                    console.log("Data consumed successfully:", consumed);
                    this.channel.ack(data);
                }
            }, { noAck: false });
        }
        catch (error) {
            console.error("Failed to receive message:", error);
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
            console.error("Failed to close connection:", error);
        }
    }
}
