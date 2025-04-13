// utils/statusScheduler.js
const cron = require('node-cron');
const { checkAndUpdateHostStatuses } = require('../controllers/hostController');

// Schedule to run every 5 minutes
const scheduleStatusUpdates = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Running scheduled task: Checking host active statuses');
      const updatedCount = await checkAndUpdateHostStatuses();
      console.log(`Status check complete: ${updatedCount} host statuses updated to inactive`);
    } catch (error) {
      console.error('Error running scheduled host status check:', error);
    }
  });
  
  console.log('Host status update scheduler initialized');
};

module.exports = { scheduleStatusUpdates };