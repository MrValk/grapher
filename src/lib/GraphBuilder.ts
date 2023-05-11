import type { Formula } from '$lib/Formula';
import { Graph } from '$lib/Graph';

export class GraphBuilder {
	private _canvas: HTMLCanvasElement;
	private _formula: Formula;
	private _dimensions: Dimensions;
	private _options: Options;

	/**
	 * Starts the graph builder with some default values.
	 *
	 * - Use the set~ methods to change the values.
	 * - Run the get() method to get a built Graph instance.
	 * - Run the draw() method to draw the graph.
	 * @param canvas The canvas element to draw a graph on
	 * @param formula An instance of the Formula class
	 */
	public constructor(canvas: HTMLCanvasElement, formula: Formula) {
		this._canvas = canvas;
		this._formula = formula;
		this._dimensions = {
			horizontal: {
				min: -10,
				max: 10
			},
			vertical: {
				min: -10,
				max: 10
			}
		};
		this._options = {
			stretch: {
				horizontal: 1,
				vertical: 1
			},
			gridStep: {
				horizontal: 1,
				vertical: 1
			},
			fontSize: 14
		};
	}

	/**
	 * Overrides the default dimensions of the graph.
	 * @param dimensions The horizontal and vertical dimensions of the graph in units
	 * @returns The GraphBuilder instance
	 * @default { horizontal: { min: -10, max: 10 }, vertical: { min: -10, max: 10 } }
	 */
	public setDimensions(dimensions: Dimensions) {
		this._dimensions = dimensions;

		return this;
	}

	/**
	 * Stretches the graph horizontally and vertically.
	 * @param stretch The horizontal and vertical stretch of the graph
	 * @returns The GraphBuilder instance
	 * @default { horizontal: 1, vertical: 1 }
	 */
	public setStretch(stretch: { horizontal: number; vertical: number }) {
		this._options.stretch = stretch;

		return this;
	}

	/**
	 * Sets the horizontal and vertical distance between grid lines and numbers.
	 * @param gridStep The horizontal and vertical distance between grid lines and numbers
	 * @returns The GraphBuilder instance
	 * @default { horizontal: 1, vertical: 1 }
	 */
	public setGridStep(gridStep: { horizontal: number; vertical: number }) {
		this._options.gridStep = gridStep;

		return this;
	}

	/**
	 * Sets the font size of the numbers on the graph.
	 * @param fontSize The font size of the numbers on the graph in pixels
	 * @returns The GraphBuilder instance
	 * @default 14
	 */
	public setFontSize(fontSize: number) {
		this._options.fontSize = fontSize;

		return this;
	}

	/**
	 * Builds and draws the graph on the canvas. Finishes the GraphBuilder chain.
	 */
	public draw() {
		const graph = new Graph(this._canvas, this._formula, this._dimensions, this._options);
		graph.draw();
	}

	/**
	 * Builds the Graph instance. Finishes the GraphBuilder chain.
	 * @returns A Graph instance with the current settings
	 */
	public get() {
		return new Graph(this._canvas, this._formula, this._dimensions, this._options);
	}
}
