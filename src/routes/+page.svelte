<script lang="ts">
	import '../app.css';
	import { calcPoints, drawGraph } from '$lib/scripts/graph';

	function draw(canvasEl: HTMLCanvasElement) {
		// 1 / (1 + Math.pow(Math.E, -x))
		const formula = {
			y: '1 / (1 + Math.pow(Math.E, -x))'
		};
		const dimensions = {
			minX: -6,
			maxX: 6,
			minY: -0.5,
			maxY: 1.5
		};
		const step = 0.0001;
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

		const points = calcPoints(formula, dimensions, step);
		drawGraph(canvasEl, points, dimensions, {
			stretch,
			scale,
			gridStep,
			fontSize
		});
	}
</script>

<main class="flex items-center justify-center w-screen h-screen bg-zinc-700">
	<canvas use:draw class="bg-white" />
</main>
