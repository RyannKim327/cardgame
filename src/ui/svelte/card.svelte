<script lang="ts">
	export let pts: number;
	export let img: string;
	export let desc: string | undefined | null;
	export let type: string;
</script>

<div
	class={`flex flex-col card ${type ?? "common"} w-[150px] h-[245px] justify-between`}
>
	<div class="p-2 aspect-square">
		<img src={`${type ?? "common"}/${img}`} alt={img} class="w-full h-full" />
	</div>
	<span
		class="flex flex-col desc h-25 text-[0.5rem] font-bold overflow-hidden p-1"
		>{desc ?? "No Description"}</span
	>
	<span class="points px-2 py-1 italic text-[12px] font-serif"
		>Points: {pts}</span
	>
</div>

<style>
	.card {
		background-color: white;
		border: 2px white solid;

		> div {
			> img {
				border: 2px black solid;
			}
		}

		> span {
			background-color: white;
			color: black;
		}

		> .desc {
			margin: 0.5rem;
			background-color: red;
			border: 2px black solid;
			line-height: 1.4;
		}
	}
	.card:hover {
		transform: scale(1.03);
	}

	.common {
		background-color: #2c2c2c;
		color: #f0f0f0;
		> .points {
			background-color: #2c2c2c;
			color: #f0f0f0;
		}
		border-color: #5a5a5a;
		> div > img {
			border-color: #8a8a8a;
		}
		.desc {
			background-color: #1e1e1e;
			color: #d6d6d6;
			border-color: #444444;
		}
	}

	.uncommon {
		background-color: #1f3d2b;
		color: #a7f3d0;
		> .points {
			background-color: #1f3d2b;
			color: #a7f3d0;
		}
		border-color: #3faf6c;
		> div > img {
			border-color: #6be39b;
		}
		.desc {
			background-color: #162a1f;
			color: #cfffe2;
			border-color: #2e7d4f;
		}
	}

	.rare {
		background-color: #1c2f4a;
		color: #93c5fd;
		animation: rareGlow 2.5s ease-in-out infinite;
		border-color: #3b82f6;

		> .points {
			background-color: #1c2f4a;
			color: #93c5fd;
		}

		> div > img {
			border-color: #60a5fa;
		}

		.desc {
			background-color: #142338;
			color: #d6e8ff;
			border-color: #2a5fb8;
		}
	}

	.epic {
		background-color: #2d1f3d;
		color: #d8b4fe;
		border-color: #a855f7;
		animation: epicGlow 2s ease-in-out infinite;

		> .points {
			background-color: #2d1f3d;
			color: #d8b4fe;
		}

		> div > img {
			border-color: #c084fc;
		}

		.desc {
			background-color: #1e1529;
			color: #f3e8ff;
			border-color: #7e3ace;
		}
	}

	.legendary {
		position: relative;
		overflow: hidden;
		background-color: #3d2a1f;
		color: #fde68a;
		border-color: #f59e0b;

		> .points {
			background-color: #3d2a1f;
			color: #fde68a;
		}

		> div > img {
			border-color: #fcd34d;
		}

		.desc {
			background-color: #2a1c12;
			color: #fff3c4;
			border-color: #b7791f;
		}
	}

	.mythic {
		background-color: #3a1a1a;
		color: #fca5a5;
		border-color: #ef4444;
		animation: mythicPulse 1.8s ease-in-out infinite;

		> .points {
			background-color: #3a1a1a;
			color: #fca5a5;
		}

		> div > img {
			border-color: #f87171;
		}

		.desc {
			background-color: #261111;
			color: #ffe4e4;
			border-color: #b91c1c;
		}
	}

	.exotic {
		background-color: #0f3d3e;
		color: #5eead4;
		border-color: #14b8a6;
		animation: exoticFlicker 2s infinite;

		> .points {
			background-color: #0f3d3e;
			color: #5eead4;
		}

		> div > img {
			border-color: #2dd4bf;
		}

		.desc {
			background-color: #0a2a2b;
			color: #ccfbf1;
			border-color: #0f766e;
		}
	}

	.unique {
		background-color: #3a3315;
		color: #fef08a;
		border-color: #eab308;
		animation: uniqueGlow 3s ease-in-out infinite;

		> .points {
			background-color: #3a3315;
			color: #fef08a;
		}

		> div > img {
			border-color: #fde047;
		}

		.desc {
			background-color: #27220f;
			color: #fff9db;
			border-color: #a16207;
		}
	}

	.artifact {
		background-color: #1a233a;
		color: #c7d2fe;
		border-color: #818cf8;
		animation: artifactAura 2.5s ease-in-out infinite;

		> .points {
			background-color: #1a233a;
			color: #c7d2fe;
		}

		> div > img {
			border-color: #a5b4fc;
		}

		.desc {
			background-color: #111827;
			color: #e0e7ff;
			border-color: #4f46e5;
		}
	}

	/* After and before */

	.legendary::before {
		content: "";
		position: absolute;
		top: -50%;
		left: -100%;
		width: 60%;
		height: 200%;
		transform: rotate(25deg);
		background: linear-gradient(
			120deg,
			transparent 30%,
			rgba(255, 255, 255, 0.5),
			transparent 70%
		);
		animation: legendaryShine 3s ease-in-out infinite;
		pointer-events: none;
	}

	/* Animations */
	@keyframes rareGlow {
		0%,
		100% {
			box-shadow: 0 0 6px #3b82f6;
		}
		50% {
			box-shadow: 0 0 14px #60a5fa;
		}
	}

	@keyframes epicGlow {
		0%,
		100% {
			box-shadow: 0 0 8px #a855f7;
			transform: scale(1);
		}
		50% {
			box-shadow: 0 0 18px #c084fc;
			transform: scale(1.01);
		}
	}

	@keyframes legendaryShine {
		0% {
			left: -100%;
		}
		100% {
			left: 150%;
		}
	}

	@keyframes mythicPulse {
		0%,
		100% {
			box-shadow: 0 0 10px #ef4444;
		}
		50% {
			box-shadow: 0 0 25px #f87171;
		}
	}

	@keyframes exoticFlicker {
		0%,
		18%,
		22%,
		25%,
		53%,
		57%,
		100% {
			box-shadow: 0 0 10px #14b8a6;
		}
		20%,
		24%,
		55% {
			box-shadow: 0 0 20px #2dd4bf;
		}
	}

	@keyframes uniqueGlow {
		0%,
		100% {
			box-shadow: 0 0 8px #eab308;
		}
		50% {
			box-shadow: 0 0 22px #fde047;
		}
	}

	@keyframes artifactAura {
		0%,
		100% {
			box-shadow: 0 0 12px #818cf8;
			transform: translateY(0px);
		}
		50% {
			box-shadow: 0 0 30px #a5b4fc;
			transform: translateY(-3px);
		}
	}
</style>
