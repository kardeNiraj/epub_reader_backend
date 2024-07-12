import mongoose from "mongoose"
import { getCurrentUnix } from "../helpers/date_time_helper.js"
import { generatePublicId } from "../helpers/index.js"

const QuoteSchema = mongoose.Schema({
	_id: { type: String, required: true, trim: true, default: generatePublicId },
	quote: String,
	author: String,
	created_at: {
		type: String,
		default: getCurrentUnix(),
	},
})

const QuoteModel = mongoose.model("quotes", QuoteSchema)
export default QuoteModel
