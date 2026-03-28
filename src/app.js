import express from 'express';
import { routeAdmin } from './Routes/admin.route.js';
import { UserRoute } from './Routes/user.route.js';
import { mailRouter } from './Routes/emailRoutes.js';

export const app = express();

app.use('/uploads', express.static('uploads'));

app.use(express.json());

app.use("/admin", routeAdmin);
app.use("/user", UserRoute);
app.use("/api/email", mailRouter);

