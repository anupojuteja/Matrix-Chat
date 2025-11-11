import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    to:   { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    cipherText: { type: String, required: true },
    nonce: { type: String, required: true },
    ephPub: { type: String },
    seen: { type: Boolean, default: false, index: true },
    ttlSeconds: { type: Number, default: 0 },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

// Auto-purge after expiresAt
MessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Message = mongoose.model("Message", MessageSchema);
