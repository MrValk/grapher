<script lang="ts">
	import { Formula } from '$lib/Formula';
	import { Graph } from '$lib/Graph';

	function graph(canvasEl: HTMLCanvasElement) {
		canvasEl.width = 1000;

		const formula = new Formula('y = 1 / (1 + E^(-x))', 0.1);
		new Graph(
			canvasEl,
			formula,
			{
				horizontal: {
					min: -6,
					max: 6
				},
				vertical: {
					min: -0.5,
					max: 1.5
				}
			},
			{
				stretch: {
					horizontal: 1,
					vertical: 4
				},
				gridStep: {
					horizontal: 2,
					vertical: 0.5
				},
				fontSize: 14
			}
		).draw();
	}
</script>

<main class="flex items-center justify-center w-screen h-screen bg-zinc-700 text-zinc-200">
	<div class="flex flex-col gap-4">
		<canvas use:graph class="bg-white" />
	</div>
</main>
