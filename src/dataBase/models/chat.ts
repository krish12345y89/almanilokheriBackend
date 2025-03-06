import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  chatName: {
    type: String,
    required: [true, "please enter chatName"],
  },
  members: [{
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "members must be more than one"]
    }
  }],
  avatar: {
    type: String,
    required: true
  },
  groupChat: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const requestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  receiver: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "block"],
    default: "pending"
  }
}, {
  timestamps: true
});

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  file: {
    type: String
  },
  sender: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required:true
  },
  receiver: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required:true
  },
  chat:{
    type:mongoose.Types.ObjectId,
    ref:"Chat",
    required:true
  }
});

export const Chat = mongoose.model("Chat", chatSchema);
export const Request = mongoose.model("Request", requestSchema);
export const Message = mongoose.model("Message", messageSchema);