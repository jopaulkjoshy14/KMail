import { Schema, model, Document } from "mongoose";

export interface IMessage extends Document {
  sender: Schema.Types.ObjectId;
  recipient: Schema.Types.ObjectId;
  ciphertext: string;
  signature: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  ciphertext: { type: String, required: true },
  signature: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date(), index: true }
});

export default model<IMessage>("Message", messageSchema);
