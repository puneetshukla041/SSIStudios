// BugReport Model File (e.g., D:\studiosadmin\studiosadmin\models\BugReport.ts)

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBugReport extends Document {
    userId: string;
    title: string;
    username: string;
    description: string;
    rating: number;
    status: string;
    createdAt: Date;
    // TypeScript definition for the resolution message
    resolutionMessage?: string; 
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
        username: {
            type: String,
            required: true, 
            trim: true,
        },
        description: {
            type: String,
            required: true, 
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
        // Mongoose schema definition for the resolution message
        resolutionMessage: {
            type: String,
            required: false, // Allows it to be empty until resolved
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// This ensures the model is not redefined on hot reload in Next.js
const BugReport: Model<IBugReport> =
    (mongoose.models.BugReport as Model<IBugReport>) || mongoose.model<IBugReport>("BugReport", BugReportSchema);

export default BugReport;