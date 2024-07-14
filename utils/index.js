export const generatePassword = async () => {
	return new Promise((resolve) => {
		const length = 8
		const charset =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
		let password = ""

		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length)
			password += charset.charAt(randomIndex)
		}

		resolve(password)
	})
}

export const paginate = (options) => {
	const sort = {}
	if (options?.sort_column) {
		const sortColumn = options?.sort_column
		const order =
			(options && options?.sort_order === "1") ||
			(options && options?.sort_order == "asc")
				? 1
				: -1
		sort[sortColumn] = order
	} else {
		sort.created_at = -1
	}

	const limit = +options?.limit ? +options?.limit : 10
	const offset =
		((+options?.offset ? +options?.offset : 1) - 1) * (+limit ? +limit : 10)
	return { sort, offset, limit }
}

export const profileImageOptions = [
	"Oscar",
	"Abby",
	"Leo",
	"Lucky",
	"Bear",
	"Cali",
	"Cleo",
	"Ginger",
	"Lily",
	"Maggie",
	"Lilly",
	"Boots",
	"Cookie",
	"Kiki",
	"Jasper",
	"Angel",
	"Mia",
	"Fluffy",
]
