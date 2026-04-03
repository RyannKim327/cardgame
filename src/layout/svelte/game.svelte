<script lang="ts">
	import Card from "@/ui/svelte/card.svelte";
	import DataController from "@/control/data";
	const data = DataController;

	// TODO: Players
	const p1 = data[0];
	const p2 = data[3];
</script>

<div class="w-full h-full">
	<span>Card Collection</span>
	<div class="flex flex-row flex-wrap justify-evenly items-center gap-2 p-2">
		<Card img={p1.img} pts={p1.pts} desc={p1.desc} type={p1.type} />
		<Card img={p2.img} pts={p2.pts} desc={p2.desc} type={p2.type} />
	</div>
</div>
