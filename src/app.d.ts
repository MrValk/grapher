// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	type Point = {
		[varName: string]: number;
	};

	type Formula = {
		y?: string;
		x?: string;
		k?: {
			y?: {
				start: number;
				end: number;
				factor: number;
			};
			x?: {
				start: number;
				end: number;
				factor: number;
			};
		};
	};

	type PointFormula = {
		y?: string;
		x?: string;
		k?: {
			y?: {
				value: number;
				factor: number;
			};
			x?: {
				value: number;
				factor: number;
			};
		};
	};

	type Dimensions = {
		minX: number;
		maxX: number;
		minY: number;
		maxY: number;
	};
}

export {};
