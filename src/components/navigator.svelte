<script lang="ts">
	export let isCurrent: boolean;
	export let click: () => void = () => {};
</script>

<button
	type="button"
	onclick={click}
	class={`${isCurrent ? "bg-sky-800/50 text-sky-200 border-sky-200" : "bg-blue-950/50 text-sky-500 border-sky-500"} text-left transition delay-150 cursor-pointer border-2 border-solid rounded p-2 select-none`}
>
	<slot />
</button>
