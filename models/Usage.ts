import mongoose, { Schema, model, models } from "mongoose";

const UsageSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  seconds: { type: Number, default: 0 }, // total time in seconds
  updatedAt: { type: Date, default: Date.now },
});

const Usage = models.Usage || model("Usage", UsageSchema);

export default Usage;
