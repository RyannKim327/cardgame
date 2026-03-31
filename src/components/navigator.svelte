<script lang="ts">
	export let isCurrent: boolean;
	export let click: () => void = () => {};
</script>

<li
	on:click={click}
	class={`${isCurrent ? "bg-sky-800/50 text-sky-500 border-sky-500" : "bg-blue-950/50 text-blue-800 border-blue-800"} cursor-pointer border-2 border-solid rounded p-2 select-none`}
>
	<slot />
</li>
