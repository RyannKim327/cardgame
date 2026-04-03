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

		> div > img {
			border-color: #2dd4bf;
		}

		.desc {
			background-color: #0a2a2b;
			color: #ccfbf1;
			border-color: #0f766e;
		}
	}

	.collection {
		position: relative;
		overflow: hidden;
		z-index: 0;
		background-color: #2f2a1a;
		color: #fef3c7;
		border-color: #2f2a1a;
		position: relative;
		overflow: hidden;

		animation: collectionGlow 3s ease-in-out infinite;

		> div > img {
			border-color: #f6e27a;
		}

		> .desc {
			background-color: #1f1a10;
			color: #fff8dc;
			border-color: #a68b2c;
		}
	}

	.artifact {
		background-color: #1a233a;
		color: #c7d2fe;
		border-color: #818cf8;
		animation: artifactAura 2.5s ease-in-out infinite;

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

	.collection::before {
		content: "";
		position: absolute;
		top: -25%;
		left: -65%;
		border-radius: 8px;
		pointer-events: none;
		background: conic-gradient(
			#a68b2c 0%,
			#f6e27a 30%,
			#f6e27a 50%,
			#d4af37 70%,
			#a68b2c 100%
		);
		width: calc(100% + 200px);
		height: calc(100% + 100px);
		animation: rotateBorder 3s linear infinite;
		z-index: -1;
	}

	.collection::after {
		content: "";
		position: absolute;
		inset: 2px;
		background: #2f2a1a;
		background-image: repeating-linear-gradient(
			45deg,
			rgba(255, 255, 255, 0.03),
			rgba(255, 255, 255, 0.03) 2px,
			transparent 2px,
			transparent 6px
		);
		z-index: -1;
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

	@keyframes collectionGlow {
		0%,
		100% {
			box-shadow: 0 0 8px #d4af37;
		}
		50% {
			box-shadow: 0 0 18px #f6e27a;
		}
	}

	@keyframes rotateBorder {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
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
