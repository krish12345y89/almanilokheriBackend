import { mailSender } from "../utils/mail.js";
import { Accept } from "./Templates/Accept.js";
import { Reject } from "./Templates/Reject.js";
import { Otp } from "./Templates/Otp.js";
import { ReferenceNotification } from "./Templates/ReferenceNotification.js";
import { Warning } from "./Templates/Warning.js";
import { Blocked } from "./Templates/Blocked.js";
import { PendingUserEmail } from "./Templates/PendingUserEmail.js";
import { Active } from "./Templates/Active.js";
import { ErrorHandle } from "../utils/errorHandling.js";
import { Regestered } from "./Templates/Regeiter.js";
import { config } from "dotenv";
config();
let next;
const SENDER_MAIL = process.env.SENDER_MAIL;
class Mail {
    constructor() {
        this.mailsender = mailSender;
    }
    options(receiver, subject, template) {
        return {
            from: SENDER_MAIL,
            to: receiver,
            subject,
            html: template,
        };
    }
    async sendMail(receiver, subject, template) {
        try {
            const mailOptions = this.options(receiver, subject, template);
            const info = await this.mailsender.sendMail(mailOptions);
            console.log(`Email sent successfully to ${receiver}:`, info);
            return info;
        }
        catch (error) {
            console.error(`Failed to send email to ${receiver}:`, error);
            next(new ErrorHandle("Failed to send the mail", 500));
        }
    }
    async accept(name, email) {
        const template = await Accept(name);
        await this.sendMail(email, "Request Accepted", template);
    }
    async registered(name, email) {
        const template = await Regestered(name);
        await this.sendMail(email, "Request Accepted", template);
    }
    async reject(name, email, remarks) {
        const template = await Reject(name, remarks);
        await this.sendMail(email, "Request Rejected", template);
    }
    async warning(name, email) {
        const template = await Warning(name);
        await this.sendMail(email, "Welcome Onboard", template);
    }
    async blocked(name, email, remarks) {
        const template = await Blocked(name, remarks);
        await this.sendMail(email, "user Blocked", template);
    }
    async pendingUser(email) {
        const template = await PendingUserEmail(email);
        await this.sendMail(email, "user Blocked", template);
    }
    async otp(otp, email) {
        const template = Otp(otp);
        await this.sendMail(email, "otp", template);
    }
    async referenceNotification(name, referrer, email, userDetails) {
        const template = await ReferenceNotification(name, userDetails);
        await this.sendMail(email, "reffereal", template);
    }
    async active(name, email) {
        const template = await Active(name);
        await this.sendMail(email, "user Blocked", template);
    }
}
export default Mail;
