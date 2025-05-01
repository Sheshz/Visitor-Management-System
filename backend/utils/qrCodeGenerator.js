const QRCode = require('qrcode');

// Generate QR code data URL from meeting details
const generateMeetingQR = async (meetingId, accessCode) => {
  try {
    // Data to encode in QR code
    const data = JSON.stringify({
      meetingId,
      accessCode,
      timestamp: Date.now()
    });
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(data);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = { generateMeetingQR };