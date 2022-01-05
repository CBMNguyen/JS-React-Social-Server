const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    gender: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, default: "" },
    birthday: { type: Date, default: Date.now },
    password: { type: String, required: true, min: 8 },
    profilePicture: { type: Array, default: [] },
    coverPicture: { type: Array, default: [] },
    friends: { type: Array, default: [] },
    notifications: { type: Array, default: [] },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    desc: { type: String },
    city: { type: String },
    from: { type: String },
    relationship: { type: String, default: "Độc thân" },
    latestOnline: { type: Date, default: Date.now },
  },
  { timestamps: true },
  { versionKey: false }
);

module.exports = mongoose.model("User", UserSchema);
