import mongoose from "mongoose";

export async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      dbName: "kmail",
    });

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
