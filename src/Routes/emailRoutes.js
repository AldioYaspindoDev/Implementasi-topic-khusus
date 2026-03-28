import { Router } from "express";
import { sendMail } from "../Controllers/email.controllers.js";

export const mailRouter = Router();

mailRouter.post('/send', sendMail);