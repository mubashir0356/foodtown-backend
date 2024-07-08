const { Router } = require("express")
const { registerUser, loginUser, logoutUser, getUserDetails, sendEmailOtpController } = require("../controllers/user.controller");
const verifyJWT = require("../middlewares/auth.middleware");

const userRouter = Router();

userRouter.route("/registerUser").post(registerUser)
userRouter.route("/login").post(loginUser)
userRouter.route("/logout").post(verifyJWT, logoutUser)
userRouter.route("/getuser/:userId").get(verifyJWT, getUserDetails)
userRouter.route("/emailotp").post(sendEmailOtpController)

module.exports = userRouter