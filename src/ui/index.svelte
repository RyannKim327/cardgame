<script lang="ts">
	import Navigator from "@/components/navigator.svelte";
	import Game from "@/ui/svelte/game.svelte";
	import Leaderboard from "@/ui/svelte/leaderboard.svelte";
	import User from "@/ui/svelte/user.svelte";

	let layout = "main";

	function changer(name: string) {
		layout = name;
	}

	const score = 100;
	const username = "thekeylang.newbie";
</script>

<div class="flex flex-row h-dvh w-dvw bg-slate-900 text-white p-2 gap-2">
	<div class="flex flex-col w-[calc(25%_-_0.5rem)] bg-gray-950 p-2 gap-2">
		<div class="flex flex-col">
			<span>@{username}</span>
			<span class="ml-2 text-[0.75rem]">Score {score}</span>
		</div>
		<div class="flex flex-col gap-2">
			<Navigator
				click={() => {
					changer("main");
				}}
				isCurrent={layout == "main"}>Dashboard</Navigator
			>
			<Navigator
				click={() => {
					changer("game");
				}}
				isCurrent={layout == "game"}>Game</Navigator
			>
			<Navigator
				click={() => {
					changer("leaderboard");
				}}
				isCurrent={layout == "leaderboard"}>Leaderboard</Navigator
			>
		</div>
	</div>
	<div class="w-[calc(75%_-_0.5rem)] bg-gray-950 p-2">
		{#if layout === "main"}
			<User />
		{:else if layout === "game"}
			<Game />
		{:else if layout === "leaderboard"}
			<Leaderboard />
		{:else}
			<p>Unknown</p>
		{/if}
	</div>
</div>
