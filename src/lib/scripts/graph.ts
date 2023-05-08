export function calcPoints(formula: Formula, dimensions: Dimensions, step: number): Point[] {
	// #region Error handling
	if (step <= 0) throw new Error('Step must be greater than 0');
	if (dimensions.minX >= dimensions.maxX) throw new Error('minX must be less than maxX');
	if (dimensions.minY >= dimensions.maxY) throw new Error('minY must be less than maxY');
	if (formula.k) {
		if (formula.k.y) {
			if (formula.k.y.factor <= 0) throw new Error('k.y.factor must be greater than 0');
			if (formula.k.y.start >= formula.k.y.end)
				throw new Error('k.y.start must be less than k.y.end');
		}
		if (formula.k.x) {
			if (formula.k.x.factor <= 0) throw new Error('k.x.factor must be greater than 0');
			if (formula.k.x.start >= formula.k.x.end)
				throw new Error('k.x.start must be less than k.x.end');
		}
	} else {
		formula.k = {
			y: { start: 0, end: 0, factor: 1 },
			x: { start: 0, end: 0, factor: 1 }
		};
	}
	// #endregion
	const ky = formula.k.y || { start: 0, end: 0, factor: 1 };
	const kx = formula.k.x || { start: 0, end: 0, factor: 1 };

	const points: Point[] = [];

	if (formula.y)
		for (let k = ky.start; k <= ky.end; k += 1) {
			let x = dimensions.minX;

			while (x <= dimensions.maxX) {
				const y = new Function('x', `return ${formula.y} + ${k * ky.factor}`)(x);
				if (y >= dimensions.minY && y <= dimensions.maxY) {
					points.push({ x, y });
				}
				x += step;
			}
		}

	if (formula.x) {
		for (let k = kx.start; k <= kx.end; k += 1) {
			let y = dimensions.minY;

			while (y <= dimensions.maxY) {
				const x = new Function('y', `return ${formula.x} + ${k * kx.factor}`)(y);
				if (x >= dimensions.minX && x <= dimensions.maxX) {
					points.push({ x, y });
				}
				y += step;
			}
		}
	}

	return points;
}

export function solveFormula(
	formula: PointFormula,
	value: {
		x?: number;
		y?: number;
	},
	dimensions: Dimensions
): number | undefined {
	// #region Error handling
	if (dimensions.minX >= dimensions.maxX) throw new Error('minX must be less than maxX');
	if (dimensions.minY >= dimensions.maxY) throw new Error('minY must be less than maxY');
	if (formula.k) {
		if (formula.k.y && formula.k.y.factor <= 0) throw new Error('k.y.step must be greater than 0');
		if (formula.k.x && formula.k.x.factor <= 0) throw new Error('k.x.step must be greater than 0');
	} else {
		formula.k = {
			y: { value: 0, factor: 1 },
			x: { value: 0, factor: 1 }
		};
	}
	// #endregion

	const ky = formula.k.y || { value: 0, factor: 1 };
	const kx = formula.k.x || { value: 0, factor: 1 };

	if (formula.y && value.x !== undefined) {
		const y = new Function('x', `return ${formula.y} + ${ky.value * ky.factor}`)(value.x);
		if (y >= dimensions.minY && y <= dimensions.maxY) return y;
	}

	if (formula.x && value.y !== undefined) {
		const x = new Function('y', `return ${formula.x} + ${kx.value * kx.factor}`)(value.y);
		if (x >= dimensions.minY && x <= dimensions.maxX) return x;
	}
}

export function drawGraph(
	canvas: HTMLCanvasElement,
	points: Point[],
	dimensions: Dimensions,
	options?: {
		scale?: number;
		stretch?: { x: number; y: number };
		gridStep?: { x: number; y: number };
		fontSize?: number;
	}
): void {
	// Setting default options
	if (!options) options = { scale: 1, stretch: { x: 1, y: 1 }, gridStep: { x: 1, y: 1 } };
	if (!options.scale) options.scale = 1;
	if (!options.stretch) options.stretch = { x: 1, y: 1 };
	if (!options.gridStep) options.gridStep = { x: 1, y: 1 };
	if (!options.fontSize) options.fontSize = 14;

	const { scale, stretch } = options;

	// Translated origin coordinates
	const origin = {
		x: -dimensions.minX * scale * stretch.x,
		y: canvas.height + dimensions.minY * scale * stretch.y
	};

	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the grid, axis and numbers
	drawGrid(ctx, canvas, origin, {
		stretch,
		scale,
		step: options.gridStep,
		fontSize: options.fontSize
	});

	if (!points.length) return;

	// Translate points to canvas coordinates
	points = points.map((point) =>
		translatePoint(canvas, point, dimensions, {
			scale,
			stretch
		})
	);

	// Drawing the graph
	ctx.strokeStyle = 'red';
	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);
	for (let i = 1; i < points.length; i++) {
		// End the stroke if a vertical asymptote is reached
		if (Math.abs(points[i - 1].y - points[i].y) > canvas.height / 2) {
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(points[i].x, points[i].y);
			continue;
		}

		// End the stroke if a horizontal asymptote is reached
		if (Math.abs(points[i - 1].x - points[i].x) > canvas.width / 2) {
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(points[i].x, points[i].y);
			continue;
		}

		ctx.lineTo(points[i].x, points[i].y);
	}
	ctx.stroke();

	ctx.strokeStyle = 'black';
}

