import mongoose from "mongoose";
import config from "../../setup/config.js";
const { Schema } = mongoose;
const bannedSchema = new Schema({
    status: { type: Boolean, default: false },
    reason: { type: String, default: null },
    time: { type: Number, default: null },
});
const antiSchema = new Schema({
    nameBox: { type: Boolean, default: false},
    imageBox: { type: Boolean, default: false}
})
const threadSchema = new Schema({
    threadID: { type: String, required: true },
    data: {
        name: { type: String, default: null },
        emoji: { type: String, default: null },
        prefix: { type: String, default: null },
        members: { type: Number, default: 0 },
        adminIDs: { type: Array, default: [] },
        approvalMode: { type: Boolean, default: false },
        banned: bannedSchema,
        threadThumbnail: { type: String, default: null },
        anti: antiSchema,
        other: Object
    },
});
export default mongoose.model("threads", threadSchema);
