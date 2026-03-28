import amqplib from 'amqplib';

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

export const connectionRabbitMq = async ()=> {
    try {
        connection = await amqplib.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        connection.on('error', (err)=> {
            console.error("RabbitMQ connection error", err);
            connection = null;
            channel = null;
        });

        connection.on('close', ()=> {
            console.warn("RabbitMQ Connection Closed");
            connection = null;
            channel = null;
        });

        console.log('rabbitmq connected');
        return channel;
    } catch (error) {
        throw error;
    }
}

export const getChannel = ()=> {
    if(!channel)throw new Error('rabbitmq channel not connected');
    return channel
}