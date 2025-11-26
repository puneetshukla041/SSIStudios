// models/Asset.ts
import mongoose, { Schema, model, models } from "mongoose";

const AssetSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String, // e.g., 'removed-bg'
      default: "general",
    },
    contentType: {
      type: String, // e.g., 'image/png'
      required: true,
    },
    data: {
      type: Buffer, // <--- This stores the actual binary image data
      required: true,
    },
    size: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Prevent model recompilation error in development
const Asset = models.Asset || model("Asset", AssetSchema);

export default Asset;