import { StatusCodes } from "http-status-codes"
import { ValidationError } from "joi/lib/errors.js"
import { CustomError } from "../../helpers/custom_error.js"
import { decryptData, responseGenerator } from "../../helpers/index.js"
import { verifyJwt } from "../../helpers/jwt_helper.js"
import UserModel from "../../models/UserModel.js"

// verify user
export const verifyUser = async (req, res, next) => {
	try {
		const encToken = req?.cookies?.userToken ?? req?.cookies?.adminToken

		if (!encToken) {
			throw new CustomError("Token not provided")
		}

		const token = decryptData(encToken)

		// if(req?.baseUrl === '/api/book')
		const reqId = req?.body?._id ?? req?.params?.id

		// validate token
		const tokenData = await verifyJwt(token)
		if (!tokenData) throw new CustomError("Token verification failed")

		const isValid =
			tokenData?.role === "ADMIN" ||
			(["USER"].includes(tokenData?.role) && reqId === tokenData?._id)

		if (!isValid) throw new CustomError("Invalid token or mismatched user ID")

		const userData = await UserModel.findById(tokenData?._id).lean().exec()
		req.user = userData

		next()
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

// verify admin
export const verifyAdmin = async (req, res, next) => {
	try {
		const encToken = req?.cookies?.adminToken
		const token = decryptData(encToken)

		// validate token
		const tokenData = await verifyJwt(token)
		const isValid = ["ADMIN"].includes(tokenData?.role)

		if (!isValid) throw new CustomError("Protected route, only for admins")

		next()
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
