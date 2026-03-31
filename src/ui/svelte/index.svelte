<script lang="ts">
	import Navigator from "@/components/navigator.svelte";

	let layout = "main";

	function changer(name: string) {
		layout = name;
	}
</script>

<div class="flex flex-row h-dvh w-dvw bg-slate-900 text-white p-2 gap-2">
	<div class="flex flex-col w-[calc(25%_-_0.5rem)] bg-gray-950 p-2">
		<span>MPOP Reverse II</span>
		<ul class="flex flex-col gap-2">
			<Navigator
				click={() => {
					changer("main");
				}}
				isCurrent={layout == "main"}>Main</Navigator
			>
			<Navigator
				click={() => {
					changer("game");
				}}
				isCurrent={layout == "game"}>Game</Navigator
			>
			<Navigator
				click={() => {
					changer("end");
				}}
				isCurrent={layout == "end"}>End</Navigator
			>
		</ul>
	</div>
	<div class="w-full bg-gray-950 p-2">
		{#if layout === "main"}
			<p>This is menu</p>
		{:else if layout === "game"}
			<p>Game started!</p>
		{:else if layout === "end"}
			<p>Game over</p>
		{:else}
			<p>Unknown</p>
		{/if}
	</div>
</div>
