<script lang="ts">
	export let pts: number;
	export let img: string;
	export let desc: string;
	export let type: string;
</script>

<div
	class={`flex flex-col card ${type ?? "common"} w-[150px] h-[245px] justify-between`}
>
	<div class="p-2 aspect-square">
		<img src={img} alt={img} class="w-full h-full" />
	</div>
	<span
		class="flex flex-col desc h-25 text-[0.5rem] font-bold overflow-hidden p-1"
		>{desc ?? "No Description"}</span
	>
	<span class="bg-black text-white px-2 py-1 italic text-[12px] font-serif"
		>Points: {pts}</span
	>
</div>

<style>
	.card {
		background-color: white;
		border: 2px white solid;

		> div {
			> img {
				border: 1px black solid;
			}
		}

		> span {
			background-color: white;
			color: black;
		}

		> .desc {
			margin: 0.5rem;
			background-color: red;
		}
	}

	.common {
		border-color: red;
	}
</style>
