import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import dotenv from 'dotenv';

dotenv.config();
const { env } = process;
const {
  SMPT_HOST, SMPT_PORT, SMPT_PASS, SMPT_MAIL, SITE_URL,
} = env;

class MailService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
    this.transporter = nodemailer.createTransport(new SMTPTransport({
      host: SMPT_HOST,
      port: Number(SMPT_PORT),
      auth: {
        user: SMPT_MAIL,
        pass: SMPT_PASS,
      },
    }));
  }

  private getLayout = (href: string) => (`
    <div>
      <h1>VK Clone</h1>
      <a href="${href}" target="_blank">${href}</a>
    </div>
  `);

  sendActivationMail = async (to: string, link: string, fullName: string) => {
    await this.transporter.sendMail({
      from: SMPT_MAIL,
      to,
      subject: `Activate account on ${SITE_URL}`,
      text: `Hi, ${fullName}!`,
      html: this.getLayout(link),
    });
  };
}

const mailService = new MailService();

export default mailService;
