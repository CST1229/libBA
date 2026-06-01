// @ts-check

import * as data from "./baData.mjs";
import {TILES_BY_NAME} from "./baData.mjs";
import {getCurrentOptions} from "./options.mjs";

/**
 * @file
 * "Effective tiles" are abstractions of tile/variant/rotation IDs,
 * for closer representation to how the editor displays objects.
 * There are a few components to effective tiles:
 * 1. Some objects are "grouped" in the editor (i.e the classic ground types).
 *      These have different raw tile IDs and a variant of 0,
 *      but have the same effective tile ID and different variants.
 * 2. Diagonally rotated objects live under a different raw tile ID from their cardinal versions.
 *      These are abstracted away by effective rotations,
 *      into different effective rotations of the same ffective tile ID.
 * 3. Rotation IDs are inconsistent (e.g rotations starting from right OR up,
 *      and "rotation exceptions" where tiles use their rotation as a second variant that goes above 4 rotations).
 *      These are ALSO abstracted away by effective rotations.
 */

/**
 * Effective rotations, for convienience and abstraction of diagonal rotations and other stuff.
 * 
 * Chisel rotations: 1 means chiseled out (hole/nonsolid).
 *   Bits from least significant to most significant:
 *   top left, top right, bottom left, bottom right
 * Clock rotations: First direction is minute hand, second direction is hour hand.
 * 
 * @readonly
 * @enum {string}
 */
export const EffectiveRotations = {
	no_rotation: "",

	up: "",
	right: "",
	down: "",
	left: "",
	upright: "",
	downright: "",
	downleft: "",
	upleft: "",

	chisel_0000: "",
	chisel_0001: "",
	chisel_0010: "",
	chisel_0011: "",
	chisel_0100: "",
	chisel_0101: "",
	chisel_0110: "",
	chisel_0111: "",
	chisel_1000: "",
	chisel_1001: "",
	chisel_1010: "",
	chisel_1011: "",
	chisel_1100: "",
	chisel_1101: "",
	chisel_1110: "",
	chisel_1111: "",

	tree_main: "",
	tree_alt: "",

	clock_up_up:       "",
	clock_up_right:    "",
	clock_up_down:     "",
	clock_up_left:     "",
	clock_right_up:    "",
	clock_right_right: "",
	clock_right_down:  "",
	clock_right_left:  "",
	clock_down_up:     "",
	clock_down_right:  "",
	clock_down_down:   "",
	clock_down_left:   "",
	clock_left_up:     "",
	clock_left_right:  "",
	clock_left_down:   "",
	clock_left_left:   "",
	
	horizontal: "",
	vertical: "",
};
for (const key in EffectiveRotations) {
	// @ts-ignore
	EffectiveRotations[key] = key;
}

/**
 * The different "styles" a rotatable object can rotate in.
 * In each array, the indices are the internal rotation ID, and the values are the corresponding effective rotation.
 * (A value can also be an array if multiple effective rotations correspond to the same internal rotation.)
 * @type {Record<string, (EffectiveRotations | EffectiveRotations[])[]>}
 */
