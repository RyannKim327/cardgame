<script>
	import DataController from "@/control/data";
	import Card from "@/ui/svelte/card.svelte";
</script>

<div class="w-full h-full">
	<span>Card Collection</span>
	<div class="flex flex-row flex-wrap gap-8 p-2">
		{#each DataController as c}
			<Card img={c.img} pts={c.pts} type={c.type} desc={c.desc} />
		{/each}
	</div>
</div>
