import dayjs from "dayjs"
import { getCurrentReadableTime } from "../../helpers/date_time_helper.js"
import QuoteModel from "../../models/QuoteModel.js"

export const fetchQuote = async () => {
	try {
		const startOfToday = dayjs().startOf("day").unix()
		const endOfToday = dayjs().endOf("day").unix()
		const countOfTodayQuotes = await QuoteModel.countDocuments({
			created_at: {
				$gte: startOfToday,
				$lte: endOfToday,
			},
		})

		if (countOfTodayQuotes > 0) {
			console.log("Already generated a quote for today")
			return
		}

		const response = await fetch("https://api.api-ninjas.com/v1/quotes", {
			headers: {
				"X-API-KEY": process.env.X_API_KEY,
			},
		})

		if (!response.ok) throw new Error(`Error: ${response.statusText}`)

		const data = await response.json()
		const { quote, author } = data[0]

		const newQuote = await QuoteModel.create({
			quote,
			author,
		})

		if (newQuote)
			console.log("Quote updated successfully at: ", getCurrentReadableTime())
	} catch (error) {
		console.log("Error while updating the quote: ", error)
	}
}
