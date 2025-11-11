import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) throw new Error("MONGO_URI missing");
  console.log("DB: attempting to connect...");
  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => console.log("✅ Mongoose event: connected"));
  mongoose.connection.on("error", (err) => console.error("❌ Mongoose event: error", err.message));
  mongoose.connection.on("disconnected", () => console.log("⚠️  Mongoose event: disconnected"));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("✅ Mongo connected");
}
