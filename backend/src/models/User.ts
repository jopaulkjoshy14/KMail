import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  pqcPublicKeys: {
    kyber?: string;
    dilithium?: string;
  };
  encryptedPrivateKeys: {
    kyber?: string;
    dilithium?: string;
  };
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  pqcPublicKeys: {
    kyber: String,
    dilithium: String
  },
  encryptedPrivateKeys: {
    kyber: String,
    dilithium: String
  },
  createdAt: { type: Date, default: () => new Date() }
});

export default model<IUser>("User", userSchema);
