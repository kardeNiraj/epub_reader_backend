import { Router } from "express"
import {
	createNewUser,
	deleteUser,
	getUser,
	loginUser,
	updateUser,
} from "../controllers/user/index.js"
import { verifyUser } from "../middleware/auth/index.js"

const userRouter = Router()

// create
// method: POST
// url: /api/user
userRouter.post("/", createNewUser)

// login
// method: POST
// url: /api/user/login
userRouter.post("/login", loginUser)

// forget password

// using the auth middleware to make sure user is logged in first
userRouter.use(verifyUser)

// update
// method: PUT
// url: /api/user
// ------------------
// delete
// method: DELETE
// url: /api/user
userRouter.route("/").put(updateUser).delete(deleteUser)

// user_info
// method: GET
// url: /api/user/:id
userRouter.get("/:id", getUser)

export default userRouter
