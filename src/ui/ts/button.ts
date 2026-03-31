export function createButton(
	x: number,
	y: number,
	w: number,
	h: number,
	text: string,
	onClick: () => void,
) {
	function draw(ctx: CanvasRenderingContext2D) {
		// button background
		ctx.fillStyle = "#333";
		ctx.fillRect(x, y, w, h);

		// border
		ctx.strokeStyle = "white";
		ctx.strokeRect(x, y, w, h);

		// text
		ctx.fillStyle = "white";
		ctx.font = "20px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, x + w / 2, y + h / 2);
	}

	function handleClick(mx: number, my: number) {
		const inside = mx >= x && mx <= x + w && my >= y && my <= y + h;

		if (inside) {
			onClick();
		}
	}

	return { draw, handleClick };
}
