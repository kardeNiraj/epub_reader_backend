import mongoose from "mongoose"
import { generatePublicId } from "../helpers/index.js"

const BookSchema = new mongoose.Schema({
	_id: { type: String, required: true, trim: true, default: generatePublicId },
	// need to add the cover_id from archive api
	cover_id: { type: String, default: "/" },
	name: {
		type: String,
		required: true,
	},
	lastReadPage: { type: Number, default: 0 },
	lastReadAt: { type: String },
	bookPath: { type: String },
	thumbnail: { type: String },
	created_by: { type: String },
	created_at: { type: String },
	updated_at: { type: String },
})

const BookModel = mongoose.model("books", BookSchema)
export default BookModel