export const EFFECTIVE_ROTATION_STYLES = {
	"none": [
		EffectiveRotations.no_rotation
	],
	"from_up": [
		EffectiveRotations.up, EffectiveRotations.right, EffectiveRotations.down, EffectiveRotations.left
	],
	"from_up_diagonal": [
		EffectiveRotations.upleft, EffectiveRotations.upright, EffectiveRotations.downright, EffectiveRotations.downleft
	],
	"from_right": [
		EffectiveRotations.right, EffectiveRotations.down, EffectiveRotations.left, EffectiveRotations.up
	],
	"from_right_diagonal": [
		EffectiveRotations.upright, EffectiveRotations.downright, EffectiveRotations.downleft, EffectiveRotations.upleft
	],

	"ver_hor": [
		[EffectiveRotations.vertical, EffectiveRotations.up, EffectiveRotations.down],
		[EffectiveRotations.horizontal, EffectiveRotations.left, EffectiveRotations.right],
		[EffectiveRotations.vertical, EffectiveRotations.up, EffectiveRotations.down],
		[EffectiveRotations.horizontal, EffectiveRotations.left, EffectiveRotations.right],
	],
	"hor_ver": [
		[EffectiveRotations.horizontal, EffectiveRotations.left, EffectiveRotations.right],
		[EffectiveRotations.vertical, EffectiveRotations.up, EffectiveRotations.down],
		[EffectiveRotations.horizontal, EffectiveRotations.left, EffectiveRotations.right],
		[EffectiveRotations.vertical, EffectiveRotations.up, EffectiveRotations.down],
	],

	"right_left": [
		EffectiveRotations.right, EffectiveRotations.right,
		EffectiveRotations.left, EffectiveRotations.left,
	],
	"left_right": [
		EffectiveRotations.left, EffectiveRotations.left,
		EffectiveRotations.right, EffectiveRotations.right
	],
	"up_down": [
		EffectiveRotations.up, EffectiveRotations.up,
		EffectiveRotations.down, EffectiveRotations.down
	],

	"tree": [
		EffectiveRotations.tree_main, EffectiveRotations.tree_alt,
	],

	"chisel": [
		EffectiveRotations.chisel_0000, EffectiveRotations.chisel_0001,
		EffectiveRotations.chisel_0010, EffectiveRotations.chisel_0011,
		EffectiveRotations.chisel_0100, EffectiveRotations.chisel_0101,
		EffectiveRotations.chisel_0110, EffectiveRotations.chisel_0111,
		EffectiveRotations.chisel_1000, EffectiveRotations.chisel_1001,
		EffectiveRotations.chisel_1010, EffectiveRotations.chisel_1011,
		EffectiveRotations.chisel_1100, EffectiveRotations.chisel_1101,
		EffectiveRotations.chisel_1110, EffectiveRotations.chisel_1111,
	],

	"clock": [
		EffectiveRotations.clock_up_up,      EffectiveRotations.clock_up_right,
		EffectiveRotations.clock_up_down,    EffectiveRotations.clock_up_left,
		EffectiveRotations.clock_right_up,   EffectiveRotations.clock_right_right,
		EffectiveRotations.clock_right_down, EffectiveRotations.clock_right_left,
		EffectiveRotations.clock_down_up,    EffectiveRotations.clock_down_right,
		EffectiveRotations.clock_down_down,  EffectiveRotations.clock_down_left,
		EffectiveRotations.clock_left_up,    EffectiveRotations.clock_left_right,
		EffectiveRotations.clock_left_down,  EffectiveRotations.clock_left_left,
	],
}

/**
 * Some, like chiselable tiles and diagonal variants, are automatically added.
 */
export const EFFECTIVE_ROTATION_GROUPS = {
	[TILES_BY_NAME["Entrance"]]: "up_down",
	[TILES_BY_NAME["Arrow"]]: "from_right",
	[TILES_BY_NAME["Wall"]]: "from_right",
	[TILES_BY_NAME["Barfy Gate"]]: "ver_hor",
	[TILES_BY_NAME["Anti-Slide"]]: "right_left",
	[TILES_BY_NAME["Chain"]]: "ver_hor",
	[TILES_BY_NAME["Clay"]]: ["none", "none", "from_up"],
	[TILES_BY_NAME["Conveyor"]]: "right_left",
	[TILES_BY_NAME["Curved Dashpipe"]]: "left_right",
	[TILES_BY_NAME["Toggle Arrow"]]: "from_right",
	[TILES_BY_NAME["Thumbnail Charcter"]]: "up_down",
	[TILES_BY_NAME["Door"]]: "up_down",
	[TILES_BY_NAME["Reset Ray"]]: "ver_hor",
	[TILES_BY_NAME["Start Timer Ray"]]: "ver_hor",
	[TILES_BY_NAME["Barfy Ray"]]: "ver_hor",
	[TILES_BY_NAME["Barfy Ring"]]: "hor_ver",
	[TILES_BY_NAME["What Boulder"]]: "right_left",
	[TILES_BY_NAME["Tree"]]: "tree",
	[TILES_BY_NAME["Vine"]]: "ver_hor",
	[TILES_BY_NAME["Accessory Gate"]]: "ver_hor",
	[TILES_BY_NAME["Bubble Arrow"]]: "from_right",
	[TILES_BY_NAME["Cracked Clay"]]: ["none", "none", "from_up"],
	[TILES_BY_NAME["Small Arrow"]]: "from_right",
	[TILES_BY_NAME["Glass"]]: ["none", "none", "from_up"],
	[TILES_BY_NAME["Red Clock"]]: "clock",
	[TILES_BY_NAME["Tripwire"]]: "ver_hor",
	[TILES_BY_NAME["No Camera Offset"]]: "from_right",
};
for (const tile of data.CHISEL_TILES) {
	EFFECTIVE_ROTATION_GROUPS[tile] = "chisel";
}
for (const tile of data.TILE_INFO.rotatable) {
	EFFECTIVE_ROTATION_GROUPS[tile] ??= "from_up";
}
for (const tile in data.DIAGONALS) {
	EFFECTIVE_ROTATION_GROUPS[+tile] ??= "from_up";
	EFFECTIVE_ROTATION_GROUPS[data.DIAGONALS[tile]] = EFFECTIVE_ROTATION_GROUPS[+tile] + "_diagonal";
}

