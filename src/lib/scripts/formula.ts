/* eslint-disable @typescript-eslint/ban-ts-comment */
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra.js';
import 'nerdamer/Calculus.js';
import 'nerdamer/Solve.js';

/**
 * Calculates two-dimensional points for the given formula, within the given dimensions, at intervals of the given step value.
 * Variables can have any name, as long as they don't conflict with constants (including standard mathematical constants like E and PI)
 *
 * **Formulas with one variable:**
 * A variable not named x or y will be treated as the vertical coordinate
 *
 * **Formulas with two variables. One named x or y:**
 * The other variable will be treated as the leftover coordinate
 *
 * **Formulas with two variables. Neither named x or y:**
 * The first encountered variable will be treated as the vertical coordinate and the second as the horizontal coordinate
 *
 * @param formula Any formula with one or two variables
 * @param dimensions The dimensions of the graph window
 * @param step The step value for the axes
 * @param consts Any constants used in the formula
 * @returns An array of two-dimensional points
 */
export function calcPoints(
	formula: string,
	dimensions: Dimensions,
	step = 0.1,
	consts?: { [varName: string]: number }
): Point[] {
	// #region Input values error handling
	if (step <= 0) throw new Error('Step must be greater than 0');
	if (dimensions.minX >= dimensions.maxX) throw new Error('minX must be less than maxX');
	if (dimensions.minY >= dimensions.maxY) throw new Error('minY must be less than maxY');
	// #endregion

	// Fill in the constant values
	if (consts) formula = solve(formula, consts).toString();

	const variables = nerdamer(formula).variables();
	//#region Variable error handling
	if (variables.length === 0) throw new Error('Formula does not contain any variables');
	if (variables.length > 2)
		throw new Error('Formulas with more than 2 variables are not supported');
	//#endregion

	// Find the horizontal and vertical variables, according to the rules in the function description
	let horizontalVar: string | undefined;
	let verticalVar: string | undefined;
	if (variables.length === 1)
		[horizontalVar, verticalVar] = variables.includes('x')
			? ['x', undefined]
			: variables.includes('y')
			? [undefined, 'y']
			: [undefined, variables[0]];
	if (variables.length === 2)
		[horizontalVar, verticalVar] = variables.includes('x')
			? ['x', variables.find((v) => v !== 'x')]
			: variables.includes('y')
			? [variables.find((v) => v !== 'y'), 'y']
			: [variables[1], variables[0]];

	// Solve for both variables
	let yEquals: string[] = [];
	let xEquals: string[] = [];

	// If the formula already starts with verticalVar = something, don't solve for it
	if (verticalVar) {
		if (formula.replace(/\s/g, '').startsWith(`${verticalVar}=`))
			yEquals.push(formula.replace(/\s/g, '').replace(`${verticalVar}=`, ''));
		else
			try {
				yEquals = solveFor(formula, verticalVar);
			} catch (e) {
				console.error(e);
			}
	}

	// If the formula already starts with horizontalVar = something, don't solve for it
	if (horizontalVar) {
		if (formula.replace(/\s/g, '').startsWith(`${horizontalVar}=`))
			xEquals.push(formula.replace(/\s/g, '').replace(`${horizontalVar}=`, ''));
		else
			try {
				xEquals = solveFor(formula, horizontalVar);
			} catch (e) {
				console.error(e);
			}
	}

	if (yEquals.length === 0 && xEquals.length === 0)
		throw new Error('Formula could not be solved for either variable');
	if (verticalVar && yEquals.length === 0)
		console.warn(`Formula could not be solved for ${verticalVar}`);
	if (horizontalVar && xEquals.length === 0)
		console.warn(`Formula could not be solved for ${horizontalVar}`);

	// Optimization for equations with only one variable
	if (variables.length === 1) {
		if (horizontalVar === 'x') {
			const x = parseFloat(xEquals[0]);
			return [
				{
					x,
					y: dimensions.minY
				},
				{
					x,
					y: dimensions.maxY
				}
			];
		} else if (verticalVar) {
			const value = parseFloat(yEquals[0]);
			return [
				{
					x: dimensions.minX,
					[verticalVar]: value
				},
				{
					x: dimensions.maxX,
					[verticalVar]: value
				}
			];
		}
	}

	if (!horizontalVar || !verticalVar) throw new Error('Unexpected error');

	// Calculate the points
	const points: Point[] = [];
	if (yEquals.length > 0)
		for (let x = dimensions.minX; x <= dimensions.maxX; x += step) {
			for (const yEqual of yEquals) {
				let y: number;
				try {
					y = parseFloat(solve(yEqual, { [horizontalVar]: x }).toString());
				} catch (_) {
					continue;
				}
				if (y >= dimensions.minY && y <= dimensions.maxY)
					points.push({ [horizontalVar]: x, [verticalVar]: y });
			}
		}

	if (xEquals.length > 0)
		for (let y = dimensions.minY; y <= dimensions.maxY; y += step) {
			for (const xEqual of xEquals) {
				let x: number;
				try {
					x = parseFloat(solve(xEqual, { [verticalVar]: y }).toString());
				} catch (_) {
					continue;
				}
				if (x >= dimensions.minX && x <= dimensions.maxX)
					points.push({ [horizontalVar]: x, [verticalVar]: y });
			}
		}

	return points;
}

export function solve(formula: string, vars: { [varName: string]: number }): number | string {
	formula = parseFormula(formula);

	const parsedVars: { [varName: string]: string } = {};
	for (const key in vars) {
		parsedVars[key] = vars[key].toString();
	}

	const result = nerdamer(formula, parsedVars, ['numer']).text();

	if (!isNumeric(result)) return result;
	return parseFloat(result);
}

export function solveFor(formula: string, varName: string): string[] {
	formula = parseFormula(formula);

	const solutions = nerdamer(formula).solveFor(varName);
	if (Array.isArray(solutions)) return solutions.map((x) => nerdamer(`simplify(${x})`).text());
	return [nerdamer(`simplify(${solutions})`).text()];
}

function parseFormula(formula: string): string {
	// Custom parsing
	// Replace all instances of log with log10
	formula = formula.replace(/log/g, 'log10');
	// Replace all instances of ln with log
	formula = formula.replace(/ln/g, 'log');

	return formula;
}

function isNumeric(str: string): boolean {
	// @ts-ignore
	return !isNaN(str) && !isNaN(parseFloat(str));
}
