const router = require("express").Router();
const controller = require("../controllers/users");
const checkAuth = require("../middlewares/checkAuth");

router.get("/get/me", checkAuth, controller.getMe);

router.get("/search/:name", checkAuth, controller.getByName);

router.get("/:id", checkAuth, controller.getById);

router.get("/friends/:id", checkAuth, controller.getFriends);

router.put("/:id", checkAuth, controller.update);

router.delete("/:id", checkAuth, controller.delete);

router.put("/:id/addfriend", checkAuth, controller.addFriend);

router.put("/:id/unfriend", checkAuth, controller.unFriend);

router.put("/:id/addnotification", checkAuth, controller.addnotification);

router.put("/:id/removenotification", checkAuth, controller.removenotification);

router.put("/:id/follow", checkAuth, controller.follow);

router.put("/:id/unfollow", checkAuth, controller.unfollow);

module.exports = router;
