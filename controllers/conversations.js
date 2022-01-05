const Conversation = require("../models/Conversation");
const serverError = require("../utils/serverError");

// Create Conversation
module.exports.create = async (req, res) => {
  try {
    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });
    const savedConversation = await newConversation.save();
    res.status(200).json({ savedConversation });
  } catch (error) {
    serverError(res, error);
  }
};

// Get Conversation of User
module.exports.getUser = async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json({ conversation });
  } catch (error) {
    serverError(res, error);
  }
};

// get conversation includes two userId

module.exports.getConversationTwoUser = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json({ conversation });
  } catch (error) {
    serverError(res, error);
  }
};
