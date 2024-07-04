import dayjs from "dayjs"
import "dotenv/config.js"

export const getCurrentUnix = () => {
	return dayjs().unix().toString()
}
