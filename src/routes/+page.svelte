<script lang="ts">
	import '../app.css';
	import { calcPoints, drawGraph } from '$lib/scripts/graph';

	function draw(canvasEl: HTMLCanvasElement) {
		// 1 / (1 + Math.pow(Math.E, -x))
		const formula = '1 / x';
		const dimensions = {
			minX: -10,
			maxX: 10,
			minY: -10,
			maxY: 10
		};
		const step = 0.01;
		const stretch = {
			x: 1,
			y: 1
		};
		const gridStep = {
			x: 1,
			y: 1
		};
		const fontSize = 14;

		const points = calcPoints(formula, dimensions, step);
		drawGraph(canvasEl, points, dimensions, {
			stretch,
			scale: 40,
			gridStep,
			fontSize
		});
	}
</script>

<main class="flex items-center justify-center w-screen h-screen bg-zinc-700">
	<canvas use:draw class="bg-white" />
</main>
