import mongoose from "mongoose";
const { Schema } = mongoose;
const bannedSchema = new Schema({
  status: { type: Boolean, default: false },
  reason: { type: String, default: null },
  time: { type: Number, default: null },
});
const userSchema = new Schema({
  uid: { type: Number, required: true },
  data: {
    money: { type: Number, default: 0 },
    exp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    banned: bannedSchema,
    name: { type: String, default: null },
    firstName: { type: String, default: null },
    vanity: { type: String, default: null },
    avatar: { type: String, default: null },
    gender: { type: String, default: null },
    type: { type: String, default: null },
    profileUrl: { type: String, default: null },
    isFriend: { type: Boolean, default: false },
    isBirthday: { type: Boolean, default: false },
    other: Object
  },
});
export default mongoose.model("users", userSchema);
