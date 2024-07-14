import mongoose from "mongoose"
import { generatePublicId } from "../helpers/index.js"

const UserSchema = new mongoose.Schema({
	_id: { type: String, required: true, trim: true, default: generatePublicId },
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	phone: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
	},
	profileImage: {
		type: String,
		required: true,
	},
	otpSecret: {
		type: Object,
		default: null,
	},
	created_at: { type: String },
	updated_at: { type: String },
	isDeleted: { type: Boolean, default: false },
})

const UserModel = mongoose.model("users", UserSchema)
export default UserModel
