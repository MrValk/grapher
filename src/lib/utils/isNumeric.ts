/* eslint-disable @typescript-eslint/ban-ts-comment */
export function isNumeric(str: string): boolean {
	// @ts-ignore
	return !isNaN(str) && !isNaN(parseFloat(str));
}
