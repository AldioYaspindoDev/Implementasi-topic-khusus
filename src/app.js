import express from 'express';
import { routeAdmin } from './Routes/admin.route.js';

export const app = express();

app.use('/uploads', express.static('uploads'));

app.use(express.json());

app.use("/admin", routeAdmin);