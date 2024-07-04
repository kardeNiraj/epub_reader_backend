import dayjs from "dayjs"
import { StatusCodes } from "http-status-codes"
import { ValidationError } from "joi/lib/errors.js"
import { CustomError } from "../../helpers/custom_error.js"
import { getCurrentUnix } from "../../helpers/date_time_helper.js"
import { responseGenerator } from "../../helpers/index.js"
import BookModel from "../../models/BookModel.js"
import { paginate } from "../../utils/index.js"
import {
	deleteBookValidation,
	getBookValidation,
} from "../../validations/book/index.js"

// create
// method: POST
// url: /api/book
export const createBook = async (req, res) => {
	try {
		const file = req?.file
		if (!file) throw new CustomError("No book was sent")

		const newBook = {
			name: file?.originalname,
			bookPath: file?.path,
			created_at: getCurrentUnix(),
			updated_at: getCurrentUnix(),
			created_by: req?.user?._id,
		}

		await BookModel.create(newBook)

		return res
			.status(StatusCodes.OK)
			.send(
				responseGenerator({}, StatusCodes.OK, "Book uploaded successfully", 1)
			)
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

// hard-delete
// method: DELETE
// url: /api/book/:id
export const deleteBook = async (req, res) => {
	try {
		// validation
		await deleteBookValidation.validateAsync(req?.params)

		const book = await BookModel.findOne({
			_id: req?.params?.id,
			created_by: req?.user?._id,
		})

		if (!book) throw new CustomError("Book not found")

		const filePath = book?.bookPath

		try {
			await fs.remove(filePath)
			await BookModel.deleteOne({
				_id: req?.params?.id,
				created_by: req?.user?._id,
			})
		} catch (error) {
			throw new CustomError("Failed to delete book")
		}

		return res
			.status(StatusCodes.OK)
			.send(
				responseGenerator({}, StatusCodes.OK, "Book deleted successfully", 1)
			)
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

// read
// method: GET
// url: /api/book/:id
export const getBook = async (req, res) => {
	try {
		// validation
		await getBookValidation.validateAsync(req?.params)

		const book = await BookModel.findOne({
			_id: req?.params?.id,
			created_by: req?.user?._id,
		})

		if (!book) throw new CustomError("Book not found")

		book.lastReadAt = getCurrentUnix()
		book.save()

		return res
			.status(StatusCodes.OK)
			.send(
				responseGenerator(
					book._doc,
					StatusCodes.OK,
					"Book uploaded successfully",
					1
				)
			)
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

// get-all-books
// method: GET
// url: /api/book/all
// PAGINATION: ENABLED
// QUERY: PARAMS:: search, limit, offset, sort
export const getAllBooks = async (req, res) => {
	try {
		const { sort, offset, limit } = paginate(req?.query)

		let where = {
			created_by: req?.user?._id,
		}

		if (req?.query?.search)
			where.name = new RegExp(req.query.search.toString(), "i")

		const books = await BookModel.find(where)
			.sort(sort)
			.skip(offset)
			.limit(limit)
			.lean()
			.exec()

		if (!books) throw new CustomError("Failed to get books")

		const total_count = await BookModel.countDocuments(where)

		return res.status(StatusCodes.OK).send(
			responseGenerator(
				{
					paginatedData: books,
					totalCount: total_count,
					itemsPerPage: limit,
				},
				StatusCodes.OK,
				"Success",
				1
			)
		)
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

// get-currently-reading-books
// method: GET
// url: /api/book/currently-reading
// PAGINATION: ENABLED
// QUERY: PARAMS:: limit, offset, sort
export const getCurrentlyReadingBooks = async (req, res) => {
	try {
		const currentUnix = getCurrentUnix()
		const fiveDaysAgoUnix = dayjs().subtract(5, "day").unix()

		const { sort, offset, limit } = paginate(req?.query)

		let where = {
			lastReadAt: {
				$gte: fiveDaysAgoUnix,
				$lte: currentUnix,
			},
		}

		const books = await BookModel.find(where)
			.sort(sort)
			.skip(offset)
			.limit(limit)
			.lean()
			.exec()

		const total_count = await BookModel.countDocuments(where)

		return res.status(StatusCodes.OK).send(
			responseGenerator(
				{
					paginatedData: books,
					totalCount: total_count,
					itemsPerPage: limit,
				},
				StatusCodes.OK,
				"Success",
				1
			)
		)
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

// get-to-read-books
// method: GET
// url: /api/book/to-read
// PAGINATION: ENABLED
// QUERY: PARAMS:: limit, offset, sort
export const getToReadBooks = async (req, res) => {
	try {
		const fiveDaysAgoUnix = dayjs().subtract(5, "day").unix()

		const { sort, offset, limit } = paginate(req?.query)

		let where = {
			lastReadAt: {
				$lt: fiveDaysAgoUnix,
			},
		}

		const books = await BookModel.find(where)
			.sort(sort)
			.skip(offset)
			.limit(limit)
			.lean()
			.exec()

		const total_count = await BookModel.countDocuments(where)

		return res.status(StatusCodes.OK).send(
			responseGenerator(
				{
					paginatedData: books,
					totalCount: total_count,
					itemsPerPage: limit,
				},
				StatusCodes.OK,
				"Success",
				1
			)
		)
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
