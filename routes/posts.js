const router = require("express").Router();
const controller = require("../controllers/posts");
const checkAuth = require("../middlewares/checkAuth");
const upload = require("../utils/upload.js");

router.get("/:id", controller.getById);

router.get("/timeline/:userId", controller.getTimeLine);

router.get("/profile/:userId", controller.getPostOfMe);

router.post("/", checkAuth, upload.single("file"), controller.create);

router.put("/:id", controller.update);

router.put("/:id/like", checkAuth, controller.likeAndDislike);

router.put("/:id/comment", checkAuth, controller.createComment);

router.put("/:id/comment/like", checkAuth, controller.likeAndDislikeComment);

router.delete("/:id", checkAuth, controller.delete);

module.exports = router;