function drawGrid(
	ctx: CanvasRenderingContext2D,
	canvas: HTMLCanvasElement,
	origin: { x: number; y: number },
	options: {
		scale: number;
		stretch: { x: number; y: number };
		step: { x: number; y: number };
		fontSize: number;
	}
): void {
	const { stretch, scale, step, fontSize } = options;
	const xStep = scale * stretch.x * step.x;
	const yStep = scale * stretch.y * step.y;
	const xStart = origin.x % xStep;
	const yStart = origin.y % yStep;
	const xAxisVisible = origin.y > 0 && origin.y < canvas.height;
	const yAxisVisible = origin.x > 0 && origin.x < canvas.width;
	const fontMargin = (fontSize * 6) / 14;

	// Drawing the grid
	ctx.strokeStyle = '#ddd';
	ctx.lineWidth = 1;
	ctx.beginPath();

	// x-axis
	for (let x = xStart; x < canvas.width; x += xStep) {
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas.height);
	}

	// y-axis
	for (let y = yStart; y < canvas.height; y += yStep) {
		ctx.moveTo(0, y);
		ctx.lineTo(canvas.width, y);
	}

	ctx.stroke();

	// Drawing the axes
	ctx.strokeStyle = 'black';

	// x-axis
	if (xAxisVisible) {
		ctx.beginPath();
		ctx.moveTo(0, origin.y);
		ctx.lineTo(canvas.width, origin.y);
		ctx.stroke();
	}

	// y-axis
	if (yAxisVisible) {
		ctx.beginPath();
		ctx.moveTo(origin.x, 0);
		ctx.lineTo(origin.x, canvas.height);
		ctx.stroke();
	}

	// Drawing the numbers

	// Origin
	ctx.textAlign = 'right';
	ctx.textBaseline = 'top';
	ctx.font = `${fontSize}px Poppins`;
	if (xAxisVisible && yAxisVisible) ctx.fillText('0', origin.x - fontMargin, origin.y + fontMargin);

	// If the axis aren't visible, draw the numbers along the sides
	const numXAxis = xAxisVisible ? origin.y : canvas.height - 2 * fontMargin;
	const numYAxis = yAxisVisible ? origin.x : 2 * fontMargin;

	// Horizontal
	let horNudge = 0;
	ctx.textAlign = 'center';
	ctx.textBaseline = xAxisVisible ? 'top' : 'bottom';
	ctx.fillStyle = xAxisVisible ? 'black' : '#aaa';
	ctx.font = `${xAxisVisible ? fontSize : fontSize * 0.9}px Poppins`;
	for (let x = xStart; x <= canvas.width; x += xStep) {
		if (x === origin.x) continue;

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
			((x - origin.x) / (scale * stretch.x)).toString(),
			x + horNudge,
			numXAxis + fontMargin
		);

		horNudge = 0;
		ctx.textAlign = 'center';
	}

	// Vertical
	let verNudge = 0;
	ctx.textAlign = yAxisVisible ? 'right' : 'left';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = yAxisVisible ? 'black' : '#aaa';
	ctx.font = `${yAxisVisible ? fontSize : fontSize * 0.9}px Poppins`;
	for (let y = yStart; y <= canvas.height; y += yStep) {
		if (y === origin.y) continue;

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
			((origin.y - y) / (scale * stretch.y)).toString(),
			numYAxis - fontMargin,
			y + verNudge
		);

		verNudge = 0;
		ctx.textBaseline = 'middle';
	}
}

export function drawPoint(
	canvas: HTMLCanvasElement,
	point: Point,
	dimensions: Dimensions,
	options: {
		scale: number;
		stretch: { x: number; y: number };
		fontSize: number;
	}
) {
	const { fontSize } = options;
	const radius = fontSize / 3;

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	// Wipe canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const translatedPoint = translatePoint(canvas, structuredClone(point), dimensions, options);

	ctx.fillStyle = 'darkred';
	ctx.beginPath();
	ctx.arc(translatedPoint.x, translatedPoint.y, radius, 0, 2 * Math.PI);
	ctx.fill();

	// Draw the y value above it
	ctx.textAlign = 'left';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = '#777';
	ctx.font = `${fontSize}px Poppins`;
	ctx.fillText(point.y.toFixed(2).toString(), translatedPoint.x + 2 * radius, translatedPoint.y);
}

function translatePoint(
	canvas: HTMLCanvasElement,
	point: Point,
	dimensions: Dimensions,
	options: { scale: number; stretch: { x: number; y: number } }
): Point {
	const { scale, stretch } = options;
	point.x *= stretch.x;
	point.y *= stretch.y;

	point.x -= dimensions.minX * stretch.x;
	point.y -= dimensions.minY * stretch.y;

	point.x *= scale;
	point.y *= scale;

	point.y = canvas.height - point.y;
	return point;
}

export function resizeCanvas(
	canvas: HTMLCanvasElement,
	dimensions: Dimensions,
	options: { scale: number; stretch: { x: number; y: number } }
) {
	const { scale, stretch } = options;
	canvas.width = Math.abs(dimensions.maxX - dimensions.minX) * scale * stretch.x;
	canvas.height = Math.abs(dimensions.maxY - dimensions.minY) * scale * stretch.y;
}
