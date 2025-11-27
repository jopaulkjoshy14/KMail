import mongoose from 'mongoose';


const AuditLogSchema = new mongoose.Schema({
user_id: { type: mongoose.Types.ObjectId, ref: 'User' },
action: { type: String },
resource_type: { type: String },
resource_id: { type: String },
details: { type: mongoose.Schema.Types.Mixed },
created_at: { type: Date, default: Date.now }
});


export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
