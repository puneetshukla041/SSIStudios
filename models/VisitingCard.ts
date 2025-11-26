import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IVisitingCard {
  firstName: string;
  lastName: string;
  designation: string;
  phone: string;
  email: string;
}

export interface IVisitingCardDocument extends IVisitingCard, Document {}

const VisitingCardSchema: Schema<IVisitingCardDocument> = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First Name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
  },
  {
    timestamps: true,
  }
);

const VisitingCard: Model<IVisitingCardDocument> =
  (mongoose.models.VisitingCard as Model<IVisitingCardDocument>) ||
  mongoose.model<IVisitingCardDocument>('VisitingCard', VisitingCardSchema);

export default VisitingCard;