import mongoose, { Schema, Document } from "mongoose";

export interface IMember extends Document {
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  access: {
    posterEditor: boolean;
    certificateEditor: boolean;
    visitingCard: boolean;
    idCard: boolean;
    bgRemover: boolean;
    imageEnhancer: boolean;
    assets: boolean;
  };
}

const MemberSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    access: {
      posterEditor: { type: Boolean, default: false },
      certificateEditor: { type: Boolean, default: false },
      visitingCard: { type: Boolean, default: false },
      idCard: { type: Boolean, default: false },
      bgRemover: { type: Boolean, default: false },
      imageEnhancer: { type: Boolean, default: false },
      assets: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const Member =
  mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema);