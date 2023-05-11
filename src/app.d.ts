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

	type Coordinate = {
		[varName: string]: number;
	};

	type DrawOptions = {
		stretch: { horizontal: number; vertical: number };
		gridStep: { horizontal: number; vertical: number };
		fontSize: number;
	};

	type Dimensions = {
		horizontal: {
			min: number;
			max: number;
		};
		vertical: {
			min: number;
			max: number;
		};
	};
}

export {};
