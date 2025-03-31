const nodemailer = require("nodemailer");
require('dotenv').config();


const transporter = nodemailer.createTransport({
  service: "gmail",  // Using Gmail service
  auth: {
    user: process.env.EMAIL_USER,  // Email user
    pass: process.env.EMAIL_PASSWORD,  // App-specific password
  },
  tls: {
    rejectUnauthorized: false,  // Allows for self-signed certificates (important for Gmail)
  },
});

const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,  // Sender email address
    to,  // Receiver email address
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
