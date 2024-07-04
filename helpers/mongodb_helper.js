import "dotenv/config.js"
import mongoose from "mongoose"

export const mongooseConnection = async () => {
	return await mongoose.connect(process.env.MONGODB_URI, {
		retryWrites: true,
		w: "majority",
	})
}

export default mongoose
