export default {
    "prefix": "!", // Prefix
    "BOT_NAME": "Thiệu Trung Kiên", // Bot Name
    "ADMIN_IDS": ["100056992160405"], // ADMIN UID
    "options": {
        "forceLogin": true,
        "listenEvents": true,
        "listenTyping": false,
        "logLevel": "silent",
        "updatePresence": true,
        "selfListen": true
    },
    database: {
        type: "json", // json or mongodb
        mongodb: {
            uri: "mongodb://0.0.0.0:27017" // If you're using type mongodb, enter the mongodb uri!
        }
    },
    autoUptime: {
      status: true, // Replit, Glitch is recommended to be true
      timeSleep: 5000 // 5 seconds
    },
    port: process.env.PORT || 3000,
    mqtt_refresh: 1200000 // Thời gian mqtt sẽ refresh
};
