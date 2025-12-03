import { Schema, model, Document } from "mongoose";

export interface IAuditLog extends Document {
  user: Schema.Types.ObjectId;
  action: string;
  details?: any;
  createdAt: Date;
}

const auditSchema = new Schema<IAuditLog>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },
  action: { type: String, required: true },
  details: Schema.Types.Mixed,
  createdAt: { type: Date, default: () => new Date(), index: true }
});

export default model<IAuditLog>('AuditLog', auditSchema);
