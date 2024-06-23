import { Router } from "express"
import { createBook } from "../controllers/book/index.js"
import { verifyUser } from "../middleware/auth/index.js"
import { upload } from "../middleware/fileUpload/upload.js"

const bookRouter = Router()

// bookRouter.use(verifyUser)

// create
// method: POST
// url: /api/book
bookRouter.post("/:id", verifyUser, upload.single("book"), createBook)

// update
// method: PUT
// url: /api/book
// --------------------
// delete
// method: DELETE
// url: /api/book
// .put(updateBook)
// .delete(deleteBook)

// read
// method: GET
// url: /api/book/:id
// bookRouter.get("/:id", getBook)

export default bookRouter
