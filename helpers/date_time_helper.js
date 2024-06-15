import * as bcrypt from "bcryptjs"
import dayjs from "dayjs"
import "dotenv/config"

const key = process.env.ENCRYPTION_SECRET
const keyBuffer = Buffer.from(key, "hex")

const salt = bcrypt.genSaltSync(10)

export const getCurrentUnix = () => {
	return dayjs().unix().toString()
}

export const hashPassword = async (password) => {
	return bcrypt.hashSync(password, salt)
}

export const comparePassword = async (password, hash) => {
	return bcrypt.compareSync(password, hash)
}
