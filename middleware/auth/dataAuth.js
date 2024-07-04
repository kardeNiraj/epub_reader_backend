import { StatusCodes } from "http-status-codes"
import { ValidationError } from "joi/lib/errors.js"
import { CustomError } from "../../helpers/custom_error.js"
import { decryptData, responseGenerator } from "../../helpers/index.js"
import { verifyJwt } from "../../helpers/jwt_helper.js"
import UserModel from "../../models/UserModel.js"

export const datAuth = async (req, res, next) => {
	try {
		const reqIdUser = req?.body?._id ?? req?.params?.id

		const isValid =
			tokenData?.role === "ADMIN" ||
			(["USER"].includes(tokenData?.role) && reqIdUser === tokenData?._id)
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

export const validateJwtToken = async (req, res, next) => {
	try {
		const encToken = req?.cookies?.userToken ?? req?.cookies?.adminToken

		if (!encToken) {
			throw new CustomError("Token not provided")
		}

		const token = decryptData(encToken)

		// validate token
		const tokenData = await verifyJwt(token)
		if (!tokenData) throw new CustomError("Token verification failed")

		const user = await UserModel.findById(tokenData?._id).lean().exec()
		if (!user) throw new CustomError("User does not exist")

		req.tokenData = tokenData

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
