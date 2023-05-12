<script lang="ts">
	import { Formula } from '$lib/Formula';
	import type { Graph } from '$lib/Graph';
	import { GraphBuilder } from '$lib/GraphBuilder';

	let graph: Graph;
	let xInput: HTMLInputElement;
	let yInput: HTMLInputElement;

	function drawGraph(canvas: HTMLCanvasElement) {
		const formula = new Formula('y = 1/x', 0.1);
		graph = new GraphBuilder(canvas, formula)
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
			{#if graph.formula._formulas.vertical.length}
				<input
					type="range"
					min={graph.dimensions.horizontal.min}
					max={graph.dimensions.horizontal.max}
					step={graph.formula._step}
					on:input={() => {
						graph.setPoint({ [graph.axes.horizontal]: xInput.valueAsNumber });
						if (graph.drawPoints && graph.drawPoints.length && yInput)
							yInput.valueAsNumber = graph.drawPoints[0][graph.axes.vertical];
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
						if (graph.drawPoints && graph.drawPoints.length && xInput)
							xInput.valueAsNumber = graph.drawPoints[0][graph.axes.horizontal];
					}}
					bind:this={yInput}
				/>
			{/if}
		{/if}
	</div>
</main>
