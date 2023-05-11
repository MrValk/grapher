import type { Formula } from '$lib/Formula';

export class Graph {
	private _canvas: HTMLCanvasElement;
	private _ctx: CanvasRenderingContext2D;
	private _scale: number;
	private _formula: Formula;
	private _axes: {
		horizontal: string;
		vertical: string;
	};
	private _points: Point[];
	private _dimensions: Dimensions;
	private _origin: Point;
	private _options: DefinedOptions;

	public constructor(
		canvas: HTMLCanvasElement,
		formula: Formula,
		dimensions: Dimensions,
		options?: Options
	) {
		this._canvas = canvas;
		this._formula = formula;
		this._dimensions = dimensions;

		// Setting default options
		if (!options) options = {};
		if (!options.stretch) options.stretch = { horizontal: 1, vertical: 1 };
		if (!options.gridStep) options.gridStep = { horizontal: 1, vertical: 1 };
		if (!options.fontSize) options.fontSize = 14;
		this._options = options as DefinedOptions;

		this._axes = {
			horizontal: this._formula._vars.horizontal || 'x',
			vertical: this._formula._vars.vertical || 'y'
		};

		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Could not get Canvas context');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		this._ctx = ctx;

		// Resize the canvas
		this._scale = this._calcScale();
		this._resizeCanvas();

		// Get translated origin coordinates
		this._origin = this._translatePoint({
			[this._axes.horizontal]: 0,
			[this._axes.vertical]: 0
		});

		// Calculate the points for the graph
		this._points = this._formula.calcPoints(this._dimensions);
		// Translate the points to canvas coordinates
		this._points = this._points.map((point) => this._translatePoint(point));
	}

	public draw() {
		// Draw the grid, axes and numbers
		this._drawBackground();

		// Draw the graph
		this._drawGraph();
	}

	private _drawGraph(canvas = this._canvas, ctx = this._ctx, points = this._points) {
		const namedPoints = points.map((point) => {
			return {
				horizontal: point[this._axes.horizontal],
				vertical: point[this._axes.vertical]
			};
		});

		// Drawing the graph
		ctx.strokeStyle = 'red';
		ctx.beginPath();
		ctx.moveTo(namedPoints[0].horizontal, namedPoints[0].vertical);
		for (let i = 1; i < namedPoints.length; i++) {
			// End the stroke if a vertical asymptote is reached
			if (Math.abs(namedPoints[i - 1].vertical - namedPoints[i].vertical) > canvas.height / 2) {
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(namedPoints[i].horizontal, namedPoints[i].vertical);
				continue;
			}

			// End the stroke if a horizontal asymptote is reached
			if (Math.abs(namedPoints[i - 1].horizontal - namedPoints[i].horizontal) > canvas.width / 2) {
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(namedPoints[i].horizontal, namedPoints[i].vertical);
				continue;
			}

			ctx.lineTo(namedPoints[i].horizontal, namedPoints[i].vertical);
		}
		ctx.stroke();

		ctx.strokeStyle = 'black';
	}

