import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("MONGO_URI present?", !!process.env.MONGO_URI);
console.log("MONGO_URI =", process.env.MONGO_URI);

mongoose.set("strictQuery", true);

try {
  console.log("Connecting...");
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("✅ Connected");
  await mongoose.disconnect();
  console.log("✅ Disconnected");
} catch (e) {
  console.error("❌ Failed:", e.name, e.message);
  if (e.reason) console.error("Reason:", e.reason?.message || e.reason);
  process.exit(1);
}
