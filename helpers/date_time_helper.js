import dayjs from "dayjs"
import "dotenv/config.js"

export const getCurrentUnix = () => {
	return dayjs().unix().toString()
}

export const getJwtExpiration = () => {
	return dayjs().add(1, "day").unix()
}
