import { GridFSBucket } from 'mongodb';
import multer from 'multer';
import { connectDB } from './db.js';
import config from '../config/index.js';

let gfsBucket;
const connPromise = connectDB().then((mongooseInstance) => {
  const db = mongooseInstance.connection.db;
  gfsBucket = new GridFSBucket(db, { bucketName: 'attachments' });
  return gfsBucket;
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: config.MAX_ATTACHMENT_SIZE_MB * 1024 * 1024 },
});

export const uploadAttachment = upload.single('file');

export const getGfsBucket = async () => {
  if (gfsBucket) return gfsBucket;
  return connPromise;
};
