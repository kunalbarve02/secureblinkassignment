var express = require("express");
var router = express.Router();

const { isSignedIn, getUserById, isAdmin } = require("../middlewares/auth");
const { getUserProfile, getSelfProfile, getAllUsers } = require("../controllers/user");

router.param("userId", getUserById);

router.get("/profile/all", isSignedIn, isAdmin, getAllUsers)
router.get("/profile/self", isSignedIn, getSelfProfile)
router.get("/profile/other/:userId", isSignedIn, isAdmin, getUserProfile)

module.exports = router;
