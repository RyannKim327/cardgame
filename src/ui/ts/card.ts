export function CreateCard(image: string, points: number) {
	const w = 150;
	const h = 225;

	const img = new Image();

	img.src = image;
	img.onload = () => console.log("Card image loaded:", image);

	return (ctx: CanvasRenderingContext2D, x: number, y: number) => {
		if (!img.complete) return;

		// Draw image as background
		ctx.drawImage(img, x, y, w, h);

		ctx.fillStyle = "#000000";
		ctx.fillRect(x, y + (h - 30), w, 30);

		ctx.font = "12px Verdana";
		ctx.fillStyle = "#ffffff";
		ctx.fillText(`Points: ${points}`, x + 10, y + (h - 10), w - 25);
		ctx.strokeStyle = "white";
		ctx.lineWidth = 2;
		ctx.strokeRect(x, y, w, h);
	};
}
