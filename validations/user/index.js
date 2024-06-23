import Joi from "joi"

export const createUserValidation = Joi.object({
	name: Joi.string().required().messages({
		"any.required": `Please provide the valid name`,
		"string.base": "Please provide the valid name",
	}),
	email: Joi.string().email().required(),
	phone: Joi.string()
		.min(7)
		.max(12)
		.pattern(/^[0-9]+$/)
		.required(),
	password: Joi.string().required(),
})

export const updateUserValidation = Joi.object({
	_id: Joi.string().required(),
	name: Joi.string().required().messages({
		"any.required": `Please provide the valid name`,
		"string.base": "Please provide the valid name",
	}),
	email: Joi.string().email().required(),
	phone: Joi.string()
		.min(7)
		.max(12)
		.pattern(/^[0-9]+$/)
		.required(),
	password: Joi.string().required(),
})

export const deleteUserValidation = Joi.object({
	_id: Joi.string().required("userID required to delete the user"),
	password: Joi.string().required("Enter your password to delete the account"),
})

export const getUserValidation = Joi.object({
	id: Joi.string().required("userID is required to fetch user information"),
})

export const userLoginValidation = Joi.object({
	eop: Joi.alternatives()
		.try(
			Joi.string().email().message("Please provide a valid email address"),
			Joi.string()
				.pattern(/^[0-9]{10,15}$/)
				.message("Please provide a valid phone number")
		)
		.required()
		.messages({
			"any.required": "Please provide an email or phone number",
		}),
	password: Joi.string().required().messages({
		"any.required": "Please provide a password",
		"string.base": "Password must be a string",
	}),
})
