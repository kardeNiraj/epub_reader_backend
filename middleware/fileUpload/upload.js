import fs from "fs-extra"
import multer from "multer"
import path from "path"
import { CustomError } from "../../helpers/custom_error.js"

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		const path = `files/${req?.user?.created_at}_${req?.user?.name}/`
		fs.mkdirSync(path, { recursive: true })
		callback(null, path)
	},
	filename: (req, file, callback) => {
		let name = path.extname(file.originalname)
		callback(null, Date.now() + name)
	},
})

export const upload = multer({
	storage: storage,
	fileFilter: (req, file, callback) => {
		if (file.mimetype === "application/epub+zip") callback(null, true)
		else {
			callback(new CustomError("Error, Only epub file is allowed"), false)
		}
	},
	limits: {
		fileSize: 1024 * 1024 * 2, // 2 mb
	},
})
