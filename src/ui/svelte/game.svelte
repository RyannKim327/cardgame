<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { canvasManager } from "@/lib/canvasStore";
	import { CreateCard } from "@/ui/ts/card.ts";

	let x = 10;

	const render = (ctx: CanvasRenderingContext2D) => {
		const height = window.innerHeight;
		const width = window.innerWidth;

		const right = width / 1.5;
		const left = width / 5;

		ctx.clearRect(0, 0, width, height);

		for (let i = 0; i < 2; i++) {
			const Card = CreateCard(i);
			Card(ctx, Math.floor(left * (i + 1)), Math.floor(height / 3));
		}
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
