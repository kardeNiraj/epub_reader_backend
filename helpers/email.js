import "dotenv/config"
import nodemailer from "nodemailer"

export const mailHandler = async (purpose, data) => {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			port: 465,
			secure: true,
			auth: {
				user: process.env.MAIL_EMAIL,
				pass: process.env.MAIL_PASS,
			},
		})

		let mailOptions = {
			from: `"EPUB Reader" <${process.env.MAIL_EMAIL}>`,
			to: data.email,
			subject: "",
			text: "",
			html: "",
		}

		switch (purpose) {
			case "RESET_PASS":
				mailOptions.subject = "Password Reset Request"
				mailOptions.text = `Dear ${data?.name},

You have requested to reset your password. Please use the following OTP to change your password:

OTP: ${data?.otp}

If you did not request a password reset, please ignore this email or contact support if you have any concerns.

Best regards,
Your Company Name`
				mailOptions.html = `
        <h1>Password Reset Request</h1>
        <p>Dear ${data?.name},</p>
        <p>You have requested to reset your password. Please use the following OTP to change your password:</p>
        <h2 style="font-size: 24px; font-weight: bold;">${data?.otp}</h2>
        <p>If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
        <p>Best regards,<br>Your Company Name</p>
    `
				break

			default:
				mailOptions.subject = "General Notification"
				mailOptions.text = "This is a general notification."
				mailOptions.html = `
          <h1>General Notification</h1>
          This is a general notification message.
        `
				break
		}

		const info = await transporter.sendMail(mailOptions)

		console.log("Message sent: %s", info.messageId)
	} catch (error) {
		console.log(error)
	}
}
