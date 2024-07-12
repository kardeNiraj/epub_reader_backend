import { Router } from "express"
import { getQuoteOfTheDay } from "../controllers/quote/index.js"

const quoteRouter = Router()

quoteRouter.get("/", getQuoteOfTheDay)

export default quoteRouter
