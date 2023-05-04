type Point = {
	x: number;
	y: number;
};

export function calcPoints(
	formula: string,
	dimensions: {
		minX: number;
		maxX: number;
		minY: number;
		maxY: number;
	},
	step: number
): Point[] {
	if (step <= 0) throw new Error('Step must be greater than 0');
	if (dimensions.minX >= dimensions.maxX) throw new Error('minX must be less than maxX');
	if (dimensions.minY >= dimensions.maxY) throw new Error('minY must be less than maxY');

	const points: Point[] = [];
	let x = dimensions.minX;

	while (x <= dimensions.maxX) {
		const y = new Function('x', `return ${formula}`)(x);
		if (y >= dimensions.minY && y <= dimensions.maxY) {
			points.push({ x, y });
		}
		x += step;
	}

	return points;
}

export function drawGraph(
	canvas: HTMLCanvasElement,
	points: Point[],
	dimensions: { minX: number; maxX: number; minY: number; maxY: number },
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
	canvas.width = Math.abs(dimensions.maxX - dimensions.minX) * scale * stretch.x;
	canvas.height = Math.abs(dimensions.maxY - dimensions.minY) * scale * stretch.y;
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
		translatePoint(point, dimensions, {
			scale,
			stretch
		})
	);

	// Drawing the graph
	ctx.strokeStyle = 'red';
	ctx.beginPath();
	ctx.moveTo(points[0].x, canvas.height - points[0].y);
	for (let i = 1; i < points.length; i++) {
		// End the stroke if a vertical asymptote is reached
		if (Math.abs(points[i - 1].y - points[i].y) > canvas.height / 2) {
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(points[i].x, canvas.height - points[i].y);
			continue;
		}

		ctx.lineTo(points[i].x, canvas.height - points[i].y);
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

	// Drawing the grid (in steps of 1 unit)
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
	ctx.font = `${fontSize}px Poppins`;
	ctx.fillStyle = 'black';

	// Origin
	ctx.textAlign = 'right';
	ctx.textBaseline = 'top';
	if (xAxisVisible && yAxisVisible) ctx.fillText('0', origin.x - fontMargin, origin.y + fontMargin);

	// If the axis aren't visible, draw the numbers along the sides
	const numXAxis = xAxisVisible ? origin.y : canvas.height - 2 * fontMargin;
	const numYAxis = yAxisVisible ? origin.x : 2 * fontMargin;

	// Horizontal
	ctx.textAlign = 'center';
	ctx.textBaseline = xAxisVisible ? 'top' : 'bottom';
	for (let x = xStart; x <= canvas.width; x += xStep) {
		if (x === origin.x) continue;
		ctx.fillText(((x - origin.x) / (scale * stretch.x)).toString(), x, numXAxis + fontMargin);
	}
	// Vertical
	ctx.textAlign = yAxisVisible ? 'right' : 'left';
	ctx.textBaseline = 'middle';
	for (let y = yStart; y <= canvas.height; y += yStep) {
		if (y === origin.y) continue;
		ctx.fillText(((origin.y - y) / (scale * stretch.y)).toString(), numYAxis - fontMargin, y);
	}
}

function translatePoint(
	point: Point,
	dimensions: { minX: number; maxX: number; minY: number; maxY: number },
	options: { scale: number; stretch: { x: number; y: number } }
): Point {
	const { scale, stretch } = options;
	point.x *= stretch.x;
	point.y *= stretch.y;

	point.x -= dimensions.minX * stretch.x;
	point.y -= dimensions.minY * stretch.y;

	point.x *= scale;
	point.y *= scale;
	return point;
}
