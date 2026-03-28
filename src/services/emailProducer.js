import { getChannel } from "../config/rabbitmq.js";

const QUEUE_NAME = 'email_queue';

export const publishedEmailJob = async (emailData) => {
    const channel = getChannel();

    await channel.assertQueue(QUEUE_NAME, {
        durable: true,
    });

    const message = Buffer.from(JSON.stringify(emailData));

    channel.sendToQueue(QUEUE_NAME, message,{
        persistent: true,
    });

    console.log('email published', emailData);
};