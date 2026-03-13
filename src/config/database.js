import mongoose from "mongoose";
import 'dotenv/config';

export const connectDb = async ()=> {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("database connected and running");
    } catch (error) {
        console.error(error.message);
        process.exit();
    }
}