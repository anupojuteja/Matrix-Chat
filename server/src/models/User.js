import mongoose from "mongoose";
import bcrypt from "bcrypt";

const KeySchema = new mongoose.Schema(
  { identityKey: String, signedPreKey: String, signature: String },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    e2ee: KeySchema,
    avatarUrl: String
  },
  { timestamps: true }
);

UserSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};
UserSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model("User", UserSchema);
