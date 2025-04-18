import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    isInappropriate: {
      type: Boolean,
      default: false,
    },
    isInappropriateImage: {
      type: Boolean,
      default: false,
    },
    chatType: {
      type: String,
      enum: ["regular", "business"],
      default: "regular",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
