<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { canvasManager } from "@/lib/canvasStore";
	import { CreateCard } from "@/ui/ts/card.ts";

	let canvas: HTMLCanvasElement;
	let x = 10;

	const imgs = [
		{
			img: "naruto.jpg",
			pts: 100,
		},
		{
			img: "naruto.jpg",
			pts: 999999,
		},
		{
			img: "uzu.jpg",
			pts: 123456789,
		},
		{
			img: "uzu.jpg",
			pts: 1,
		},
	];

	const render = (ctx: CanvasRenderingContext2D) => {
		const height = window.innerHeight;
		const width = window.innerWidth;

		const left = width / imgs.length;

		ctx.clearRect(0, 0, width, height);

		for (let i = 0; i < imgs.length; i++) {
			const Card = CreateCard(imgs[i]["img"], imgs[i]["pts"]);
			Card(
				ctx,
				Math.floor(left * i + left / imgs.length),
				Math.floor(height / 3),
			);
		}
	};

	function move() {
		x += 10;
	}

	onMount(() => {
		canvasManager.init(canvas);
		canvasManager.start(render);
		window.addEventListener("click", move);
	});

	onDestroy(() => {
		canvasManager.stop();
		window.removeEventListener("click", move);
	});
</script>

<canvas width={window.innerWidth} height={window.innerHeight} bind:this={canvas}
></canvas>

<style>
	canvas {
		background-color: transparent;
	}
</style>
