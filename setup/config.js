export default {
  "prefix": "!",
  "language": "vi_VN",
  "BOT_NAME": "Thiệu Trung Kiên",
  "ADMIN_IDS": ["100056992160405"],
  "options": {
    "forceLogin": true,
    "listenEvents": true,
    "listenTyping": false,
    "logLevel": "silent",
    "updatePresence": true,
    "selfListen": true,
    "userAgent": "Mozilla/5.0 (Linux; Android 9; SM-G973U Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36"
  },
  "database": {
    "type": "json",
    "mongodb": {
      "uri": "mongodb://0.0.0.0:27017"
    }
  },
  "port": 3000,
  "mqtt_refresh": 1200000
};