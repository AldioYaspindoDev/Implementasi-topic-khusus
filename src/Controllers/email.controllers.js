import { publishedEmailJob } from "../services/emailProducer.js";

export const sendMail = async(req, res) => {
    try {
        const {to, subject, html} = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({
                message: "to subject html required"
            });
        }

        await publishedEmailJob({ to, subject, html});

        return res.status(202).json({
            message: "email job queue successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "internal server error" });
    }
}