const router = require("express").Router();
const controller = require("../controllers/conversations");

router.post("/", controller.create);

router.get("/:userId", controller.getUser);

router.get(
  "/find/:firstUserId/:secondUserId",
  controller.getConversationTwoUser
);

module.exports = router;
