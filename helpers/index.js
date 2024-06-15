import crypto from "crypto"
import { nanoid } from "nanoid"

export const generateSecret = () => {
	return crypto.randomBytes(16).toString("hex")
}

export const generatePublicId = () => {
	return nanoid() + nanoid() + Date.now()
}
