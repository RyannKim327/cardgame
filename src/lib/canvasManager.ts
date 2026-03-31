export type RenderFn = (ctx: CanvasRenderingContext2D) => void;

export interface CanvasManager {
	init: (el: HTMLCanvasElement) => void;
	start: (renderFn: RenderFn) => void;
	stop: () => void;
	readonly ctx: CanvasRenderingContext2D | null;
}

export function createCanvasManager(): CanvasManager {
	let canvas: HTMLCanvasElement | null = null;
	let ctx: CanvasRenderingContext2D | null = null;
	let animationId: number | null = null;

	function init(el: HTMLCanvasElement) {
		canvas = el;
		const context = canvas.getContext("2d");
		if (!context) throw new Error("2D context not supported");
		ctx = context;
	}

	function start(renderFn: RenderFn) {
		function loop() {
			if (!ctx || !canvas) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			renderFn(ctx);
			animationId = requestAnimationFrame(loop);
		}
		loop();
	}

	function stop() {
		if (animationId !== null) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}
	}

	return {
		init,
		start,
		stop,
		get ctx() {
			return ctx;
		},
	};
}
