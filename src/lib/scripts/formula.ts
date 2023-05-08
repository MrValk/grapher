import * as math from 'mathjs';

import nerdamer from 'nerdamer';
import 'nerdamer/Algebra.js';
import 'nerdamer/Calculus.js';
import 'nerdamer/Solve.js';

// Function that changes the notation of a formula to JavaScript notation
export function parseFormula(formula: string): string {
	// Use MathJS and MathJax to parse and display formulas
	// MathJS: https://mathjs.org/docs/expressions/parsing.html
	// MathJax: https://www.npmjs.com/package/mathjax

	nerdamer('y = x^2 + x + 1')
		.solveFor('x')
		.forEach((x) => console.log(nerdamer(`simplify(${x.toString()})`).toString()));

	// console.log(math.chain);

	// console.log(math.compile(formula));
	// console.log(math.compile(formula).evaluate({ x: -1 }));

	return formula;
}
