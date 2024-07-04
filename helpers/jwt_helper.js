import "dotenv/config"
import pkg from "jsonwebtoken"

const { sign, verify } = pkg

export function getJwt(data, options = {}) {
	try {
		return sign(data, process.env.JWT_SECRET_KEY, options)
	} catch (error) {
		console.log("------------------------------------------------------------")
		console.log("Error while verifying JWT", error)
		console.log("------------------------------------------------------------")
	}
}

export async function verifyJwt(authorization) {
	try {
		const token = await verify(authorization, process.env.JWT_SECRET_KEY)
		console.log(token)
		return token
	} catch (error) {
		console.log("------------------------------------------------------------")
		console.log("Error while verifying JWT", error)
		console.log("------------------------------------------------------------")
	}
}
