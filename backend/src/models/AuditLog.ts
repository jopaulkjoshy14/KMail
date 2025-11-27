import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Types.ObjectId, ref: "User" },
  action: String,
  resource_type: String,
  resource_id: String,
  details: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: Date.now },
});

export const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
