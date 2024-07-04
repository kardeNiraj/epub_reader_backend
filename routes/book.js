import { Router } from "express"
import {
	createBook,
	deleteBook,
	getAllBooks,
	getBook,
	getCurrentlyReadingBooks,
	getToReadBooks,
} from "../controllers/book/index.js"
import { validateJwtToken } from "../middleware/auth/dataAuth.js"
import { verifyUser } from "../middleware/auth/index.js"
import { upload } from "../middleware/fileUpload/upload.js"

const bookRouter = Router()

// create
// method: POST
// url: /api/book
bookRouter.post(
	"/:id",
	validateJwtToken,
	verifyUser,
	upload.single("book"),
	createBook
)

// update
// method: PUT
// url: /api/book
// --------------------
// delete
// method: DELETE
// url: /api/book
bookRouter.route("/all").get(validateJwtToken, verifyUser, getAllBooks)

// get-currently-reading
// method: GET
// url: /api/book/to-read
bookRouter.get("/to-read", validateJwtToken, verifyUser, getToReadBooks)

// get-currently-reading
// method: GET
// url: /api/book/currently-reading
bookRouter.get(
	"/currently-reading",
	validateJwtToken,
	verifyUser,
	getCurrentlyReadingBooks
)

// read
// method: GET
// url: /api/book/:id
bookRouter
	.route("/:id")
	.get(validateJwtToken, verifyUser, getBook)
	.delete(validateJwtToken, verifyUser, deleteBook)

export default bookRouter
