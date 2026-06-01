// @ŧs-check

/**
 * @typedef {Object} libBAOptions
 * @property {bool} effectiveIDsUseGroups 
 * @property {bool} effectiveIDsUseDiagonals 
 */

/** @type {libBAOptions} */
const defaultOptions = {
	effectiveIDsUseGroups: true,
	effectiveIDsUseDiagonals: true,
};
const optionsStack = [defaultOptions];

export function pushOptions(options = {}) {
	optionsStack.push({...getCurrentOptions(), options});
}
export function popOptions() {
	if (optionsStack.length <= 1) return;
	optionsStack.pop();
}
export function getCurrentOptions() {
	return optionsStack[optionsStack.length - 1];
}