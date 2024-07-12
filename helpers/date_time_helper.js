import dayjs from "dayjs"
import "dotenv/config.js"

export const getCurrentUnix = () => {
	return dayjs().unix().toString()
}

export const getJwtExpiration = () => {
	return dayjs().add(1, "day").unix()
}

export const formatUnixToReadableTime = (unixTimestamp) => {
	return dayjs.unix(unixTimestamp).format("DD-MM-YYYY HH:mm:ss")
}

export const getCurrentReadableTime = () => {
	return dayjs().format("DD-MM-YYYY HH:mm:ss")
}
