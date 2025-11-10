// models/Counter.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  _id: string;
  sequenceValue: number;
}

const CounterSchema: Schema = new Schema({
  _id: { type: String, required: true },
  sequenceValue: { type: Number, default: 0 },
});

const Counter = mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);

export default Counter;