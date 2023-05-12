import nerdamer from 'nerdamer';
import 'nerdamer/Algebra.js';
import 'nerdamer/Calculus.js';
import 'nerdamer/Solve.js';

import { isNumeric } from '$lib/utils/isNumeric';

export class Formula {
	// Formula related
	public readonly _formulas: {
		horizontal: string[];
		vertical: string[];
	};
	public readonly _vars: {
		horizontal?: string;
		vertical?: string;
	};
	public readonly _step: number;
	public readonly _consts?: { [constName: string]: number };

	/**
	 * Initializes a new Formula object with the given formula and constants.
	 * Tries to solve the formula for both variables and saves any variables and constants used in the formula.
	 * Variables can have any name, as long as they don't conflict with constants (including standard mathematical constants like E and PI).
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
	 * @param step The interval between points on the axes
	 * @param consts Any constants used in the formula
	 */
	public constructor(formula: string, step = 0.1, consts?: { [constName: string]: number }) {
		this._step = step;
		this._consts = consts;

		// Fill in the constant values
		if (consts) {
			const solution = this.solve(formula, consts);
			if (solution === undefined)
				throw new Error('Formula could not be solved with the given constants');
			formula = solution.toString();
		}
		formula = this._parseFormula(formula);

		const variables = nerdamer(formula).variables();

		//#region Variable error handling
		if (variables.length === 0) throw new Error('Formula does not contain any variables');
		if (variables.length > 2)
			throw new Error('Formulas with more than 2 variables are not supported');
		//#endregion

		// Find the horizontal and vertical variables, according to the rules in the function description
		this._vars = {};
		if (variables.length === 1)
			[this._vars.horizontal, this._vars.vertical] = variables.includes('x')
				? ['x', undefined]
				: variables.includes('y')
				? [undefined, 'y']
				: [undefined, variables[0]];
		if (variables.length === 2)
			[this._vars.horizontal, this._vars.vertical] = variables.includes('x')
				? ['x', variables.find((v) => v !== 'x')]
				: variables.includes('y')
				? [variables.find((v) => v !== 'y'), 'y']
				: [variables[1], variables[0]];

		// Determine which variable to solve for (default to vertical)
		this._formulas = {
			horizontal: [],
			vertical: []
		};

		const parsedFormula = formula.replace(/\s/g, '');
		const startsWith =
			this._vars.vertical && parsedFormula.startsWith(`${this._vars.vertical}=`)
				? 'vertical'
				: this._vars.horizontal && parsedFormula.startsWith(`${this._vars.horizontal}=`)
				? 'horizontal'
				: undefined;

		// If the formula already starts with verticalVar =, take that as the formula
		if (startsWith === 'vertical')
			this._formulas.vertical.push(parsedFormula.replace(`${this._vars.vertical}=`, ''));
		// If the formula already starts with horizontalVar =, take that as the formula
		else if (startsWith === 'horizontal')
			this._formulas.horizontal.push(parsedFormula.replace(`${this._vars.horizontal}=`, ''));

		// Try to solve for the vertical variable
		if (this._vars.vertical && startsWith !== 'vertical')
			try {
				this._formulas.vertical = this._solveFor(formula, this._vars.vertical);
			} catch {
				console.warn(`Formula could not be solved for ${this._vars.vertical}`);
			}
		// Try to solve for the horizontal variable
		if (this._vars.horizontal && startsWith !== 'horizontal')
			try {
				this._formulas.horizontal = this._solveFor(formula, this._vars.horizontal);
			} catch {
				console.warn(`Formula could not be solved for ${this._vars.horizontal}`);
			}

		// For single-variables formulas that don't start with the variable, assume it equals the other variable
		if (!startsWith && !(this._vars.vertical && this._vars.horizontal)) {
			if (this._vars.vertical) {
				this._vars.horizontal = 'x';
				this._formulas.horizontal.push(formula);
			} else if (this._vars.horizontal) {
				this._vars.vertical = 'y';
				this._formulas.vertical.push(formula);
			}
		}

		if (this._formulas.vertical.length === 0 && this._formulas.horizontal.length === 0)
			throw new Error('Formula could not be solved for either variable');
	}

