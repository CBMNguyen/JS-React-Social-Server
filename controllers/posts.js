const Post = require("../models/Post");
const User = require("../models/User");
const serverError = require("../utils/serverError");
const cloudinary = require("../utils/cloudinary.config");

// create post
module.exports.create = async (req, res) => {
  req.body.userId = req.user.userId;
  req.body.img = "";

  try {
    if (req.file) {
      // Upload to cloud
      req.body.img = await cloudinary.upload(
        req.file.path,
        process.env.CLOUD_FOLDER_UPLOAD
      );
      console.log(req.body.img);
    }

    const newPost = new Post(req.body);

    const savedPost = await newPost.save();
    res.status(201).json({ message: "success", post: savedPost });
  } catch (error) {
    console.log(error);
    serverError(res, error);
  }
};

// update post
module.exports.update = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json({ message: "The post has been updated" });
    } else {
      res.status(403).json({ message: "you can update only your post" });
    }
  } catch (error) {
    serverError(res, error);
  }
};

// delete a post
module.exports.delete = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.user.userId) {
      await post.deleteOne();
      res.status(200).json({ message: "The post has been deleted" });
    } else {
      res.status(403).json({ message: "you can delete only your post" });
    }
  } catch (error) {
    serverError(res, error);
  }
};

// like&dislike a post
module.exports.likeAndDislike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.some((like) => like.userId === req.user.userId)) {
      await post.updateOne({
        $push: { likes: { userId: req.user.userId, state: req.body.state } },
      });
      res.status(200).json({ message: "The post has been liked" });
    } else {
      if (
        post.likes.some(
          (like) =>
            like.userId === req.user.userId && like.state === req.body.state
        )
      ) {
        await post.updateOne({ $pull: { likes: { userId: req.user.userId } } });
        res.status(200).json({ message: "The post has been disliked" });
      } else {
        await post.updateOne({ $pull: { likes: { userId: req.user.userId } } });
        await post.updateOne({
          $push: { likes: { userId: req.user.userId, state: req.body.state } },
        });
        res.status(200).json({ message: "The post has been changed" });
      }
    }
  } catch (error) {
    serverError(res, error);
  }
};

// like&dislike a comment
module.exports.likeAndDislikeComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = post.comments.find(
      (comment) => comment._id.valueOf() === req.body.commentId
    );

    if (!comment.likes.some((comment) => comment.userId === req.user.userId)) {
      await post.updateOne(
        {
          $push: {
            "comments.$[elem].likes": {
              userId: req.user.userId,
              state: req.body.state,
            },
          },
        },
        { arrayFilters: [{ "elem._id": comment._id.valueOf() }] }
      );
      res.status(200).json({ message: "The post has been liked" });
    } else {
      if (
        comment.likes.some(
          (comment) =>
            comment.userId === req.user.userId &&
            comment.state === req.body.state
        )
      ) {
        await post.updateOne(
          { $pull: { "comments.$[elem].likes": { userId: req.user.userId } } },
          { arrayFilters: [{ "elem._id": comment._id.valueOf() }] }
        );
        res.status(200).json({ message: "The post has been disliked" });
      } else {
        await post.updateOne(
          { $pull: { "comments.$[elem].likes": { userId: req.user.userId } } },
          { arrayFilters: [{ "elem._id": comment._id.valueOf() }] }
        );
        await post.updateOne(
          {
            $push: {
              "comments.$[elem].likes": {
                userId: req.user.userId,
                state: req.body.state,
              },
            },
          },
          { arrayFilters: [{ "elem._id": comment._id.valueOf() }] }
        );
        res.status(200).json({ message: "The post has been changed state" });
      }
    }
  } catch (error) {
    serverError(res, error);
  }
};

// like&dislike a post
module.exports.createComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    await post.updateOne({
      $push: { comments: { userId: req.user.userId, text: req.body.text } },
    });
    const newposts = await Post.findById(req.params.id);
    const comments = await newposts.comments;

    res.status(200).json({
      message: "The post has been commented",
      comment: comments[comments.length - 1],
    });
  } catch (error) {
    serverError(res, error);
  }
};

// get a post
module.exports.getById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ message: "The post does not exist" });
    res.status(200).json({ post });
  } catch (error) {
    serverError(res, error);
  }
};

// get timeline post
module.exports.getTimeLine = async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => Post.find({ userId: friendId }))
    );
    res.status(200).json({ posts: userPosts.concat(...friendPosts) });
  } catch (error) {
    serverError(res, error);
  }
};

// get post of me
module.exports.getPostOfMe = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const posts = await Post.find({ userId: user._id });
    res.status(200).json({ message: "success", posts });
  } catch (error) {
    serverError(res, error);
  }
};
