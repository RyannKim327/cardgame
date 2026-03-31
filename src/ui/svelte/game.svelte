<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { canvasManager } from "@/lib/canvasStore";
	import { Card } from "@/ui/ts/card.ts";

	let x = 10;

	const render = (
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	) => {
		ctx.clearRect(0, 0, width, height);
		Card(ctx, x, 100);
		console.log(height);
	};

	function move() {
		x += 10;
	}

	onMount(() => {
		canvasManager.start(render);
		window.addEventListener("click", move);
	});

	onDestroy(() => {
		canvasManager.stop();
		window.removeEventListener("click", move);
	});
</script>

<!-- <Card /> -->
