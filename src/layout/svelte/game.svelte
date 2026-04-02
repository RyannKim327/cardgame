<script lang="ts">
	import Card from "@/ui/svelte/card.svelte";

	const list_of_card = [
		{
			img: "common/naruto.png",
			points: 100,
			description: "Passive: Having 10% Advance Points",
		},
		{
			img: "uncommon/kioken.jpg",
			points: 999999,
			description: "sgsdghisudhfisud hfisud hisudhgisudhgis uhdigus",
		},
		{
			img: "common/n2.jpg",
			points: 123456789,
		},
		{
			img: "uzu.jpg",
			points: 1,
		},
	];
</script>

<div class="w-full h-full">
	<span>Card Collection</span>
	<div class="flex flex-row flex-wrap gap-2 p-2">
		{#each list_of_card as c}
			<Card img={c.img} pts={c.points} desc={c.description} />
		{/each}
	</div>
</div>
