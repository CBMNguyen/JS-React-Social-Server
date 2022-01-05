const Message = require("../models/Message");
const serverError = require("../utils/serverError");

// Create Message
module.exports.create = async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.status(200).json({ savedMessage });
  } catch (error) {
    serverError(res, error);
  }
};

// get message from conversation
module.exports.get = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json({ messages });
  } catch (error) {
    serverError(res, error);
  }
};
