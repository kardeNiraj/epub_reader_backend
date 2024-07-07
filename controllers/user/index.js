import { StatusCodes } from "http-status-codes"
import { ValidationError } from "joi/lib/errors.js"
import { CustomError } from "../../helpers/custom_error.js"
import { getCurrentUnix } from "../../helpers/date_time_helper.js"
import { mailHandler } from "../../helpers/email.js"
import {
	comparePassword,
	decryptData,
	encryptData,
	generateSecret,
	hashPassword,
	responseGenerator,
} from "../../helpers/index.js"
import { getJwt, verifyJwt } from "../../helpers/jwt_helper.js"
import { generateTOTP, verifyTotp } from "../../helpers/totp.js"
import UserModel from "../../models/UserModel.js"
import {
	createUserValidation,
	deleteUserValidation,
	getUserValidation,
	updateUserValidation,
	userLoginValidation,
} from "../../validations/user/index.js"

// forget password
// method: POST
// url: /api/user/forgetPassword
export const generateForgetPasswordRequest = async (req, res) => {
	try {
		const userData = await UserModel.findOne({
			email: req?.body?.email,
			isDeleted: false,
		})

		if (!userData)
			throw new CustomError(
				`User with the given email or phone number does not exist`
			)

		const token = getJwt({ _id: userData._id }, { expiresIn: "60m" })
		const encToken = encryptData(token)

		const secret = generateSecret(32)
		const { code, newOtpSecret } = generateTOTP(secret, "RESET_PASS")

		// store OTP secret in DB
		userData.otpSecret = newOtpSecret
		userData.save()

		mailHandler("RESET_PASS", {
			otp: code,
			email: req?.body?.email,
		})

		return res
			.status(StatusCodes.OK)
			.send(
				responseGenerator(
					{ token: encToken, otp: code },
					StatusCodes.OK,
					"Mail sent successfully",
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

// forget password
// method: POST
// url: /api/user/resetPassword
export const validateForgetPasswordRequest = async (req, res) => {
	try {
		const { otp, token, new_password, compare_password } = req.body
		const jwtToken = decryptData(token)
		const tokenData = await verifyJwt(jwtToken)

		if (tokenData?.exp < getCurrentUnix())
			throw new CustomError("Token expired, please generate a new token")
		const user = await UserModel.findById(tokenData?._id)
		if (!user) throw new CustomError("No user found")

		if (!user.otpSecret)
			throw new CustomError("No request for password reset found")

		const isValid = verifyTotp(user?.otpSecret, otp)
		if (!isValid && !isValid?.success)
			throw new CustomError(
				isValid?.message || "Invalid OTP, please try again!"
			)

		if (new_password !== compare_password)
			throw new CustomError("Passwords do not match")

		const passwordHash = await hashPassword(new_password)

		// update the user document
		user.password = passwordHash
		user.updated_at = getCurrentUnix()
		user.save()

		return res
			.status(StatusCodes.OK)
			.send(
				responseGenerator(
					{},
					StatusCodes.OK,
					"Password updated successfully",
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

// login
// method: POST
// url: /api/user/login
export const loginUser = async (req, res) => {
	try {
		// validation
		await userLoginValidation.validateAsync(req?.body)

		// fetch existing user
		const userData = await UserModel.findOne({
			$or: [{ email: req?.body?.eop }, { phone: req?.body?.eop }],
			isDeleted: false,
		})
			.lean()
			.exec()

		if (!userData)
			throw new CustomError(
				`User with the given email or phone number does not exist`
			)

		// verify password
		const isValid = await comparePassword(
			req?.body?.password,
			userData?.password
		)

		if (!isValid)
			throw new CustomError(`Credentials do not match, please try again!`)

		// generate a token
		const token = getJwt({ _id: userData?._id, role: userData?.role })

		// encrypt the token
		const encToken = encryptData(token)

		// set cookie
		// res.cookie("userToken", encToken, {
		// 	httpOnly: true,
		// 	sameSite: "strict",
		// 	maxAge: 24 * 60 * 60 * 1000,
		// })

		// success message
		return res
			.status(StatusCodes.OK)
			.send(
				responseGenerator(
					{ loginCompleted: true, token: encToken },
					StatusCodes.OK,
					"Login Successful",
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

// create
// method: POST
// url: /api/user
export const createNewUser = async (req, res) => {
	try {
		// validation using JOI
		await createUserValidation.validateAsync(req.body)

		// check if user already available
		const isAvailable = await UserModel.findOne({
			$or: [{ email: req?.body?.email }, { phone: req?.body?.phone }],
			// isDeleted: false,
		})

		if (isAvailable) {
			isAvailable.isDeleted = false
			isAvailable.updated_at = getCurrentUnix()
			isAvailable.save()
			return res
				.status(StatusCodes.OK)
				.send(
					responseGenerator(
						{ _id: isAvailable._id, loginCompleted: false },
						StatusCodes.OK,
						"Deleted user recovered",
						1
					)
				)
		}

		// create user
		const hashedPass = await hashPassword(req?.body?.password, 10)

		let newUser = await UserModel.create({
			...req.body,
			password: hashedPass,
			created_at: getCurrentUnix(),
			updated_at: getCurrentUnix(),
		})

		// success response
		return res
			.status(StatusCodes.OK)
			.send(
				responseGenerator(
					{ _id: newUser._id, loginCompleted: false },
					StatusCodes.OK,
					"User created. Please login to your account.",
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

// update
// method: PUT
// url: /api/user
export const updateUser = async (req, res) => {
	try {
		// validation using JOI
		await updateUserValidation.validateAsync(req.body)

		// check for user availability and update
		const updatedUserData = await UserModel.findOneAndUpdate(
			{
				$and: [{ email: req?.body?.email }, { phone: req?.body?.phone }],
				isDeleted: false,
			},
			{
				$set: {
					name: req?.body?.name,
					updated_at: getCurrentUnix(),
				},
			},
			{ new: true }
		)

		if (!updatedUserData) {
			throw new CustomError(
				`User with the email or phone number does not exist.`
			)
		}

		// success response
		return res
			.status(StatusCodes.OK)
			.send(
				responseGenerator({}, StatusCodes.OK, "User updated successfully!", 1)
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

// delete
// method: DELETE
// url: /api/user
export const deleteUser = async (req, res) => {
	try {
		// validation using JOI
		await deleteUserValidation.validateAsync(req?.body)

		// check if user already available
		const user = await UserModel.findOne({
			_id: req?.body?._id,
			isDeleted: false,
		})

		if (!user) {
			throw new CustomError(
				`User with the email or phone number does not exist`
			)
		}

		// delete user
		user.isDeleted = true
		user.updated_at = getCurrentUnix()
		await user.save()

		// success response
		return res
			.status(StatusCodes.OK)
			.send(
				responseGenerator(
					{ _id: user._id, isDeleted: true },
					StatusCodes.OK,
					"We hope you come back to us.",
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

// user_info
// method: GET
// url: /api/user/:id
export const getUser = async (req, res) => {
	try {
		// validation using JOI
		await getUserValidation.validateAsync({ id: req?.params?.id })

		// check if user already available
		const userData = await UserModel.findOne({
			_id: req?.params?.id,
			isDeleted: false,
		})
			.lean()
			.exec()

		if (!userData) {
			throw new CustomError(`The requested user does not exist`)
		}

		// success response
		return res
			.status(StatusCodes.OK)
			.send(responseGenerator({ ...userData }, StatusCodes.OK, "Success", 1))
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
