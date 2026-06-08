const rarityConfig = {
	abundant: { color: "#b0b0b0", secondary: "#808080", animated: false },
	common: { color: "#4caf50", secondary: "#2e7d32", animated: false },
	moderate: { color: "#2196f3", secondary: "#1565c0", animated: false },
	scarce: { color: "#9c27b0", secondary: "#6a1b9a", animated: true },
	very_scarce: { color: "#ffc107", secondary: "#ff8f00", animated: true },
	trace: { color: "#00bcd4", secondary: "#00838f", animated: true },
	synthetic: { color: "#f44336", secondary: "#c62828", animated: true }
}

export default function card(ctx, info) {
	const { x, y, w, element, time } = info
	const h = w * 1.5
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
	ctx.roundRect(x, y, w, h, 8)
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
		ctx.roundRect(x, y, w, h, 8)
		ctx.stroke()
		ctx.setLineDash([])
	}

	// Shimmer effect for legendary rarities
	if (["very_scarce", "trace", "synthetic"].includes(element.rarity)) {
		const shimmerX = x + (time % 1) * w * 2 - w
		const shimmerGradient = ctx.createLinearGradient(shimmerX, y, shimmerX + w * 0.5, y + h)
		shimmerGradient.addColorStop(0, "rgba(255, 255, 255, 0)")
		shimmerGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)")
		shimmerGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

		ctx.fillStyle = shimmerGradient
		ctx.globalCompositeOperation = "lighter"
		ctx.beginPath()
		ctx.roundRect(x, y, w, h, 8)
		ctx.fill()
		ctx.globalCompositeOperation = "source-over"
	}

	// Symbol
	ctx.fillStyle = "white"
	ctx.font = `bold ${w * 0.3}px sans-serif`
	ctx.textAlign = "center"
	ctx.fillText(element.id, x + w / 2, y + h * 0.45)

	// Name
	ctx.font = `${w * 0.12}px sans-serif`
	ctx.fillText(element.name, x + w / 2, y + h * 0.65)

	// HP
	ctx.font = `bold ${w * 0.1}px sans-serif`
	ctx.textAlign = "right"
	ctx.fillText(`HP ${element.hp}`, x + w - 10, y + 20)

	// Rarity Text
	ctx.font = `italic ${w * 0.08}px sans-serif`
	ctx.textAlign = "left"
	ctx.fillText(element.rarity, x + 10, y + h - 10)
}
