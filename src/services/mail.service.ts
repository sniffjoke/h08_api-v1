import * as nodemailer from 'nodemailer'
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {Transporter} from "nodemailer";

class MailService {
    public transporter: Transporter<SMTPTransport.SentMessageInfo>;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST as string,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }

    async sendActivationMail(to: string, link: string) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активация аккаунта на ' + process.env.API_URL,
            text: '',
            html:
                `
                <h1>Thank for your registration</h1>
                <p>To finish registration please follow the link below:
                    <a href='${link}'>Завершить регистрацию</a>
                </p>

            `
        })
    }
}

export default MailService
