<script lang="ts">
	// import nerdamer from 'nerdamer';
	// import 'nerdamer/Algebra.js';
	// import 'nerdamer/Calculus.js';
	// import 'nerdamer/Solve.js';

	import { Formula } from '$lib/Formula';
	import type { Graph } from '$lib/Graph';
	import { GraphBuilder } from '$lib/GraphBuilder';
	import { onMount } from 'svelte';

	let graph: Graph;
	let xInput: HTMLInputElement;
	let yInput: HTMLInputElement;

	onMount(() => {
		// console.log(nerdamer('asin(x)', { x: '2' }, ['numer']).text());
		updateSliders();
	});

	function drawGraph(canvas: HTMLCanvasElement) {
		const formula = new Formula('y = 1 / (1 + E^(-x))', 0.1);
		graph = new GraphBuilder(canvas, formula)
			.drawPoint({
				x: 0
			})
			.get();
		graph.draw();
	}

	function updateSliders() {
		if (graph.drawPoints && graph.drawPoints.length) {
			if (xInput) xInput.valueAsNumber = graph.drawPoints[0][graph.axes.horizontal];
			if (yInput) yInput.valueAsNumber = graph.drawPoints[0][graph.axes.vertical];
		}
	}
</script>

<main class="flex items-center justify-center w-screen h-screen bg-zinc-700 text-zinc-200">
	<div class="flex flex-col gap-4">
		<canvas use:drawGraph class="bg-white" width="1000" height="800" />
		{#if graph}
			{#if graph.formula._formulas.vertical.length}
				<input
					type="range"
					min={graph.dimensions.horizontal.min}
					max={graph.dimensions.horizontal.max}
					step={graph.formula._step}
					on:input={() => {
						graph.setPoint({ [graph.axes.horizontal]: xInput.valueAsNumber });
						updateSliders();
					}}
					bind:this={xInput}
				/>
			{/if}
			{#if graph.formula._formulas.horizontal.length}
				<input
					type="range"
					min={graph.dimensions.vertical.min}
					max={graph.dimensions.vertical.max}
					step={graph.formula._step}
					on:input={() => {
						graph.setPoint({ [graph.axes.vertical]: yInput.valueAsNumber });
						updateSliders();
					}}
					bind:this={yInput}
				/>
			{/if}
		{/if}
	</div>
</main>
