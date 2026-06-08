const rarityConfig = {
	abundant: { color: "#b0b0b0", secondary: "#808080", text: "#ffffff", animated: false, radius: 5 },
	common: { color: "#4caf50", secondary: "#2e7d32", text: "#e8f5e9", animated: false, radius: 5 },
	moderate: { color: "#2196f3", secondary: "#1565c0", text: "#e3f2fd", animated: false, radius: 5 },
	scarce: { color: "#9c27b0", secondary: "#6a1b9a", text: "#f3e5f5", animated: true, radius: 5 },
	very_scarce: { color: "#ffc107", secondary: "#ff8f00", text: "#fffde7", animated: true, radius: 3 },
	trace: { color: "#00bcd4", secondary: "#00838f", text: "#e0f7fa", animated: true, radius: 3 },
	synthetic: { color: "#f44336", secondary: "#c62828", text: "#ffebee", animated: false, radius: 3 }
}

export default function card(ctx, info) {
	const { x, y, w, h, element, time } = info
	const rarity = rarityConfig[element.rarity] || rarityConfig.abundant

	// Draw Glow for animated cards
	if (rarity.animated) {
		const glowSize = 10 + Math.sin(time * 5) * 5
		ctx.shadowBlur = glowSize
		ctx.shadowColor = rarity.color
	} else {
		ctx.shadowBlur = 0
	}

	// Card Background
	const gradient = ctx.createLinearGradient(x, y, x + w, y + h)
	gradient.addColorStop(0, rarity.color)
	gradient.addColorStop(1, rarity.secondary)

	ctx.fillStyle = gradient
	ctx.beginPath()
	ctx.roundRect(x, y, w, h, rarity.radius)
	ctx.fill()

	// Reset shadow for text and other elements
	ctx.shadowBlur = 0

	// Animated border for high rarity
	if (rarity.animated) {
		ctx.strokeStyle = "white"
		ctx.lineWidth = 2 + Math.sin(time * 3)
		ctx.setLineDash([10, 5])
		ctx.lineDashOffset = -time * 20
		ctx.beginPath()
		ctx.roundRect(x, y, w, h, rarity.radius)
		ctx.stroke()
		ctx.setLineDash([])
	}

	// Shimmer effect for legendary rarities
	if (["very_scarce", "trace", "synthetic"].includes(element.rarity)) {
		ctx.globalCompositeOperation = "lighter"

		// Endless Shimmer Bands
		const bandCount = 3
		const totalRange = w * 2.5
		const shimmerTime = time * 0.5

		for (let i = 0; i < bandCount; i++) {
			const progress = (shimmerTime + (i / bandCount)) % 1
			const sX = x - w + (progress * totalRange)

			const shimmerGradient = ctx.createLinearGradient(sX, y, sX + w * 0.4, y + h)
			shimmerGradient.addColorStop(0, "rgba(255, 255, 255, 0)")
			shimmerGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.15)")
			shimmerGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

			ctx.fillStyle = shimmerGradient
			ctx.beginPath()
			ctx.roundRect(x, y, w, h, rarity.radius)
			ctx.fill()
		}

		ctx.globalCompositeOperation = "source-over"

		// Decorative Legendary Border Design
		ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"
		ctx.lineWidth = 2
		const cornerSize = w * 0.15
		const offset = 4

		// Draw ornamental corner brackets
		const corners = [
			{ sx: x - offset, sy: y - offset, dx: 1, dy: 1 },
			{ sx: x + w + offset, sy: y - offset, dx: -1, dy: 1 },
			{ sx: x - offset, sy: y + h + offset, dx: 1, dy: -1 },
			{ sx: x + w + offset, sy: y + h + offset, dx: -1, dy: -1 }
		]

		corners.forEach(c => {
			ctx.beginPath()
			ctx.moveTo(c.sx, c.sy + (cornerSize * c.dy))
			ctx.lineTo(c.sx, c.sy)
			ctx.lineTo(c.sx + (cornerSize * c.dx), c.sy)
			ctx.stroke()

			// Small jewel at each corner
			ctx.fillStyle = rarity.color
			ctx.beginPath()
			ctx.arc(c.sx, c.sy, rarity.radius, 0, Math.PI * 2)
			ctx.fill()
			ctx.strokeStyle = "white"
			ctx.lineWidth = 1
			ctx.stroke()
		})

		// Subtle pulse for legendary cards
		const pulse = Math.sin(time * 4) * 0.1 + 0.9
		ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * pulse})`
		ctx.lineWidth = 1
		ctx.beginPath()
		ctx.roundRect(x - offset - 2, y - offset - 2, w + (offset + 2) * 2, h + (offset + 2) * 2, rarity.radius)
		ctx.stroke()
	}

	// Symbol Square (Element ID box)
	const sqMargin = w * 0.1
	const sqW = w - (sqMargin * 2)
	const sqH = h * 0.3
	const sqX = x + sqMargin
	const sqY = y + h * 0.22

	// Draw the square with a solid "any color" (Dark slate for professional look)
	ctx.fillStyle = "rgba(10, 10, 10, 0.5)"
	ctx.beginPath()
	ctx.roundRect(sqX, sqY, sqW, sqH, 5)
	ctx.fill()

	// Highlight border onto the square (with a subtle glow)
	ctx.save()
	ctx.shadowBlur = 5
	ctx.shadowColor = "rgba(10, 10, 10, 0.6)"
	ctx.strokeStyle = rarity.text
	ctx.lineWidth = 2
	ctx.stroke()
	ctx.restore()

	// Text shadow for all text elements
	ctx.save()
	ctx.shadowBlur = 4
	ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
	ctx.shadowOffsetX = 1
	ctx.shadowOffsetY = 1

	// Symbol
	ctx.fillStyle = rarity.text
	ctx.font = `bold ${w * 0.3}px sans-serif`
	ctx.textAlign = "center"
	ctx.fillText(element.id, x + w / 2, sqY + sqH * 0.75)

	// Name
	ctx.font = `bold ${w * 0.1}px sans-serif`
	ctx.fillStyle = rarity.text
	ctx.fillText(element.name, x + w / 2, sqY + sqH + h * 0.25)

	// HP
	ctx.font = `bold ${w * 0.1}px sans-serif`
	ctx.textAlign = "right"
	ctx.fillStyle = rarity.text
	ctx.fillText(`HP ${element.hp}`, x + w - 10, y + 25)

	ctx.restore()
}