	private _drawBackground(
		canvas = this._canvas,
		ctx = this._ctx,
		scale = this._scale,
		origin = this._origin,
		options = this._options
	) {
		const { stretch, gridStep, fontSize } = options;
		const namedOrigin = {
			horizontal: origin[this._axes.horizontal],
			vertical: origin[this._axes.vertical]
		};

		const horStep = scale * stretch.horizontal * gridStep.horizontal;
		const verStep = scale * stretch.vertical * gridStep.vertical;
		const horStart = namedOrigin.horizontal % horStep;
		const verStart = namedOrigin.vertical % verStep;
		const horAxisVisible = namedOrigin.vertical > 0 && namedOrigin.vertical < canvas.height;
		const verAxisVisible = namedOrigin.horizontal > 0 && namedOrigin.horizontal < canvas.width;
		const fontMargin = (fontSize * 6) / 14;

		// Drawing the grid
		ctx.strokeStyle = '#ddd';
		ctx.lineWidth = 1;
		ctx.beginPath();

		// horizontal axis
		for (let horValue = horStart; horValue < canvas.width; horValue += horStep) {
			ctx.moveTo(horValue, 0);
			ctx.lineTo(horValue, canvas.height);
		}

		// vertical axis
		for (let verValue = verStart; verValue < canvas.height; verValue += verStep) {
			ctx.moveTo(0, verValue);
			ctx.lineTo(canvas.width, verValue);
		}

		ctx.stroke();

		// Drawing the axes
		ctx.strokeStyle = 'black';

		// x-axis
		if (horAxisVisible) {
			ctx.beginPath();
			ctx.moveTo(0, namedOrigin.vertical);
			ctx.lineTo(canvas.width, namedOrigin.vertical);
			ctx.stroke();
		}

		// y-axis
		if (verAxisVisible) {
			ctx.beginPath();
			ctx.moveTo(namedOrigin.horizontal, 0);
			ctx.lineTo(namedOrigin.horizontal, canvas.height);
			ctx.stroke();
		}

		// Drawing the numbers

		// Origin
		ctx.textAlign = 'right';
		ctx.textBaseline = 'top';
		ctx.font = `${fontSize}px Poppins`;
		if (horAxisVisible && verAxisVisible)
			ctx.fillText('0', namedOrigin.horizontal - fontMargin, namedOrigin.vertical + fontMargin);

		// If the axis aren't visible, draw the numbers along the sides
		const numXAxis = horAxisVisible ? namedOrigin.vertical : canvas.height - 2 * fontMargin;
		const numYAxis = verAxisVisible ? namedOrigin.horizontal : 2 * fontMargin;

		// Horizontal
		let horNudge = 0;
		ctx.textAlign = 'center';
		ctx.textBaseline = horAxisVisible ? 'top' : 'bottom';
		ctx.fillStyle = horAxisVisible ? 'black' : '#aaa';
		ctx.font = `${horAxisVisible ? fontSize : fontSize * 0.9}px Poppins`;
		for (let x = horStart; x <= canvas.width; x += horStep) {
			if (x === namedOrigin.horizontal) continue;

			// If the number is too close to the left edge, nudge it to the right
			if (x <= fontMargin) {
				ctx.textAlign = 'left';

				horNudge = fontMargin;
			}

			// If the number is too close to the right edge, nudge it to the left
			if (x >= canvas.width - fontMargin) {
				ctx.textAlign = 'right';

				horNudge = -fontMargin;
			}

			ctx.fillText(
				((x - namedOrigin.horizontal) / (scale * stretch.horizontal)).toString(),
				x + horNudge,
				numXAxis + fontMargin
			);

			horNudge = 0;
			ctx.textAlign = 'center';
		}

		// Vertical
		let verNudge = 0;
		ctx.textAlign = verAxisVisible ? 'right' : 'left';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = verAxisVisible ? 'black' : '#aaa';
		ctx.font = `${verAxisVisible ? fontSize : fontSize * 0.9}px Poppins`;
		for (let y = verStart; y <= canvas.height; y += verStep) {
			if (y === namedOrigin.vertical) continue;

			// If the number is too close to the top edge, nudge it to the bottom
			if (y <= fontMargin) {
				ctx.textBaseline = 'top';

				verNudge = fontMargin;
			}

			// If the number is too close to the bottom edge, nudge it to the top
			if (y >= canvas.height - fontMargin) {
				ctx.textBaseline = 'bottom';

				verNudge = -fontMargin;
			}

			ctx.fillText(
				((namedOrigin.vertical - y) / (scale * stretch.vertical)).toString(),
				numYAxis - fontMargin,
				y + verNudge
			);

			verNudge = 0;
			ctx.textBaseline = 'middle';
		}
	}

	private _translatePoint(
		point: Point,
		canvas = this._canvas,
		dimensions = this._dimensions,
		scale = this._scale,
		stretch = this._options.stretch
	): Point {
		point[this._axes.horizontal] =
			stretch.horizontal * scale * (point[this._axes.horizontal] - dimensions.horizontal.min);
		point[this._axes.vertical] =
			stretch.vertical * scale * (point[this._axes.vertical] - dimensions.vertical.min);

		point[this._axes.vertical] = canvas.height - point[this._axes.vertical];
		return point;
	}

	private _calcScale(
		canvas = this._canvas,
		dimensions = this._dimensions,
		stretch = this._options.stretch
	): number {
		// Check if a width or height has been set
		const maxWidth = parseInt(canvas.getAttribute('width') || '0');
		const maxHeight = parseInt(canvas.getAttribute('height') || '0');

		// Calculate the largest possible scale that will contain the canvas in its current dimensions
		let scale = 1;

		if (maxWidth)
			scale =
				maxWidth /
				(Math.abs(dimensions.horizontal.max - dimensions.horizontal.min) * stretch.horizontal);

		if (maxHeight) {
			const verScale =
				maxHeight /
				(Math.abs(dimensions.vertical.max - dimensions.vertical.min) * stretch.vertical);

			scale = scale !== 1 ? Math.min(scale, verScale) : verScale;
		}

		return Math.floor(scale);
	}

	private _resizeCanvas(
		canvas = this._canvas,
		dimensions = this._dimensions,
		scale = this._scale,
		stretch = this._options.stretch
	) {
		canvas.width =
			Math.abs(dimensions.horizontal.max - dimensions.horizontal.min) * scale * stretch.horizontal;
		canvas.height =
			Math.abs(dimensions.vertical.max - dimensions.vertical.min) * scale * stretch.vertical;
	}
}
