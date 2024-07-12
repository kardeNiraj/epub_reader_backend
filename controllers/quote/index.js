import dayjs from "dayjs"
import { StatusCodes } from "http-status-codes"
import { ValidationError } from "joi/lib/errors.js"
import { CustomError } from "../../helpers/custom_error.js"
import { responseGenerator } from "../../helpers/index.js"
import QuoteModel from "../../models/QuoteModel.js"

export const getQuoteOfTheDay = async (req, res) => {
	try {
		const startOfToday = dayjs().startOf("day").unix()
		const endOfToday = dayjs().endOf("day").unix()

		// add filters if required
		const where = {
			// get the quote for today
			created_at: {
				$gte: startOfToday,
				$lt: endOfToday,
			},
		}

		const quote = await QuoteModel.find(where).lean().exec()

		if (!quote) throw new CustomError("No Quote present for today")

		return res
			.status(StatusCodes.OK)
			.send(responseGenerator({ ...quote[0] }, StatusCodes.OK, "Success", 1))
	} catch (error) {
		if (error instanceof ValidationError || error instanceof CustomError) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.send(responseGenerator({}, StatusCodes.BAD_REQUEST, error.message, 0))
		}
		console.error(error)
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.send(
				responseGenerator(
					{},
					StatusCodes.INTERNAL_SERVER_ERROR,
					"Internal Server Error",
					0
				)
			)
	}
}
