<script lang="ts">
	import { Formula } from '$lib/Formula';
	import { GraphBuilder } from '$lib/GraphBuilder';

	function graph(canvasEl: HTMLCanvasElement) {
		const formula = new Formula('y = 1 / (1 + E^(-x))', 0.1);
		new GraphBuilder(canvasEl, formula)
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
			.draw();
	}
</script>

<main class="flex items-center justify-center w-screen h-screen bg-zinc-700 text-zinc-200">
	<div class="flex flex-col gap-4">
		<canvas use:graph class="bg-white" width="1000" height="800" />
	</div>
</main>
