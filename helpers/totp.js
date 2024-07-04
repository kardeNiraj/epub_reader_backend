import { totp } from "otplib"
import { getCurrentUnix } from "./date_time_helper.js"

export const generateTOTP = (secret, purpose, expiryTimeInMin = 60) => {
	totp.options = {
		digits: 6,
		step: 30,
		window: 600,
		algorithm: "sha1",
	}

	const code = totp.generate(secret)
	const expiresAt = getCurrentUnix() + expiryTimeInMin * 60
	const newOtpSecret = {
		secret,
		purpose,
		createdAt: getCurrentUnix(),
		expiresAt,
	}

	return { code, newOtpSecret }
}

export const verifyTotp = (otpSecret, code) => {
	totp.options = {
		digits: 6,
		step: 30,
		window: 600,
		algorithm: "sha1",
	}

	const isValid = totp.check(code, otpSecret?.secret)

	if (otpSecret?.expiresAt && +otpSecret.expiresAt < getCurrentUnix())
		return {
			success: false,
			message: "OTP expired, please generate new OTP.",
		}

	return {
		success: isValid,
		message: isValid
			? "Valid OTP, Verified successfully."
			: "Invalid OTP, please try again !",
	}
}
