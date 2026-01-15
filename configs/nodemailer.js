import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "tomas.willms57@ethereal.email",
    pass: "g3MHrbqD4XDBt6tjqT",
  },
});
