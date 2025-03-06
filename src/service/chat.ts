import { validationResult } from "express-validator";
import { Chat,Request, Message } from "../dataBase/models/chat.js";
import { User } from "../dataBase/models/user.js";
import { ErrorHandle } from "../utils/errorHandling.js";

export const newGroupChat = async (req, res, next) => {
  try {
    const file = req.file;
    const { chatName, members } = req.body;
    if (!chatName || !members || !file)
      return next(new ErrorHandle("please enter all fields", 400));
    if (members.length < 3)
      return next(new ErrorHandle("members can not be less than 3", 400));
    const chat = new Chat({
      chatName,
      members,
      file: file.buffer.toString("base64"),
      groupChat: true,
    });
    await chat.save();
    res
      .json({
        message: "group chat created sucessfully",
        success: true,
      })
      .status(201);
  } catch (error) {
    console.log(error);
    return next(
      new ErrorHandle(
        "failed to create  group chat , please try again or try some time later",
        500
      )
    );
  }
};

export const requestSend = async (req, res, next) => {
  const { sender, receiver } = req.body;
  if (!sender) return next(new ErrorHandle("please login first ", 401));
  if (!sender || receiver)
    return next(new ErrorHandle("please enter both sender and receiver", 400));
  const request = await Request.create({
    sender,
    receiver,
    status: "pending",
  });
  if (request)
    return res
      .json({ success: true, message: "request created sucessfully" })
      .status(201);
};

export const Requests = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) return next(new ErrorHandle("please login first", 401));
    const user = User.findById(id);
    if (!user) return next(new ErrorHandle("user not found", 400));
    const result = await Request.find({ receiver: id });
    res.json({ sucess: true, result }).status(200);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandle("failed to get requests", 500));
  }
};

export const changeStatus = async (req, res, next) => {
  try {
    const { chatId, requestId, status } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new ErrorHandle("chat not found", 400));
    }
    const request = await Request.findById(requestId);
    if (!request) {
      return next(new ErrorHandle("request not found", 400));
    }
    const receiver = await User.findById(request.receiver);
    if (!receiver) {
      return next(new ErrorHandle("user not found", 400));
    }
    const sender = await User.findById(request.sender);
    if (!sender) {
      return next(new ErrorHandle("user not found", 400));
    }

    switch (status) {
      case "Accept":
        request.status = "accepted";
        await Chat.create({
          members: [request.receiver, request.sender],
          groupChat: false,
          avatar: sender.avatar,
          chat: chatId,
        });
        await res
          .json({
            success: true,
            message: `${sender.name} is your friend now`,
          })
          .status(200);
        break;
      case "Block":
        request.status = "block";
        await res
          .json({
            success: true,
            message: `${sender.name} blocked`,
          })
          .status(200);
        break;
      case "Reject":
        if (request.status === "pending") {
          request.status = "rejected";
          await res
            .json({
              success: true,
              message: `${sender.name} rejected`,
            })
            .status(200);
        }
        break;
      default:
        request.status = "pending";
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandle("failed to change status", 500));
  }
};
export const getNotifications = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      return next(new ErrorHandle("please login first", 401));
    }
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandle("user not found", 400));
    }
    const notifications = await Notification.find({ receiver: id });
    await res
      .json({
        success: true,
        notifications,
      })
      .status(200);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandle("failed to get notifications", 500));
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandle("please enter all fields", 500));
    }
    const { chatId } = req.params;
    if (!chatId) return next(new ErrorHandle("please provide chatId", 400));
    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ErrorHandle("chat not found", 400));
    const { message, senderId, receiverId } = req.body;
    const newMessage = {
      sender: senderId,
      receiver: receiverId,
      content: message,
      chat: chatId,
    };
    const data = await Message.create(newMessage);
    res.json({ success: true, data });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandle("failed to sendMessage", 500));
  }
};
export const sendAttachment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandle("please enter all fields", 500));
    }
    const { chatId } = req.params;
    if (!chatId) return next(new ErrorHandle("please provide chatId", 400));
    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ErrorHandle("chat not found", 400));
    const { file, senderId, receiverId } = req.body;
    const newMessage = {
      sender: senderId,
      receiver: receiverId,
      content: "",
      file: file.buffer.toString(),
      chat: chatId,
    };
    const data = await Message.create(newMessage);
    res.json({ success: true, data });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandle("failed to create message", 500));
  }
};

