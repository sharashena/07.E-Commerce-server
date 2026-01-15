import { transporter } from "../configs/nodemailer.js";

export const sendEmail = async ({  to, subject, html }) => {
  await transporter.sendMail({
    from: "E-Commerce <no-reply@ethereal.com>",
    to,
    subject,
    html,
  });
};
