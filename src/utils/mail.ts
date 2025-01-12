import { config } from "dotenv";
import { createTransport } from "nodemailer";
config()
const user=process.env.SENDER_MAIL;
const pass=process.env.MAIL_PWD;
export const mailSender=createTransport({
    service:"Gmail",
    auth:{
        user:user as string,
        pass:pass as string
    }
});