import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemState extends Document {
  key: string;
  value: boolean;
}

const SystemStateSchema = new Schema(
  {
    key: { type: String, required: true, unique: true }, // We will use 'global_crash' as the key
    value: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent model recompilation error in Next.js development HMR
export const SystemState = mongoose.models.SystemState || mongoose.model<ISystemState>('SystemState', SystemStateSchema);