import cors from "cors"
import express from "express"
import { readFileSync } from "fs"
import path from "path"

const PORT = 3000

const app = express()
app.use(express.static(path.join(__dirname, "../public")))
app.use(cors())

app.get("/", (req, res) => {
	res.sendFile(`${__dirname}/template/index.html`)
})

app.get("/elements", (req, res) => {
	const elements = JSON.parse(readFileSync("data/elements.json", "utf8"))
	res.json(elements)
})

app.get("/traits", (req, res) => {
	const traits = JSON.parse(readFileSync("data/traits.json", "utf8"))
	res.json(traits)
})

app.listen(PORT, () => {
	console.log(`Listening to port: ${PORT}`)
})

export default app
