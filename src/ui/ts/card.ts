const imgs = ["naruto.jpg", "uzu.jpg"];

export function CreateCard(n: number) {
	const w = 150;
	const h = 225;

	const img = new Image();

	img.src = imgs[n];
	img.onload = () => console.log("Card image loaded:", imgs[n]);

	return (ctx: CanvasRenderingContext2D, x: number, y: number) => {
		if (!img.complete) return;

		// Draw image as background
		ctx.drawImage(img, x, y, w, h);

		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		ctx.strokeRect(x, y, w, h);
	};
}
