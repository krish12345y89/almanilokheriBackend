import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import { mailSender } from "../utils/mail.js";
import { Transporter } from "nodemailer";
import { Accept } from "./Templates/Accept.js";
import { Reject } from "./Templates/Reject.js";
import { Otp } from "./Templates/Otp.js";
import { ReferenceNotification } from "./Templates/ReferenceNotification.js";
import { Warning } from "./Templates/Warning.js";
import { Blocked } from "./Templates/Blocked.js";
import { NextFunction } from "express";
import { PendingUserEmail } from "./Templates/PendingUserEmail.js";
import { Active } from "./Templates/Active.js";
import { ErrorHandle } from "../utils/errorHandling.js";
import { Regestered } from "./Templates/Regeiter.js";
import { config } from "dotenv";
config()
let next:NextFunction
const SENDER_MAIL = process.env.SENDER_MAIL;

class Mail {
  private mailsender: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;


  constructor() {
    this.mailsender = mailSender;
  }

  private options(receiver: string, subject: string, template: string) {
    return {
      from: SENDER_MAIL,
      to: receiver,
      subject,
      html: template,
    };
  }

  async sendMail(receiver: string, subject: string, template: string) {
    try {
      const mailOptions = this.options(receiver, subject, template);
      const info = await this.mailsender.sendMail(mailOptions);
      console.log(`Email sent successfully to ${receiver}:`, info);
      return info;
    } catch (error) {
      console.error(`Failed to send email to ${receiver}:`, error);
      next(new ErrorHandle("Failed to send the mail", 500));
    }
  }

  async accept(name: string, email: string) {
    const template = await Accept(name);
    await this.sendMail(email, "Request Accepted", template);
  }

  async registered(name: string, email: string) {
    const template = await Regestered(name);
    await this.sendMail(email, "Request Accepted", template);
  }

  async reject(name: string, email: string, remarks: string) {
    const template = await Reject(name, remarks);
    await this.sendMail(email, "Request Rejected", template);
  }
  
  async warning(name: string, email: string) {
    const template = await Warning(name);
    await this.sendMail(email, "Welcome Onboard", template);
  }

  async blocked(name: string, email: string, remarks: string) {
    const template = await Blocked(name, remarks);
    await this.sendMail(email, "user Blocked", template);
  }

  async pendingUser(email: string) {
    const template = await PendingUserEmail(email);
    await this.sendMail(email, "user Blocked", template);
  }

  async otp(otp: string, email: string) {
    const template = Otp(otp);
    await this.sendMail(email, "otp", template);
  }

  async referenceNotification(
    name: string,
    referrer: any,
    email: string,
    userDetails: any
  ) {
    const template = await ReferenceNotification(name, userDetails);
    await this.sendMail(email, "reffereal", template);
  }

  async active(name: string, email: string) {
    const template = await Active(name);
    await this.sendMail(email, "user Blocked", template);
  }
}

export default Mail;
