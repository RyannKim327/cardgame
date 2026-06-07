import cors from "cors"
import express from "express"
import { readFileSync } from "fs"

const PORT = 3000

const app = express()
app.use(cors())

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
