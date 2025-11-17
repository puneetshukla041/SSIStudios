import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBugReport extends Document {
    userId: string;
    title: string;
    username: string;
    description: string;
    rating: number;
    status: string;
    createdAt: Date;
}

const BugReportSchema: Schema<IBugReport> = new Schema(
    {
        userId: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true, // Must ensure client sends a non-empty string
            trim: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        status: {
            type: String,
            default: "Open",
            enum: ["Open", "In Progress", "Resolved", "Closed"],
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// This ensures the model is not redefined on hot reload in Next.js
const BugReport: Model<IBugReport> =
    mongoose.models.BugReport || mongoose.model<IBugReport>("BugReport", BugReportSchema);

export default BugReport;