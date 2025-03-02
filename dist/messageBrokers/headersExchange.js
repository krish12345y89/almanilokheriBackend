import amqplib from "amqplib";
class HeadersExchange {
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
            this.channel = await this.connection.createChannel();
            this.exchange = await this.channel.assertExchange(this.config.exchangeName, "headers", { durable: true });
            console.log(`Headers exchange '${this.config.exchangeName}' initialized successfully.`);
        }
        catch (error) {
            console.error("Failed to initialize the connection or channel:", error);
            process.exit(1);
        }
    }
    async sendMessage(data, headers) {
        try {
            if (!this.channel) {
                await this.initialise();
                if (!this.channel) {
                    throw new Error("failed to initaise the channel");
                }
            }
            if (!this.exchange) {
                throw new Error("Exchange is not initialized.");
            }
            const messageBuffer = Buffer.from(JSON.stringify(data));
            await this.channel.publish(this.config.exchangeName, "", messageBuffer, {
                headers: headers,
                persistent: true,
            });
            console.log("Message sent successfully:", data, "with headers:", headers);
        }
        catch (error) {
            console.error("Failed to send message:", error);
        }
    }
    async receiveMessage(headers) {
        try {
            if (!this.channel) {
                await this.initialise();
                if (!this.channel) {
                    throw new Error("failed to initaise the channel");
                }
            }
            if (!this.exchange) {
                throw new Error("Exchange is not initialized.");
            }
            const q = await this.channel.assertQueue("", {
                durable: true,
                exclusive: true,
            });
            await this.channel.bindQueue(q.queue, this.config.exchangeName, "", { headers: headers });
            console.log(`Waiting for messages in queue '${q.queue}'...`);
            await this.channel.consume(q.queue, (data) => {
                if (data && this.channel) {
                    const consumedMessage = JSON.parse(data.content.toString());
                    console.log("Message received successfully:", consumedMessage);
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
                console.log("Channel successfully closed.");
            }
            if (this.connection) {
                await this.connection.close();
                console.log("Connection successfully closed.");
            }
        }
        catch (error) {
            console.error("Failed to close the connection:", error);
        }
    }
}
