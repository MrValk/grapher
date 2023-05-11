<script lang="ts">
	import { Formula } from '$lib/Formula';
	import type { Graph } from '$lib/Graph';
	import { GraphBuilder } from '$lib/GraphBuilder';

	let graph: Graph;
	let xCoordinate: number;
	let yCoordinate: number;

	function drawGraph(canvas: HTMLCanvasElement) {
		const formula = new Formula('y = tan(x)', 0.1);
		graph = new GraphBuilder(canvas, formula)
			.setDimensions({
				horizontal: {
					min: -6,
					max: 6
				},
				vertical: {
					min: -0.5,
					max: 1.5
				}
			})
			.setStretch({
				horizontal: 1,
				vertical: 4
			})
			.setGridStep({
				horizontal: 2,
				vertical: 0.5
			})
			.drawPoint({
				x: 0.2
			})
			.get();

		graph.draw();
	}
</script>

<main class="flex items-center justify-center w-screen h-screen bg-zinc-700 text-zinc-200">
	<div class="flex flex-col gap-4">
		<canvas use:drawGraph class="bg-white" width="1000" height="800" />
		{#if graph}
			<input
				type="range"
				min={graph.dimensions.horizontal.min}
				max={graph.dimensions.horizontal.max}
				step={graph.formula._step}
				on:input={() => graph.setPoint({ x: xCoordinate })}
				bind:value={xCoordinate}
			/>
			<input
				type="range"
				min={graph.dimensions.vertical.min}
				max={graph.dimensions.vertical.max}
				step={graph.formula._step}
				on:input={() => graph.setPoint({ y: yCoordinate })}
				bind:value={yCoordinate}
			/>
		{/if}
	</div>
</main>
