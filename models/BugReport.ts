// models/BugReport.ts
import mongoose, { Schema, Document, models } from "mongoose";

export interface IBugReport extends Document {
  userId: string;
  title: string;
  description: string;
  rating: number;
  status: string;
  createdAt: Date;
}

const BugReportSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    status: { type: String, default: "Open" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.BugReport || mongoose.model<IBugReport>("BugReport", BugReportSchema);
