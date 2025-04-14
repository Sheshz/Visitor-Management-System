// utils/emailService.js
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const config = require("../config/default");

// Create a transport object using your email service credentials
const transporter = nodemailer.createTransport({
  service: "gmail", // Or another email service provider
  auth: {
    user: config.email.user, // Replace with your email from the config
    pass: config.email.password, // Replace with your email password or app password from the config
  },
  tls: {
    rejectUnauthorized: false, // Allows for self-signed certificates (important for Gmail)
  },
});

// Email sending function
const sendEmail = async (to, subject, text, html, attachments = []) => {
  if (!to) {
    console.error("Error: No recipient email provided");
    throw new Error("No recipient email provided");
  }

  const mailOptions = {
    from:
      config.email.from || `"Visitor Management System" <${config.email.user}>`,
    to,
    subject,
    text,
    html,
    attachments,
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
        <p>Dear ${user.name || "User"},</p>
        <p>Your account has been created successfully. Below are your account details:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>User ID:</strong> ${user._id || user.userID || "N/A"}</p>
          <p><strong>Name:</strong> ${user.name || "N/A"}</p>
          <p><strong>Email:</strong> ${user.email}</p>
        </div>
        <p>You can now log in to your account and start using our visitor management system.</p>
        <p>Thank you for joining us!</p>
        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
      </div>
    `;

    const textContent = `Welcome to GetePassPro!
      
      Dear ${user.name || "User"},
      
      Your account has been created successfully. Below are your account details:
      
      User ID: ${user._id || user.userID || "N/A"}
      Name: ${user.name || "N/A"}
      Email: ${user.email}
      
      You can now log in to your account and start using our visitor management system.
      
      Thank you for joining us!`;

    console.log(`Sending welcome email to: ${user.email}`);
    return await sendEmail(
      user.email,
      "Welcome to GetePassPro - Account Created",
      textContent,
      htmlContent
    );
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
    doc
      .fontSize(25)
      .text("Host Profile Details", { align: "center" })
      .moveDown();
    doc
      .fontSize(16)
      .fillColor("blue")
      .text(`Host ID: ${host.hostID}`, { align: "center" })
      .moveDown();
    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Name: ${host.name || "N/A"}`)
      .text(`Email: ${host.email || "N/A"}`)
      .text(`Location: ${host.location || "N/A"}`)
      .moveDown();
    doc
      .fontSize(14)
      .fillColor("darkblue")
      .text("Bio:")
      .fontSize(12)
      .fillColor("black")
      .text(host.bio || "Not provided")
      .moveDown();
    doc
      .fontSize(14)
      .fillColor("darkblue")
      .text("Expertise:")
      .fontSize(12)
      .fillColor("black")
      .text(host.expertise || "Not provided")
      .moveDown();
    doc
      .fontSize(14)
      .fillColor("darkblue")
      .text("Experience:")
      .fontSize(12)
      .fillColor("black")
      .text(host.experience || "Not provided")
      .moveDown();

    doc.fontSize(14).fillColor("darkblue").text("Social Media:");
    if (host.socialMedia) {
      if (host.socialMedia.facebook)
        doc
          .fontSize(12)
          .fillColor("black")
          .text(`Facebook: ${host.socialMedia.facebook}`);
      if (host.socialMedia.twitter)
        doc
          .fontSize(12)
          .fillColor("black")
          .text(`Twitter: ${host.socialMedia.twitter}`);
      if (host.socialMedia.linkedin)
        doc
          .fontSize(12)
          .fillColor("black")
          .text(`LinkedIn: ${host.socialMedia.linkedin}`);
      if (host.socialMedia.instagram)
        doc
          .fontSize(12)
          .fillColor("black")
          .text(`Instagram: ${host.socialMedia.instagram}`);
    } else {
      doc
        .fontSize(12)
        .fillColor("black")
        .text("No social media links provided");
    }

    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(`Generated on: ${new Date().toLocaleString()}`, {
        align: "center",
      });
    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", (err) => reject(err));
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
        <p>Dear ${host.name || "Host"},</p>
        <p>Congratulations! Your host profile has been created successfully. Below are your details:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Host ID:</strong> ${host.hostID}</p>
          <p><strong>Name:</strong> ${host.name || "N/A"}</p>
          <p><strong>Email:</strong> ${host.email}</p>
          <p><strong>Location:</strong> ${host.location || "Not specified"}</p>
        </div>
        <p>We've attached a PDF with all your profile details for your records.</p>
        <p>You can now receive and manage visitor requests through our system.</p>
        <p>Thank you for becoming a host!</p>
        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
      </div>
    `;

    const textContent = `Host Profile Created Successfully!
      
      Dear ${host.name || "Host"},
      
      Congratulations! Your host profile has been created successfully. Below are your details:
      
      Host ID: ${host.hostID}
      Name: ${host.name || "N/A"}
      Email: ${host.email}
      Location: ${host.location || "Not specified"}
      
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
          contentType: "application/pdf",
        },
      ],
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

