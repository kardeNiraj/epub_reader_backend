import { Router } from "express"
import {
	createNewUser,
	deleteUser,
	generateForgetPasswordRequest,
	getUser,
	isSessionActive,
	loginUser,
	updateUser,
	validateForgetPasswordRequest,
} from "../controllers/user/index.js"
import { validateJwtToken } from "../middleware/auth/dataAuth.js"
import { verifyUser } from "../middleware/auth/index.js"

const userRouter = Router()

// isSessionActive
// method: GET
// url: /api/user/status
userRouter.get("/status", validateJwtToken, verifyUser, isSessionActive)

// login
// method: POST
// url: /api/user/login
userRouter.post("/login", loginUser)

// create
// method: POST
// url: /api/user
// ------------------
// update
// method: PUT
// url: /api/user
// ------------------
// delete
// method: DELETE
// url: /api/user
userRouter
	.route("/")
	.post(createNewUser)
	.put(validateJwtToken, verifyUser, updateUser)
	.delete(validateJwtToken, verifyUser, deleteUser)

// user_info
// method: GET
// url: /api/user/:id
userRouter.get("/:id", getUser)

// forget password := 1
// method: POST
// url: /api/user/forgetPassword
userRouter.post("/forgetPassword", generateForgetPasswordRequest)

// forget password := 2
// method: POST
// url: /api/user/resetPassword
userRouter.post("/resetPassword", validateForgetPasswordRequest)

export default userRouter
