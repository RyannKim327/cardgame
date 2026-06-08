import * as utils from "./utils.js"
import card from "./widgets/card.js"

const canvas = document.getElementById("app")
const ctx = canvas.getContext("2d")

if (!ctx) {
	alert("Could not get 2D context")
	throw new Error("Could now get 2D Context")
}

let elements = []
let time = 0

async function init() {
	const response = await fetch("/elements")
	elements = await response.json()
	resize()
	animate()
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
		// Draw a few sample cards to show different rarities
		const sampleIndices = [0, 1, 4, 10, 42, 60, 117, 10, 110] // H (abundant), He (scarce), B (moderate), Na (common), Rh (very_scarce), Pm (synthetic), Og (synthetic)
		sampleIndices.forEach((idx, i) => {
			const element = elements[idx]
			if (element) {
				card(ctx, {
					w: 120,
					x: 50 + (i % 4) * 150,
					y: 50 + Math.floor(i / 4) * 200,
					element,
					time
				})
			}
		})
	}
}

window.addEventListener('load', init)
window.addEventListener('resize', resize)