export const getChat = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandle("please provide chatId", 400));
    }
    const { chatId } = req.body;
    if (!chatId) return next(new ErrorHandle("please provide chatId", 400));
    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ErrorHandle("chat not found", 400));
    res.json({ success: true, chat });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandle("failed to get chat", 500));
  }
};

export const getAllChats = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandle("please login first", 401));
    }
    const { id } = req.body;
    if (!id) return next(new ErrorHandle("please login first", 401));
    const user = await User.findById(id);
    if (!user) return next(new ErrorHandle(" user not found", 400));
    const allChats = await Chat.find({ members: id });
    if (!allChats)
      return next(new ErrorHandle("please create a chat first", 400));
    res.json({ success: true, allChats });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandle("failed to get allChats", 500));
  }
};
export const getAllMessages = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandle("please provide chatId and id", 400));
    }
    const { chatId } = req.params;
    if (!chatId) return next(new ErrorHandle("please provide chatId", 400));
    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ErrorHandle("chat not found", 400));
    const { id } = req.body;
    if (!id) return next(new ErrorHandle("please login first", 401));
    const user = await User.findById(id);
    if (!user) return next(new ErrorHandle("user not found", 400));
    const allMessages = await Message.find({
      $and: [{ $or: [{ receiver: id }, { sender: id }] }, { chat: chatId }],
    });
    if (!allMessages)
      return next(new ErrorHandle("please create a message first", 400));
    res.json({ success: true, allMessages });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandle("failed to get messages", 500));
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new ErrorHandle("please provide chatId, messageId and id", 400)
      );
    }
    const { chatId } = req.params;
    if (!chatId) return next(new ErrorHandle("please provide chatId", 400));
    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ErrorHandle("chat not found", 400));
    const { messageId } = req.params;
    if (!messageId)
      return next(new ErrorHandle("please provide messageId", 400));
    const { id } = req.body;
    if (!id) return next(new ErrorHandle("please login first", 401));
    const user = await User.findById(id);
    if (!user) return next(new ErrorHandle("user not found", 400));
    const message = await Message.findOneAndDelete({
      _id: messageId,
      sender: id,
      chat: chatId,
    });
    if (!message)
      return next(new ErrorHandle("please create a message first", 400));
    res.json({ success: true, message: "message deleted successfully" });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandle("failed to delete message", 500));
  }
};

export const updateMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new ErrorHandle("please provide chatId, messageId, id and message", 400)
      );
    }
    const { chatId } = req.params;
    if (!chatId) return next(new ErrorHandle("please provide chatId", 400));
    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ErrorHandle("chat not found", 400));
    const { messageId } = req.params;
    if (!messageId)
      return next(new ErrorHandle("please provide messageId", 400));
    const { id } = req.body;
    if (!id) return next(new ErrorHandle("please login first", 401));
    const user = await User.findById(id);
    if (!user) return next(new ErrorHandle("user not found", 400));
    const { message } = req.body;
    if (!message) return next(new ErrorHandle("please provide message", 400));
    const updatedMessage = await Message.findOneAndUpdate(
      { _id: messageId, sender: id, chat: chatId },
      message
    );
    if (!updatedMessage)
      return next(new ErrorHandle("please create a message first", 400));
    res.json({ success: true, message: "message updated successfully" });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandle("failed to update message", 500));
  }
};
export const deleteChat = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandle("please provide chatId and id", 400));
    }
    const { chatId } = req.params;
    if (!chatId) return next(new ErrorHandle("please provide chatId", 400));
    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ErrorHandle("chat not found", 400));
    const { id } = req.body;
    if (!id) return next(new ErrorHandle("please login first", 401));
    const user = await User.findById(id);
    if (!user) return next(new ErrorHandle("user not found", 400));
    const deletedChat = await Chat.findOneAndDelete({
      _id: chatId,
      members: id,
    });
    if (!deletedChat)
      return next(new ErrorHandle("please create a chat first", 400));
    res.json({ success: true, message: "chat deleted successfully" });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandle("failed to delete chat", 500));
  }
};
