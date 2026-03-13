import 'dotenv/config';
import { app } from './app.js';
import { connectDb } from '../src/config/database.js';
import { connectRedis } from './config/redis.js';

connectDb();
connectRedis();

const PORT = process.env.PORT || 3000;

export const server = app.listen(PORT, ()=> {
    console.log(`application start and running on port ${PORT}`);
});
