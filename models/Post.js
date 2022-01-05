const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    desc: { type: String, max: 500 },
    img: { type: String },
    likes: { type: Array, default: [] },
    comments: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, required: true },
          text: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now },
          likes: { type: Array, default: [] },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
  { versionKey: false }
);

module.exports = mongoose.model("Post", PostSchema);
