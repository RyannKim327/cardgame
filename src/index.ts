import cors from "cors"
import express from "express"
import { readFileSync } from "fs"
import path from "path"

const PORT = 3000

const app = express()
app.use(express.static(path.join(__dirname, "../public")))
app.use(cors())
app.use(express.json())



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

app.get("/users", (req, res) => {
	const users = JSON.parse(readFileSync("data/user_data.json", "utf8"))
	res.json(users.map((u: any) => ({ id: u.id, username: u.username, cards: u.cards })))
})

app.post("/login", (req, res) => {
	const { username, password } = req.body || {}
	const users = JSON.parse(readFileSync("data/user_data.json", "utf8"))
	const user = users.find((u: any) => u.username === username && u.password === password)

	if (user) {
		res.json({
			success: true,
			user: {
				id: user.id,
				username: user.username,
				cards: user.cards
			}
		})
	} else if (username && password) {
		// Fallback for demo users
		res.json({
			success: true,
			user: {
				id: `USR-${Math.floor(Math.random() * 1000)}`,
				username: username,
				cards: [
					{ id: "H", level: 1 },
					{ id: "He", level: 2 },
					{ id: "Li", level: 3 },
					{ id: "C", level: 4 },
					{ id: "O", level: 5 },
					{ id: "Fe", level: 3 }
				]
			}
		})
	} else {
		res.status(400).json({ error: "Invalid username or password" })
	}
})

app.get("/user/:username/cards", (req, res) => {
	const username = req.params.username
	const users = JSON.parse(readFileSync("data/user_data.json", "utf8"))
	const user = users.find((u: any) => u.username === username)
	if (user) {
		res.json({ username: user.username, cards: user.cards })
	} else {
		res.json({
			username: username,
			cards: [
				{ id: "H", level: 1 },
				{ id: "C", level: 2 },
				{ id: "O", level: 3 }
			]
		})
	}
})

app.listen(PORT, () => {
  console.log(`Listening to port: ${PORT}`)
})

export default app
