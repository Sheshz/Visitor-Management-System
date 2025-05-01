const nodemailer = require("nodemailer");
const config = require('../config/default');

// Create a transporter object
let transporter;
// Initialize the transporter based on environment
if (process.env.NODE_ENV === "production") {
  // Production email service configuration
  transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
      user: config.email.user,
      pass: config.email.password
    }
  });
} else {
  // Development email service - can use a service like Ethereal or Mailtrap
  transporter = nodemailer.createTransport({
    host: config.email.devHost,
    port: config.email.devPort,
    auth: {
      user: config.email.devUser,
      pass: config.email.devPassword
    },
    secure: false,
    ignoreTLS: true // For testing only
  });
}
/**
 * Format date in a user-friendly way
 * @param {Date} date - Date object
 * @returns {String} Formatted date string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};
/**
 * Format time in a user-friendly way
 * @param {Date} date - Date object
 * @returns {String} Formatted time string
 */
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};
/**
 * Send meeting invitation email to participant
 * @param {String} to - Recipient email
 * @param {String} recipientName - Recipient name
 * @param {String} hostName - Meeting host name
 * @param {String} meetingTitle - Meeting title
 * @param {String} meetingDescription - Meeting description
 * @param {Date} startTime - Meeting start time
 * @param {Date} endTime - Meeting end time
 * @param {String} meetingId - Meeting ID
 * @param {String} password - Meeting password
 * @param {String} joinUrl - Meeting join URL
 * @returns {Promise} Email sending promise
 */
exports.sendInvitationEmail = async (
  to,
  recipientName,
  hostName,
  meetingTitle,
  meetingDescription,
  startTime,
  endTime,
  meetingId,
  password,
  joinUrl
) => {
  try {
    const date = formatDate(startTime);
    const start = formatTime(startTime);
    const end = formatTime(endTime);

    const mailOptions = {
      from: `"${config.appName} Meeting Service" <${config.email.from}>`,
      to: to,
      subject: `Meeting Invitation: ${meetingTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Meeting Invitation</h2>
          <p>Hello ${recipientName},</p>
          <p>You have been invited to join a meeting hosted by ${hostName}.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #3498db; margin-top: 0;">${meetingTitle}</h3>
            <p style="white-space: pre-line;">${meetingDescription}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${start} - ${end}</p>
            <p><strong>Meeting ID:</strong> ${meetingId}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${joinUrl}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Meeting</a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 40px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `
    };

    // Add calendar invite attachment
    const icsContent = generateICalendarEvent(
      meetingTitle,
      meetingDescription,
      startTime,
      endTime,
      joinUrl,
      recipientName,
      hostName,
      meetingId,
      password
    );
    
    mailOptions.attachments = [
      {
        filename: 'meeting.ics',
        content: icsContent,
        contentType: 'text/calendar'
      }
    ];

    const info = await transporter.sendMail(mailOptions);
    console.log(`Meeting invitation email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending meeting invitation email:", error);
    throw error;
  }
};

/**
 * Generate iCalendar event for email attachment
 * @param {String} title - Meeting title
 * @param {String} description - Meeting description
 * @param {Date} startTime - Meeting start time
 * @param {Date} endTime - Meeting end time
 * @param {String} url - Meeting join URL
 * @param {String} attendeeName - Attendee name
 * @param {String} organizerName - Organizer name
 * @param {String} meetingId - Meeting ID
 * @param {String} password - Meeting password
 * @returns {String} iCalendar formatted string
 */
const generateICalendarEvent = (
  title,
  description,
  startTime,
  endTime,
  url,
  attendeeName,
  organizerName,
  meetingId,
  password
) => {
  // Format dates to iCalendar format (UTC)
  const formatICalDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  };

  const start = formatICalDate(new Date(startTime));
  const end = formatICalDate(new Date(endTime));
  const now = formatICalDate(new Date());
  
  // Create a unique identifier for the event
  const eventUid = `meeting-${meetingId}-${Date.now()}@${config.appDomain}`;
  
  // Build meeting details with login information
  const enhancedDescription = `
${description}

Meeting Details:
- ID: ${meetingId}
- Password: ${password}
- Join URL: ${url}

Hosted by: ${organizerName}
  `.trim();

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//${config.appName}//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${eventUid}
SUMMARY:${title}
DESCRIPTION:${enhancedDescription.replace(/\n/g, '\\n')}
LOCATION:Online Meeting
DTSTART:${start}
DTEND:${end}
DTSTAMP:${now}
STATUS:CONFIRMED
SEQUENCE:0
ORGANIZER;CN=${organizerName}:mailto:${config.email.from}
ATTENDEE;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${attendeeName}:mailto:${config.email.from}
URL:${url}
END:VEVENT
END:VCALENDAR`;
};

/**
 * Send meeting cancellation email
 * @param {String} to - Recipient email
 * @param {String} recipientName - Recipient name
 * @param {String} hostName - Meeting host name
 * @param {String} meetingTitle - Meeting title
 * @param {Date} startTime - Original meeting start time
 * @param {String} meetingId - Meeting ID
 * @returns {Promise} Email sending promise
 */
exports.sendCancellationEmail = async (
  to,
  recipientName,
  hostName,
  meetingTitle,
  startTime,
  meetingId
) => {
  try {
    const date = formatDate(startTime);
    const time = formatTime(startTime);

    const mailOptions = {
      from: `"${config.appName} Meeting Service" <${config.email.from}>`,
      to: to,
      subject: `Meeting Cancelled: ${meetingTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #e74c3c; margin-bottom: 20px;">Meeting Cancelled</h2>
          <p>Hello ${recipientName},</p>
          <p>The following meeting has been cancelled by ${hostName}:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #e74c3c; margin-top: 0;">${meetingTitle}</h3>
            <p><strong>Originally scheduled for:</strong> ${date} at ${time}</p>
            <p><strong>Meeting ID:</strong> ${meetingId}</p>
          </div>
          
          <p>Please update your calendar accordingly.</p>
          
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 40px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Meeting cancellation email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending meeting cancellation email:", error);
    throw error;
  }
};

/**
 * Send meeting reminder email
 * @param {String} to - Recipient email
 * @param {String} recipientName - Recipient name
 * @param {String} hostName - Meeting host name
 * @param {String} meetingTitle - Meeting title
 * @param {Date} startTime - Meeting start time
 * @param {Date} endTime - Meeting end time
 * @param {String} meetingId - Meeting ID
 * @param {String} password - Meeting password
 * @param {String} joinUrl - Meeting join URL
 * @returns {Promise} Email sending promise
 */
exports.sendReminderEmail = async (
  to,
  recipientName,
  hostName,
  meetingTitle,
  startTime,
  endTime,
  meetingId,
  password,
  joinUrl
) => {
  try {
    const date = formatDate(startTime);
    const start = formatTime(startTime);
    const end = formatTime(endTime);

    const mailOptions = {
      from: `"${config.appName} Meeting Service" <${config.email.from}>`,
      to: to,
      subject: `Reminder: ${meetingTitle} starts soon`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #f39c12; margin-bottom: 20px;">Meeting Reminder</h2>
          <p>Hello ${recipientName},</p>
          <p>This is a reminder that you have an upcoming meeting hosted by ${hostName}.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #f39c12; margin-top: 0;">${meetingTitle}</h3>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${start} - ${end}</p>
            <p><strong>Meeting ID:</strong> ${meetingId}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${joinUrl}" style="background-color: #f39c12; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Meeting</a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 40px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Meeting reminder email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending meeting reminder email:", error);
    throw error;
  }
};

module.exports = {
  ...exports,
  transporter // Export transporter for testing purposes
};