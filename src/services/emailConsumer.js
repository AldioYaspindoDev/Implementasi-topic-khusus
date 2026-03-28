import { getChannel } from "../config/rabbitmq.js";
import { transporter } from "../config/mailer.js";

const QUEUE_NAME = 'email_queue';

export const startEmailConsumer = async ()=> {
    const channel = getChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    channel.prefetch(1);

    console.log('email consumer started');

    channel.consume(QUEUE_NAME, async (msg)=>{
        if (!msg) return;

        try {
            const emailData = JSON.parse(msg.content.toString());
            console.log('prosses email', emailData);

            await transporter.sendMail({
                from: `"APP NAME" <${process.env.MAIL_USER}>`,
                to: emailData.to,
                subject: emailData.subject,
                html: emailData.html,
            });

            console.log(`email send to ${emailData.to}`);
            channel.ack(msg);
        } catch (error) {
            console.error('failed to send email');
            channel.nack(msg, false, false);
        }
            
    });
}