// Generate QR code for meeting
const generateMeetingQRCode = async (meetingId, accessCode) => {
  try {
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const qrFilePath = path.join(tempDir, `${meetingId}-qr.png`);
    
    // Include both meetingId and accessCode in the QR code data
    const qrData = JSON.stringify({
      meetingId,
      accessCode
    });
    
    // Generate QR code
    await QRCode.toFile(qrFilePath, qrData, {
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300,
      margin: 2
    });
    
    return qrFilePath;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

// Function to send meeting invitation with QR code
const sendMeetingInvitation = async (
  recipientEmail,
  recipientName,
  hostName,
  meeting
) => {
  try {
    if (!recipientEmail || !meeting) throw new Error("Missing required parameters");
    
    // Generate a unique access code for this participant if not already exists
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Generate QR code
    const qrCodePath = await generateMeetingQRCode(meeting.meetingId, accessCode);
    
    // Format dates for display
    const startDateFormatted = new Date(meeting.startTime).toLocaleString();
    const endDateFormatted = new Date(meeting.endTime).toLocaleString();
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4a4a4a; text-align: center;">Meeting Invitation</h2>
        <p>Dear ${recipientName},</p>
        <p>You have been invited to join a meeting hosted by <strong>${hostName}</strong>.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Meeting Title:</strong> ${meeting.title}</p>
          <p><strong>Description:</strong> ${meeting.description || "N/A"}</p>
          <p><strong>Start Time:</strong> ${startDateFormatted}</p>
          <p><strong>End Time:</strong> ${endDateFormatted}</p>
          <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
          <p><strong>Meeting ID:</strong> ${meeting.meetingId}</p>
          <p><strong>Access Code:</strong> ${accessCode}</p>
        </div>
        <div style="text-align: center; margin: 25px 0;">
          <p><strong>Scan this QR code to join the meeting:</strong></p>
          <img src="cid:meeting-qr" alt="Meeting QR Code" style="max-width: 200px; height: auto;" />
        </div>
        <p>You can also join the meeting by entering the Meeting ID and Access Code on our platform.</p>
        <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
          <p>Join URL: <a href="${config.appUrl}/meeting/join/${meeting.meetingId}">${config.appUrl}/meeting/join/${meeting.meetingId}</a></p>
        </div>
        <p>Please make sure to join the meeting on time.</p>
        <p>Thank you!</p>
        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
      </div>
    `;

    const textContent = `Meeting Invitation
      
      Dear ${recipientName},
      
      You have been invited to join a meeting hosted by ${hostName}.
      
      Meeting Details:
      
      Meeting Title: ${meeting.title}
      Description: ${meeting.description || "N/A"}
      Start Time: ${startDateFormatted}
      End Time: ${endDateFormatted}
      Duration: ${meeting.duration} minutes
      Meeting ID: ${meeting.meetingId}
      Access Code: ${accessCode}
      
      You can join the meeting by:
      1. Scanning the QR code attached to this email
      2. Visiting ${config.appUrl}/meeting/join/${meeting.meetingId} and entering your access code
      
      Please make sure to join the meeting on time.
      
      Thank you!`;

    console.log(`Sending meeting invitation to: ${recipientEmail}`);
    
    const mailOptions = {
      from: config.email.from || `"GetePassPro Meetings" <${config.email.user}>`,
      to: recipientEmail,
      subject: `Meeting Invitation: ${meeting.title}`,
      text: textContent,
      html: htmlContent,
      attachments: [
        {
          filename: 'meeting-qr.png',
          path: qrCodePath,
          cid: 'meeting-qr' // Reference for embedding in HTML
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Meeting invitation sent successfully");
    
    // Delete the temporary QR code file
    fs.unlinkSync(qrCodePath);
    
    return { info, accessCode };
  } catch (error) {
    console.error("Error sending meeting invitation:", error);
    throw error;
  }
};

// Function to send meeting reminders or updates
const sendMeetingReminder = async (
  recipientEmail,
  recipientName,
  hostName,
  meeting,
  notificationMessage
) => {
  try {
    if (!recipientEmail || !meeting) throw new Error("Missing required parameters");
    
    // Find or generate access code for this participant
    let accessCode;
    const participant = meeting.participants.find(p => p.email === recipientEmail);
    if (participant && participant.accessCode) {
      accessCode = participant.accessCode;
    } else {
      accessCode = Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    // Generate QR code
    const qrCodePath = await generateMeetingQRCode(meeting.meetingId, accessCode);
    
    // Format dates for display
    const startDateFormatted = new Date(meeting.startTime).toLocaleString();
    const endDateFormatted = new Date(meeting.endTime).toLocaleString();
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4a4a4a; text-align: center;">Meeting Notification</h2>
        <div style="background-color: #f0f7ff; padding: 10px; border-radius: 5px; margin: 15px 0; text-align: center;">
          <p style="font-weight: bold; color: #0056b3; margin: 0;">${notificationMessage}</p>
        </div>
        <p>Dear ${recipientName},</p>
        <p>This is a notification about your upcoming meeting with <strong>${hostName}</strong>.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Meeting Title:</strong> ${meeting.title}</p>
          <p><strong>Description:</strong> ${meeting.description || "N/A"}</p>
          <p><strong>Start Time:</strong> ${startDateFormatted}</p>
          <p><strong>End Time:</strong> ${endDateFormatted}</p>
          <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
          <p><strong>Meeting ID:</strong> ${meeting.meetingId}</p>
          <p><strong>Access Code:</strong> ${accessCode}</p>
        </div>
        <div style="text-align: center; margin: 25px 0;">
          <p><strong>Scan this QR code to join the meeting:</strong></p>
          <img src="cid:meeting-qr" alt="Meeting QR Code" style="max-width: 200px; height: auto;" />
        </div>
        <p>You can also join the meeting by entering the Meeting ID and Access Code on our platform.</p>
        <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
          <p>Join URL: <a href="${config.appUrl}/meeting/join/${meeting.meetingId}">${config.appUrl}/meeting/join/${meeting.meetingId}</a></p>
        </div>
        <p>Thank you!</p>
        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
      </div>
    `;

    const textContent = `Meeting Notification
      
      ${notificationMessage}
      
      Dear ${recipientName},
      
      This is a notification about your upcoming meeting with ${hostName}.
      
      Meeting Details:
      
      Meeting Title: ${meeting.title}
      Description: ${meeting.description || "N/A"}
      Start Time: ${startDateFormatted}
      End Time: ${endDateFormatted}
      Duration: ${meeting.duration} minutes
      Meeting ID: ${meeting.meetingId}
      Access Code: ${accessCode}
      
      You can join the meeting by:
      1. Scanning the QR code attached to this email
      2. Visiting ${config.appUrl}/meeting/join/${meeting.meetingId} and entering your access code
      
      Thank you!`;

    console.log(`Sending meeting notification to: ${recipientEmail}`);
    
    const mailOptions = {
      from: config.email.from || `"GetePassPro Meetings" <${config.email.user}>`,
      to: recipientEmail,
      subject: `Meeting Notification: ${meeting.title}`,
      text: textContent,
      html: htmlContent,
      attachments: [
        {
          filename: 'meeting-qr.png',
          path: qrCodePath,
          cid: 'meeting-qr' // Reference for embedding in HTML
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Meeting notification sent successfully");
    
    // Delete the temporary QR code file
    fs.unlinkSync(qrCodePath);
    
    return { info, accessCode };
  } catch (error) {
    console.error("Error sending meeting notification:", error);
    throw error;
  }
};

module.exports = {
  transporter,
  sendEmail,
  sendUserWelcomeEmail,
  sendHostProfileEmail,
  sendMeetingInvitation,
  sendMeetingReminder,
  generateMeetingQRCode
};