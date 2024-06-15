import "dotenv/config"
import { sign, verify } from "jsonwebtoken"

export function getJwt(data) {
	try {
		return sign(data, process.env.JWT_SECRET_KEY)
	} catch (error) {
		console.log("------------------------------------------------------------")
		console.log("Error while verifying JWT", error)
		console.log("------------------------------------------------------------")
	}
}

export async function verifyJwt(authorization) {
	try {
		const token = await verify(authorization, process.env.JWT_SECRET_KEY)
		return token
	} catch (error) {
		console.log("------------------------------------------------------------")
		console.log("Error while verifying JWT", error)
		console.log("------------------------------------------------------------")
	}
}