/**
 * @param {data.TileID} tile 
 * @param {data.TileVariant} variant 
 * @param {data.Rotations} rotation 
 * @returns {[data.TileID, data.TileVariant, EffectiveRotations]}
 */
export function rawTileToEffective(tile, variant, rotation) {
	let groupName = EFFECTIVE_ROTATION_GROUPS[tile] || "none";
	if (Array.isArray(groupName)) {
		groupName = groupName[variant] || "none";
	}
	const group = EFFECTIVE_ROTATION_STYLES[groupName];
	let effectiveRotation = group[rotation] || EffectiveRotations.no_rotation;
	if (Array.isArray(effectiveRotation)) {
		effectiveRotation = effectiveRotation[0];
	}

	if (getCurrentOptions().effectiveIDsUseDiagonals && tile in data.DIAGONALS_REVERSE) {
		tile = data.DIAGONALS_REVERSE[tile];
	}
	if (getCurrentOptions().effectiveIDsUseGroups && tile in data.GROUP_EXCEPTIONS) {
		variant = data.GROUP_EXCEPTIONS[tile].indexOf(tile);
		tile = data.GROUP_EXCEPTIONS[tile][0];
	}
	return [tile, variant, effectiveRotation];
}

/**
 * 
 * @param {data.TileID} tile 
 * @param {data.TileVariant} variant 
 * @param {EffectiveRotations} rotation 
 * @returns {[data.TileID, data.TileVariant, data.Rotations]}
 */
export function effectiveTileToRaw(tile, variant, rotation) {
	const oldTile = tile;
	const oldVariant = variant;
	if (tile in data.GROUP_EXCEPTIONS && getCurrentOptions().effectiveIDsUseGroups) {
		tile = data.GROUP_EXCEPTIONS[tile][variant] || data.GROUP_EXCEPTIONS[tile][0];
		variant = 0; 
	}
	if (tile in data.DIAGONALS && EFFECTIVE_ROTATION_STYLES.from_up_diagonal.includes(rotation)) {
		tile = data.DIAGONALS[tile];
	} else if (tile in data.DIAGONALS_REVERSE && EFFECTIVE_ROTATION_STYLES.from_up.includes(rotation)) {
		tile = data.DIAGONALS_REVERSE[tile];
	}

	let groupName = EFFECTIVE_ROTATION_GROUPS[tile] || "none";
	let rotationDependsOnVariant = false;
	if (Array.isArray(groupName)) {
		rotationDependsOnVariant = true;
		groupName = groupName[variant] || "none";
	}
	const group = EFFECTIVE_ROTATION_STYLES[groupName];
	const rawRotation = rotation === EffectiveRotations.no_rotation ? 0 :
		group.findIndex((i) => Array.isArray(i) ? i.includes(rotation) : i === rotation);
	if (rawRotation === -1) {
		if (typeof rotation === "number") {
			throw new TypeError(
				`Tried to pass raw rotation ${rotation} as effective rotation.
Switch to 'EffectiveRotations' or use a function that uses raw rotations instead.`
			);
		} else {
			if (!rotationDependsOnVariant) {
				throw new TypeError(`Effective rotation ${rotation} not valid for object ID ${oldTile}`);
			} else {
				throw new TypeError(
					`Effective rotation ${rotation} not valid for object ID ${oldTile} variant ${oldVariant}`
				);
			}
		}
	}
	// TODO..
	return [tile, variant, rawRotation];
}