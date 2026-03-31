export function Card(ctx: CanvasRenderingContext2D, x: number, y: number) {
	const w = 150;
	const h = 225;

	ctx.fillStyle = "white";
	ctx.fillRect(x, y, w, h);
}
