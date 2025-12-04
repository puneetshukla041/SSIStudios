import mongoose, { Document, Schema, Model } from 'mongoose';
// Interface for the document data
export interface ICertificate {
  certificateNo: string;
  name: string;
  hospital: string;
  doi: string; // Stored as DD-MM-YYYY string
}
// Interface for the document with Mongoose properties
export interface ICertificateDocument extends ICertificate, Document {}
// Define the schema
const CertificateSchema: Schema<ICertificateDocument> = new Schema(
  {
    certificateNo: {
      type: String,
      required: [true, 'Certificate No. is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    hospital: {
      type: String,
      required: [true, 'Hospital is required'],
      trim: true,
    },
    doi: {
      type: String,
      required: [true, 'DOI (Date of Issue) is required'],
      // Basic format validation
      match: [/^\d{2}-\d{2}-\d{4}$/, 'DOI must be in DD-MM-YYYY format'],
    },
  },
  {
    timestamps: true,
  }
);
// Create the model, checking if it already exists to prevent re-compilation in development
const Certificate: Model<ICertificateDocument> =
  (mongoose.models.Certificate as Model<ICertificateDocument>) ||
  mongoose.model<ICertificateDocument>('Certificate', CertificateSchema);
export default Certificate;
