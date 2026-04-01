<script lang="ts">
	export let pts: number;
	export let img: string;
</script>

<div
	style={`background-image: url('${img}')`}
	class={`flex flex-col bg-start bg-no-repeat w-[150px] h-[245px] border-white border-solid border-2 justify-end`}
>
	<span class="bg-black text-white px-2 py-1 italic text-[12px] font-serif"
		>Points: {pts}</span
	>
</div>
