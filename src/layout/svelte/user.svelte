<script>
	import Card from "@/ui/svelte/card.svelte";

	const imgs = ["naruto.jpg", "uzu.jpg"];

	const list_of_card = [
		{
			img: imgs[0],
			points: 100,
			description: "bebetime",
		},
		{
			img: imgs[1],
			points: 100,
			description: "HIHI",
		},
		{
			img: imgs[0],
			points: 10,
			description: "Hello",
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
