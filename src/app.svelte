<script lang="ts">
  import { onMount } from "svelte";
  import { canvasManager } from "@/lib/canvasStore";
  import Game from "@/ui/svelte/game.svelte";

  let canvas: HTMLCanvasElement;

  onMount(() => {
    canvasManager.init(canvas);
  });
</script>

<canvas width={window.innerWidth} height={window.innerHeight} bind:this={canvas}
></canvas>

<Game />

<style>
  canvas {
    background: black;
  }
</style>
