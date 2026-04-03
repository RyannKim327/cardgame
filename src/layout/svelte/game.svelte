<script lang="ts">
	import Card from "@/ui/svelte/card.svelte";
	import DataController from "@/control/data";
	import types from "@/control/types";
	const data = DataController;

	const pts: Record<string, number> = types;

	let points = $state("");
	let sc = $state(0);

	// TODO: Players
	const p1 = data[3];
	const p2 = data[2];

	// TODO: Points
	const t1 = (pts[p1.type] + 1) * p1.pts;
	const t2 = (pts[p2.type] + 1) * p2.pts;

	const total = t1 + t2;
	const percent1 = Math.round((t1 / total) * 100);
	const percent2 = Math.round((t2 / total) * 100);

	const fight = () => {
		// TODO: To randomly choose which one can won the challenge
		const won = Math.random() * (t1 + t2);
		let player = -1;

		if (t1 > t2) {
			if (won > t1) {
				points = "t1";
				player = 0;
			} else {
				points = "t2";
				player = 1;
			}
		} else if (t1 < t2) {
			if (won > t2) {
				points = "t2";
				player = 1;
			} else {
				points = "t1";
				player = 0;
			}
		} else {
			if (won % 2 == 0) {
				points = "t1";
				player = 0;
			} else {
				points = "t2";
				player = 1;
			}
		}
		sc = won;
	};
</script>

<div class="w-full h-full">
	<div class="flex flex-col">
		<span>Card Battle</span>
		<span>Card 1 chance: {percent1}</span>
		<span>Card 2 chance: {percent2}</span>
	</div>
	<div class="flex flex-row flex-wrap justify-evenly items-center gap-2 p-2">
		<Card img={p1.img} pts={p1.pts} desc={p1.desc} type={p1.type} />
		<Card img={p2.img} pts={p2.pts} desc={p2.desc} type={p2.type} />
	</div>
	<button on:click={fight} class="p-2">Fight</button>
</div>
