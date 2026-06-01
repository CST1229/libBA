// @ts-check

// general utilities
export const logging = {
	TOO_MUCH_LOGGING: false,
	LOGGING: false,
	indent: 0,
};

/**
 * @typedef {string} Vec2String
 */

/**
 * @param {number} x
 * @param {number} y
 * @returns {Vec2String}
 */
export function vec2String(x, y) {
	return `(${x}, ${y})`;
}
/**
 * @param {Vec2String} string
 * @returns {[number, number]}
 */
export function stringVec2(string) {
	string = String(string).replace("(", "").replace(")", "");
	const split = string.split(", ").map((/** @type {string | number} */ num) => +num);
	return [split[0], split[1]];
}

/**
 * @param {{ (...data: any[]): void; }} func
 * @param {any[]} args
 */
export function indentedConsole(func, ...args) {
	if (!args[0]) return;
	args[0] = "\t".repeat(logging.indent) + String(args[0]);
	func(...args);
}
/**
 * @param {any[]} args
 */
export function indentedLog(...args) {
	if (!logging.LOGGING) return;
	return indentedConsole(console.log, ...args);
}
/**
 * @param {any[]} args
 */
export function indentedWarn(...args) {
	return indentedConsole(console.warn, ...args);
}