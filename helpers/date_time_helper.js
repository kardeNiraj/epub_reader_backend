import dayjs from "dayjs"
import "dotenv/config"

export const getCurrentUnix = () => {
	return dayjs().unix().toString()
}
