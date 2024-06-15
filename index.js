import cors from "cors"
import "dotenv/config"
import express from "express"
import http from "http"
import { mongooseConnection } from "./helpers/mongodb_helper.js"

const app = express()
const server = http.Server(app)

app.use(cors({ origin: "*" }))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get("/", (req, res) => {
	return res.send("server is ready to serve!")
})

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
