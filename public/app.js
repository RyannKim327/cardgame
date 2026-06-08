import * as utils from "./utils.js"
import card from "./widgets/card.js"
import api from "./process/api.js"

const canvas = document.getElementById("app")
const ctx = canvas.getContext("2d")

if (!ctx) {
	alert("Could not get 2D context")
	throw new Error("Could now get 2D Context")
}

let elements = []
let time = 0

async function init() {
	const client = api()
	const response = await client.get("/elements")
	if (!response.error) {
		elements = response
		resize()
		animate()
	}
}

function resize() {
	utils.resizeCanvas(canvas, window)
}

function animate() {
	time += 0.01
	draw()
	requestAnimationFrame(animate)
}

function draw() {
	ctx.fillStyle = "#1a1a1a"
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	if (elements.length > 0) {
		const sampleIndices = [0, 1, 4, 10, 42, 60, 117, 10, 9, 36]
		sampleIndices.forEach((idx, i) => {
			const element = elements[idx]
			const grids = canvas.width > 1000 ? 8 : 4
			const w = canvas.width / (grids * 1.3)
			const xgaps = 30
			const ygaps = 30
			const h = (w * 1.5)

			if (element) {
				card(ctx, {
					w: w,
					h: h,
					x: 50 + (i % grids) * (w + xgaps),
					y: 50 + Math.floor(i / grids) * (h + ygaps),
					element,
					time
				})
			}
		})
	}
}

window.addEventListener('load', init)
window.addEventListener('resize', resize)
