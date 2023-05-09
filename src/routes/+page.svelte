<script lang="ts">
	import '../app.css';
	import { solveFormula, drawGraph, drawPoint, resizeCanvas } from '$lib/scripts/graph';
	import { calcPoints } from '$lib/scripts/formula';

	let pointCanvasEl: HTMLCanvasElement;

	// 1 / (1 + Math.pow(Math.E, -x))
	const formula: Formula = {
		y: '1 / (1 + Math.pow(Math.E, -x))'
	};
	const pointFormula: PointFormula = {
		y: '1 / (1 + Math.pow(Math.E, -x))'
	};
	const dimensions = {
		minX: -6,
		maxX: 6,
		minY: -0.5,
		maxY: 1.5
	};
	const step = 0.1;
	const stretch = {
		x: 1,
		y: 4
	};
	const scale = 75;
	const gridStep = {
		x: 2,
		y: 0.5
	};
	const fontSize = 14;

	let xValue = 0;
	let yValue = 0;

	function graph(canvasEl: HTMLCanvasElement) {
		resizeCanvas(canvasEl, dimensions, { scale, stretch });
		// const points = calcPoints(structuredClone(formula), dimensions, step);
		const points = calcPoints('y = 1 / (1 + E^(-x))', dimensions, step);
		drawGraph(canvasEl, points, dimensions, {
			stretch,
			scale,
			gridStep,
			fontSize
		});
	}

	function pointX(canvasEl: HTMLCanvasElement) {
		resizeCanvas(canvasEl, dimensions, { scale, stretch });
		const value = solveFormula(pointFormula, { x: xValue }, dimensions);
		if (value) {
			yValue = value;
			drawPoint(
				canvasEl,
				{
					x: xValue,
					y: yValue
				},
				dimensions,
				{
					stretch,
					scale,
					fontSize
				}
			);
		}
	}

	function pointY(canvasEl: HTMLCanvasElement) {
		resizeCanvas(canvasEl, dimensions, { scale, stretch });
		const value = solveFormula(pointFormula, { y: yValue }, dimensions);
		if (value) {
			xValue = value;
			drawPoint(
				canvasEl,
				{
					x: xValue,
					y: yValue
				},
				dimensions,
				{
					stretch,
					scale,
					fontSize
				}
			);
		}
	}
</script>

<main class="flex items-center justify-center w-screen h-screen bg-zinc-700 text-zinc-200">
	<div class="flex flex-col gap-4">
		<canvas use:graph class="bg-white" />
		<canvas use:pointX bind:this={pointCanvasEl} class="absolute" />
		{#if formula.y}
			<div class="flex gap-4">
				<input
					type="range"
					bind:value={xValue}
					on:input={() => {
						pointX(pointCanvasEl);
					}}
					min={dimensions.minX}
					max={dimensions.maxX}
					{step}
				/>
				<p>x = {xValue}</p>
			</div>
		{/if}

		{#if formula.x}
			<div class="flex gap-4">
				<input
					type="range"
					bind:value={yValue}
					on:input={() => {
						pointY(pointCanvasEl);
					}}
					min={dimensions.minY}
					max={dimensions.maxY}
					{step}
				/>
				<p>y = {yValue}</p>
			</div>
		{/if}
	</div>
</main>
