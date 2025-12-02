import mongoose, { Schema, Document } from "mongoose";

export interface IMember extends Document {
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  access: {
    dashboard: boolean;       // NEW
    certificateEditor: boolean;
    bgRemover: boolean;
    visitingCard: boolean;
    imageEnhancer: boolean;
    idCard: boolean;
    posterEditor: boolean;
    assets: boolean;
    settings: boolean;        // NEW
    bugReport: boolean;       // NEW
    developer: boolean;       // NEW
  };
}

const MemberSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    access: {
      // Core Features
      dashboard: { type: Boolean, default: true }, // Usually everyone gets dashboard
      
      // Tools
      posterEditor: { type: Boolean, default: false },
      certificateEditor: { type: Boolean, default: false },
      visitingCard: { type: Boolean, default: false },
      idCard: { type: Boolean, default: false },
      bgRemover: { type: Boolean, default: false },
      imageEnhancer: { type: Boolean, default: false },
      assets: { type: Boolean, default: false },
      
      // Utilities
      settings: { type: Boolean, default: true },
      bugReport: { type: Boolean, default: true },
      developer: { type: Boolean, default: false }, // Restricted by default
    },
  },
  { timestamps: true }
);

export const Member =
  mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema);