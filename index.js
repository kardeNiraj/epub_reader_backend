import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config.js"
import express from "express"
import helmet from "helmet"
import http from "http"
import { mongooseConnection } from "./helpers/mongodb_helper.js"
import bookRouter from "./routes/book.js"
import userRouter from "./routes/user.js"

const app = express()
const server = http.Server(app)

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(helmet())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use("/files", express.static("files"))

app.use((req, res, next) => {
	try {
		// set header for swagger.
		res.setHeader(
			"Content-Security-Policy",
			"default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self';"
		)
	} catch (error) {
		console.log("error while setting header: " + error)
	}
	next()
})

app.get("/", (req, res) => {
	return res.send("server is ready to serve!")
})

app.use("/api/user", userRouter)
app.use("/api/book", bookRouter)

// running the server
try {
	const port = process.env.PORT || 8010
	const db = await mongooseConnection()
	if (db) {
		console.log(
			`📅 database connected https://cloud.mongodb.com/v2/666c8df2ca5ba457f69053f8#/overview`
		)
		server.listen(port, () => {
			console.log(`👍 server started successfully http://localhost:${port}`)
		})
	}
} catch (error) {
	console.log(error)
	console.timeEnd(
		`👎 database connection has some problem : ${JSON.stringify(error)}`
	)
}
