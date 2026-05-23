const cron = require('node-cron');
const User = require('../models/User');

const cleanupExpiredTokens = () => {
  // run every 2 hour
  cron.schedule('*/10 * * * *', async () => {
    console.log("Running token cleanup...");

    try {
      const users = await User.find();

      for (let user of users) {
        const before = user.refreshTokens.length;

        user.refreshTokens = user.refreshTokens.filter(
          t => t.expiresAt && t.expiresAt > new Date()
        );

        if (user.refreshTokens.length !== before) {
          await user.save();
        }
      }

      console.log("Cleanup completed");
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  });
};

module.exports = cleanupExpiredTokens;