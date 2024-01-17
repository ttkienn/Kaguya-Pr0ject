export default {
  "prefix": "!",  // Bot prefix for command invocation
  "language": "vi_VN",  // Language setting for the bot
  "BOT_NAME": "Thieu Trung Kien",  // The name of the bot
  "ADMIN_IDS": ["100056992160405"],  // Admin IDs who have special privileges

  // Bot configuration options
  "options": {
    "forceLogin": true,  // Force the bot to log in
    "listenEvents": true,  // Listen for events
    "listenTyping": false,  // Disable listening to typing events
    "logLevel": "silent",  // Log level for the bot (silent, debug, etc.)
    "updatePresence": true,  // Update the presence of the bot
    "selfListen": true,  // Allow the bot to listen to itself
    "userAgent": "Mozilla/5.0 (Linux; Android 9; SM-G973U Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36"  // User agent for the bot's interactions
  },

  // Database configuration
  "database": {
    "type": "json",  // Type of database ( json or mongodb )
    "mongodb": {
      // MongoDB URI for database connection (Only if the database type is MongoDB)
      "uri": "mongodb://0.0.0.0:27017"
    }
  },

  "port": process.env.PORT || 3000,  // Port on which the bot will run
  "mqtt_refresh": 1200000,  // MQTT refresh interval
  "autoRestart": 30 // 30 minutes
};
