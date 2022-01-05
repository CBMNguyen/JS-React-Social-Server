const router = require("express").Router();
const controller = require("../controllers/messages");

router.post("/", controller.create);

router.get("/:conversationId", controller.get);

module.exports = router;
