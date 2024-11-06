import nodemailer from "nodemailer";
import { parseTemplate } from "../utils/templates";
import { Prospect } from "../types";

export class Mailer {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(
    templatePath: string,
    prospect: Prospect,
    from: string
  ): Promise<void> {
    const { subject, body } = await parseTemplate(templatePath, prospect);

    await this.transporter.sendMail({
      from,
      to: prospect.email,
      subject,
      text: body,
    });
  }
}
