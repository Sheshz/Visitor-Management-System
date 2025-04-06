// utils/emailService.js
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const config = require("../config/default");

// Create a transport object using your email service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Or another email service provider
  auth: {
    user: config.email.user,  // Replace with your email from the config
    pass: config.email.password,   // Replace with your email password or app password from the config
  },
  tls: {
    rejectUnauthorized: false // Allows for self-signed certificates (important for Gmail)
  }
});

// Email sending function
const sendEmail = async (to, subject, text, html) => {
  if (!to) {
    console.error("Error: No recipient email provided");
    throw new Error("No recipient email provided");
  }

  const mailOptions = {
    from: config.email.from || `"Visitor Management System" <${config.email.user}>`,
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Function to generate user welcome email
const sendUserWelcomeEmail = async (user) => {
  try {
    if (!user || !user.email) throw new Error("User email is required");

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4a4a4a; text-align: center;">Welcome to GetePassPro!</h2>
        <p>Dear ${user.name || 'User'},</p>
        <p>Your account has been created successfully. Below are your account details:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>User ID:</strong> ${user._id || user.userID || 'N/A'}</p>
          <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${user.email}</p>
        </div>
        <p>You can now log in to your account and start using our visitor management system.</p>
        <p>Thank you for joining us!</p>
        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
      </div>
    `;
    
    const textContent = `Welcome to GetePassPro!
      
      Dear ${user.name || 'User'},
      
      Your account has been created successfully. Below are your account details:
      
      User ID: ${user._id || user.userID || 'N/A'}
      Name: ${user.name || 'N/A'}
      Email: ${user.email}
      
      You can now log in to your account and start using our visitor management system.
      
      Thank you for joining us!`;

    console.log(`Sending welcome email to: ${user.email}`);
    return await sendEmail(user.email, "Welcome to GetePassPro - Account Created", textContent, htmlContent);
  } catch (error) {
    console.error("Error sending user welcome email:", error);
    throw error;
  }
};

// Function to generate host profile PDF
const generateHostPDF = async (host) => {
  return new Promise((resolve, reject) => {
    if (!host || !host.hostID) return reject(new Error("Invalid host data"));
    
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const filePath = path.join(tempDir, `${host.hostID}-profile.pdf`);
    
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    
    doc.pipe(stream);
    doc.fontSize(25).text('Host Profile Details', { align: 'center' }).moveDown();
    doc.fontSize(16).fillColor('blue').text(`Host ID: ${host.hostID}`, { align: 'center' }).moveDown();
    doc.fontSize(12).fillColor('black').text(`Name: ${host.name || 'N/A'}`).text(`Email: ${host.email || 'N/A'}`).text(`Location: ${host.location || 'N/A'}`).moveDown();
    doc.fontSize(14).fillColor('darkblue').text('Bio:').fontSize(12).fillColor('black').text(host.bio || 'Not provided').moveDown();
    doc.fontSize(14).fillColor('darkblue').text('Expertise:').fontSize(12).fillColor('black').text(host.expertise || 'Not provided').moveDown();
    doc.fontSize(14).fillColor('darkblue').text('Experience:').fontSize(12).fillColor('black').text(host.experience || 'Not provided').moveDown();

    doc.fontSize(14).fillColor('darkblue').text('Social Media:');
    if (host.socialMedia) {
      if (host.socialMedia.facebook) doc.fontSize(12).fillColor('black').text(`Facebook: ${host.socialMedia.facebook}`);
      if (host.socialMedia.twitter) doc.fontSize(12).fillColor('black').text(`Twitter: ${host.socialMedia.twitter}`);
      if (host.socialMedia.linkedin) doc.fontSize(12).fillColor('black').text(`LinkedIn: ${host.socialMedia.linkedin}`);
      if (host.socialMedia.instagram) doc.fontSize(12).fillColor('black').text(`Instagram: ${host.socialMedia.instagram}`);
    } else {
      doc.fontSize(12).fillColor('black').text('No social media links provided');
    }

    doc.moveDown(2);
    doc.fontSize(10).fillColor('gray').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', (err) => reject(err));
  });
};

// Send email with PDF attachment for host profile
const sendHostProfileEmail = async (host) => {
  try {
    if (!host || !host.email) throw new Error("Host email is required");

    const pdfPath = await generateHostPDF(host);
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4a4a4a; text-align: center;">Host Profile Created Successfully!</h2>
        <p>Dear ${host.name || 'Host'},</p>
        <p>Congratulations! Your host profile has been created successfully. Below are your details:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Host ID:</strong> ${host.hostID}</p>
          <p><strong>Name:</strong> ${host.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${host.email}</p>
          <p><strong>Location:</strong> ${host.location || 'Not specified'}</p>
        </div>
        <p>We've attached a PDF with all your profile details for your records.</p>
        <p>You can now receive and manage visitor requests through our system.</p>
        <p>Thank you for becoming a host!</p>
        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
      </div>
    `;

    const textContent = `Host Profile Created Successfully!
      
      Dear ${host.name || 'Host'},
      
      Congratulations! Your host profile has been created successfully. Below are your details:
      
      Host ID: ${host.hostID}
      Name: ${host.name || 'N/A'}
      Email: ${host.email}
      Location: ${host.location || 'Not specified'}
      
      We've attached a PDF with all your profile details for your records.
      
      You can now receive and manage visitor requests through our system.
      
      Thank you for becoming a host!`;

    const mailOptions = {
      from: config.email.from || `"GetePassPro" <${config.email.user}>`,
      to: host.email,
      subject: "Your Host Profile Has Been Created",
      text: textContent,
      html: htmlContent,
      attachments: [
        {
          filename: `${host.hostID}-profile.pdf`,
          path: pdfPath,
          contentType: 'application/pdf'
        }
      ]
    };

    console.log(`Sending host profile email to: ${host.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("Host profile email sent successfully");

    // Delete the temporary PDF file
    fs.unlinkSync(pdfPath);

    return info;
  } catch (error) {
    console.error("Error sending host profile email:", error);
    throw error;
  }
};

module.exports = {
  transporter,
  sendEmail,
  sendUserWelcomeEmail,
  sendHostProfileEmail
};
