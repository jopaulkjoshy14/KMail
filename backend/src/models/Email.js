import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipients: [{ type: String, required: true }],
    subject: { type: String },
    content: { type: String, required: true }, // encrypted content
  },
  { timestamps: true }
);

const Email = mongoose.model("Email", emailSchema);
export default Email;
