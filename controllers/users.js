const bcrypt = require("bcrypt");
const User = require("../models/User");
const Conversation = require("../models/Conversation");

const serverError = require("../utils/serverError");

// update user
module.exports.update = async (req, res) => {
  if (req.user.userId === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return serverError(res, error);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (error) {
      return serverError(res, error);
    }
  } else {
    return res
      .status(403)
      .json({ message: "You can update only your account!" });
  }
};

// delete user
module.exports.delete = async (req, res) => {
  if (req.user.userId === req.params.id || req.user.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Account has been deleted" });
    } catch (error) {
      return serverError(res, error);
    }
  } else {
    return res
      .status(403)
      .json({ message: "You can update only your account!" });
  }
};

// get a user
module.exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User does not exist" });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json({ message: "Fetch me success", user: other });
  } catch (error) {
    serverError(res, error);
  }
};

// get a user by ID
module.exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User does not exist" });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json({ user: other });
  } catch (error) {
    serverError(res, error);
  }
};

// get a user by Name or Phone
module.exports.getByName = async (req, res) => {
  try {
    const user = await User.find();
    const other = user
      .filter(
        (u) =>
          u.username.toLowerCase().indexOf(req.params.name.toLowerCase()) !==
            -1 ||
          u.phone.toLowerCase().indexOf(req.params.name.toLowerCase()) !== -1
      )
      .map((u) => {
        const { password, updatedAt, ...other } = u._doc;
        return other;
      });

    res.status(200).json({ user: other });
  } catch (error) {
    serverError(res, error);
  }
};

// get Friends of user

module.exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const friends = await Promise.all(
      user.followings.map((friendId) => User.findById(friendId))
    );
    let friendList = [];
    friends.map((friend) => {
      const {
        _id,
        username,
        profilePicture,
        latestOnline,
        followings,
        followers,
      } = friend;
      friendList.push({
        _id,
        username,
        profilePicture,
        latestOnline,
        followings,
        followers,
      });
    });
    res.status(200).json({ message: "Fetch friends successfully", friendList });
  } catch (error) {
    serverError(res, error);
  }
};

// add friend
module.exports.addFriend = async (req, res) => {
  if (req.user.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user.userId);

      if (!currentUser.friends.includes(req.params.id)) {
        await user.updateOne({ $push: { friends: req.user.userId } });
        await currentUser.updateOne({ $push: { friends: req.params.id } });
        return res.status(200).json({ message: "user has been added" });
      } else {
        return res.status(403).json({ message: "you already add this user" });
      }
    } catch (error) {
      serverError(res, error);
    }
  } else {
    res.status(403).json({ message: "You can't add yourself" });
  }
};

// unfriend
module.exports.unFriend = async (req, res) => {
  if (req.user.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user.userId);

      if (currentUser.friends.includes(req.params.id)) {
        await user.updateOne({ $pull: { friends: req.user.userId } });
        await currentUser.updateOne({ $pull: { friends: req.params.id } });
        return res.status(200).json({ message: "user has been remove" });
      } else {
        return res
          .status(403)
          .json({ message: "you can't unfriend this user" });
      }
    } catch (error) {
      serverError(res, error);
    }
  } else {
    res.status(403).json({ message: "You can't add yourself" });
  }
};

// follow a user
module.exports.follow = async (req, res) => {
  if (req.user.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user.userId);

      const conversation = await Conversation.findOne({
        members: { $all: [req.user.userId, req.params.id] },
      });

      if (!conversation) {
        const newConversation = new Conversation({
          members: [req.user.userId, req.params.id],
        });
        await newConversation.save();
      }

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.user.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        return res.status(200).json({ message: "user has been followed" });
      } else {
        return res
          .status(403)
          .json({ message: "you already follow this user" });
      }
    } catch (error) {
      serverError(res, error);
    }
  } else {
    res.status(403).json({ message: "You can't follow yourself" });
  }
};

// un follow a user
module.exports.unfollow = async (req, res) => {
  if (req.user.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user.userId);
      if (user.followers.includes(req.user.userId)) {
        await user.updateOne({ $pull: { followers: req.user.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json({ message: "user has been unfollowed" });
      } else {
        res.status(403).json({ message: "you dont unfollow this user" });
      }
    } catch (error) {
      serverError(res, error);
    }
  } else {
    res.status(403).json({ message: "You can't unfollow yourself" });
  }
};

// add notifications
module.exports.addnotification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user.notifications.includes(req.user.userId)) {
      await user.updateOne({ $push: { notifications: req.user.userId } });
      res.status(200).json({ message: "add notification success" });
    } else {
      res.status(403).json({ message: "you dont add this notification" });
    }
  } catch (error) {
    serverError(res, error);
  }
};

// remove notifications
module.exports.removenotification = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.notifications.includes(req.params.id)) {
      await user.updateOne({ $pull: { notifications: req.params.id } });
      res.status(200).json({ message: "remove notification success" });
    } else {
      res.status(403).json({ message: "you dont remove this notification" });
    }
  } catch (error) {
    serverError(res, error);
  }
};