	/**
	 * Calculates two-dimensional points for the stored formula, within the given dimensions, at intervals of the given step value.
	 *
	 * @param dimensions The dimensions of the graph window
	 * @param step The step value for the axes
	 * @returns An array of two-dimensional points
	 */
	public calcPoints(dimensions: Dimensions, step = this._step): Point[] {
		// #region Input values error handling
		if (step <= 0) throw new Error('Step must be greater than 0');
		if (dimensions.horizontal.min >= dimensions.horizontal.max)
			throw new Error('minX must be less than maxX');
		if (dimensions.vertical.min >= dimensions.vertical.max)
			throw new Error('minY must be less than maxY');
		// #endregion

		// Optimization for linear equations with only one variable
		if (!this._vars.horizontal || !this._vars.vertical) {
			if (this._vars.horizontal === 'x' && this._formulas.horizontal.length) {
				const x = parseFloat(this._formulas.horizontal[0]);
				const points: Point[] = [];
				for (let y = dimensions.vertical.min; y <= dimensions.vertical.max; y += step) {
					points.push({
						x,
						y
					});
				}
				return points;
			} else if (this._vars.vertical && this._formulas.vertical.length) {
				const verValue = parseFloat(this._formulas.vertical[0]);
				const points: Point[] = [];
				for (let x = dimensions.horizontal.min; x <= dimensions.horizontal.max; x += step) {
					points.push({
						x,
						[this._vars.vertical]: verValue
					});
				}
				return points;
			}
		}

		if (!this._vars.horizontal || !this._vars.vertical) throw new Error('Unexpected error');

		// Calculate the points
		const points: Point[] = [];

		if (this._formulas.horizontal.length)
			for (const xEqual of this._formulas.horizontal) {
				for (
					let verValue = dimensions.vertical.min;
					verValue <= dimensions.vertical.max;
					verValue += step
				) {
					let horValue: number;
					try {
						const solution = this.solve(xEqual, { [this._vars.vertical]: verValue });
						if (solution === undefined) continue;
						horValue = parseFloat(solution.toString());
					} catch (_) {
						continue;
					}
					if (
						horValue >= dimensions.horizontal.min - 10 * step &&
						horValue <= dimensions.horizontal.max + 10 * step
					)
						points.push({ [this._vars.horizontal]: horValue, [this._vars.vertical]: verValue });
				}
			}

		if (this._formulas.vertical.length)
			for (const yEqual of this._formulas.vertical) {
				for (
					let horValue = dimensions.horizontal.min;
					horValue <= dimensions.horizontal.max;
					horValue += step
				) {
					let verValue: number;
					try {
						const solution = this.solve(yEqual, { [this._vars.horizontal]: horValue });
						if (solution === undefined) continue;
						verValue = parseFloat(solution.toString());
					} catch (_) {
						continue;
					}
					if (
						verValue >= dimensions.vertical.min - 10 * step &&
						verValue <= dimensions.vertical.max + 10 * step
					)
						points.push({ [this._vars.horizontal]: horValue, [this._vars.vertical]: verValue });
				}
			}

		return points;
	}

	public solve(formula: string, vars: { [varName: string]: number }): number | string | undefined {
		formula = this._parseFormula(formula);

		const parsedVars: { [varName: string]: string } = {};
		for (const key in vars) {
			parsedVars[key] = vars[key].toString();
		}

		const result = nerdamer(formula, parsedVars, ['numer']).text();

		if (result.includes('i')) return undefined;

		if (!isNumeric(result)) return result;
		return parseFloat(result);
	}

	private _solveFor(formula: string, varName: string): string[] {
		formula = this._parseFormula(formula);

		const solutions = nerdamer(formula).solveFor(varName);
		if (Array.isArray(solutions)) return solutions.map((x) => nerdamer(`simplify(${x})`).text());
		return [nerdamer(`simplify(${solutions})`).text()];
	}

	private _parseFormula(formula: string): string {
		// Custom parsing
		// Replace all instances of log with log10
		formula = formula.replace(/log/g, 'log10');
		// Replace all instances of ln with log
		formula = formula.replace(/ln/g, 'log');

		return formula;
	}
}
