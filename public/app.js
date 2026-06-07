import * as utils from "./utils.js"

const canvas = document.getElementById("app")
const ctx = canvas.getContext("2d")

if (!ctx) {
	alert("Could not get 2D context")
	throw new Error("Could now get 2D Context")
}

function resize() {
	utils.resizeCanvas(canvas, window)
	draw()
}

function card(size, position) {
	const cardHeight = canvas.height * (size.height / canvas.height)
	const cardWidth = canvas.width * (size.width / canvas.width)

	ctx.fillStyle = "red"
	ctx.fillRect(position.x, position.y, cardWidth, cardHeight)
}

function draw() {
	ctx.fillStyle = "black"
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	card({
		height: 100, width: 50
	}, {
		x: 20,
		y: 20
	})
}


// TODO: Let this in the bottom of the code
window.addEventListener('load', resize)
window.addEventListener('resize', resize)
