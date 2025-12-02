import mongoose, { Schema, model, models } from "mongoose";

const UsageSchema = new Schema({
  userId: { type: String, required: true }, // Changed to String to match typical Auth IDs, or keep ObjectId if consistent
  minutes: { type: Number, default: 0 }, // Stores total time in minutes (e.g., 1.5 = 1m 30s)
  updatedAt: { type: Date, default: Date.now },
});

const Usage = models.Usage || model("Usage", UsageSchema);

export default Usage;