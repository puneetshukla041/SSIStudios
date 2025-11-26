import mongoose, { Schema, model, models } from "mongoose";

const IdCardSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
    },
    idCardNo: {
      type: String,
      required: [true, "ID Card Number is required"],
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    userImage: {
      type: String, // Base64 string or URL
      default: "",
    },
    // storing offsets to persist image positioning
    imageXOffset: {
      type: Number,
      default: 0,
    },
    imageYOffset: {
      type: Number,
      default: 0,
    },
    email: {
      type: String, // Useful for administrative searching
      default: "",
    },
  },
  { timestamps: true }
);

const IdCard = models.IdCard || model("IdCard", IdCardSchema);

export default IdCard;