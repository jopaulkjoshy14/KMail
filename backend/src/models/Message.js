import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderUsernameHash: String,
  receiverUsernameHash: String,
  encryptedSubject: String,
  encryptedBody: String,
  attachmentIds: [mongoose.Schema.Types.ObjectId],
  safeLinkToken: String,
  signature: String,
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  deleted: {
    sender: { type: Boolean, default: false },
    receiver: { type: Boolean, default: false },
  },
  folder: { type: String, enum: ['Inbox', 'Sent', 'Drafts'], default: 'Inbox' },
});

export default mongoose.model('Message', messageSchema);
