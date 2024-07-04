import Joi from "joi"

export const getBookValidation = Joi.object({
	id: Joi.string().required("ID is required to fetch the book"),
})

export const deleteBookValidation = Joi.object({
	id: Joi.string().required("BookID is required"),
})
