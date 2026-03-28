import 'dotenv/config';
import { app } from './app.js';
import { connectDb } from '../src/config/database.js';
import { connectRedis } from './config/redis.js';
import { connectionRabbitMq } from './config/rabbitmq.js';
import { startEmailConsumer } from './services/emailConsumer.js';

connectDb();
connectRedis();
const initRabbitMQ = async () => {
    try {
        await connectionRabbitMq();
        startEmailConsumer();
    } catch (err) {
        console.error("RabbitMQ init failed, retrying in 5s...");
        setTimeout(initRabbitMQ, 5000);
    }
};

initRabbitMQ();

const PORT = process.env.PORT || 3000;

export const server = app.listen(PORT, ()=> {
    console.log(`application start and running on port ${PORT}`);
});
