import mongoose from "mongoose"
import { generatePublicId } from "../helpers/index.js"

const BookSchema = new mongoose.Schema({
	_id: { type: String, required: true, trim: true, default: generatePublicId },
	name: {
		type: String,
		required: true,
	},
	lastReadPage: { type: Number, default: 0 },
	bookPath: { type: String },
	thumbnail: { type: String },
	created_by: { type: String },
	created_at: { type: String },
	updated_at: { type: String },
	isDeleted: { type: Boolean, default: false },
})

const BookModel = mongoose.model("books", BookSchema)
export default BookModel
