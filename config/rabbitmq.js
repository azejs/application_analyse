const amqp = require("amqplib");
const config = require("./Config");

const RABBITMQ_URL = config.rabbitMqUrl;
let channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log("Connecté à RabbitMQ");
    } catch (error) {
        console.error("Erreur de connexion à RabbitMQ :", error.message);
    }
}

exports.sendMessage = async (queue, message) => {
    try {
        if (!channel) await connectRabbitMQ();
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log(`Message envoyé à la queue ${queue}:`, message);
    } catch (error) {
        console.error("Erreur lors de l envoi du message à RabbitMQ :", error.message);
    }
};

exports.consumeMessages = async (queue, callback) => {
    try {
        if (!channel) await connectRabbitMQ();
        await channel.assertQueue(queue, { durable: true });
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                console.log(`Message reçu depuis ${queue}:`, content);
                callback(content);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("Erreur lors de la consommation des messages de RabbitMQ :", error.message);
    }
};
