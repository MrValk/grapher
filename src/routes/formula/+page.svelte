<script lang="ts">
	import { calcPoints } from '$lib/scripts/formula';

	// const results = parseFormula('log(x)');
	// console.log(solve('x + 3 + c', { x: 2, c: 2.4 }));
	// console.log(solveFor('y = x^2', 'x'));
	console.log(
		calcPoints(
			'a = 5 - b',
			{
				minX: -10,
				maxX: 10,
				minY: -10,
				maxY: 10
			},
			0.1,
			{ c: 2 }
		)
	);
</script>

<!-- {#each results as result}
	<p>{result}</p>
{/each} -->
