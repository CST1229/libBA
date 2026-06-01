// @ts-check
import JSON5 from "./external/json5.mjs";
import * as fs from "node:fs/promises";
import * as process from "node:process";
import * as path from "node:path";


/**
 * libBA's level format version.
 * WARNING: Older level versions are not properly handled
 * (e.g no conversion of colored objects in old levels to post-orange format).
 */
export const LEVEL_VERSION = 7;

/**
 * @typedef {number} TileID
 */
/**
 * @typedef {number} TileVariant
 */

/**
 * @typedef {Object} TileInfo
 * @property {Record<string, TileID[]>} categories The editor categories, and their containing objects.
 * @property {Record<LayerName, TileID[]>} layers The intended layer of each object ID.
 * 	The game rejects uploading any object in here that's not in its layer.
 * @property {(string | [string, "c"] | string[])[]} tilenames Tile names.
 * 	If it's a string, there's one varaiant. If it's string[], there's multiple.
 * 	If it's [string, "c"], it's a colorable object and uses
 * 	the color names defined in the COLOR_NAMES array as prefixes;
 * @property {TileID[]} rotatable Lists every object that's rotatable. *ITEMS* are object IDs (not indices!).
 * @property {Record<TileID, number>} variants The variant count of every object. *INDICES* are object IDs.
 */

/**
 * Info about tiles in the game, ripped right from BA's game files.
 * @type {TileInfo}
 * @readonly
 */
export const TILE_INFO = JSON5.parse(await fs.readFile(new URL("./external/tileinfo.json", import.meta.url), "utf-8"));

/**
 * The game's global.gd.
 * @type {string}
 */
export const GLOBAL_GD = await fs.readFile(new URL("./external/global.gd", import.meta.url), "utf-8");


/**
 * Keys are cardinal tiles, values are diagonal tiles.
 * @type {Record<TileID, TileID>}
 */
export const DIAGONALS = getGlobalVar("diagonals");
/**
 * Keys are diagonal tiles, values are cardinal tiles.
 * @type {Record<TileID, TileID>}
 */
export const DIAGONALS_REVERSE = Object.fromEntries(Object.entries(DIAGONALS).map(([a, b]) => [+b, +a]));
/**
 * These tiles are "grouped" in the editor;
 * they have the same effective tile ID but different raw tile IDs.
 * Slightly-processed, as each tile in a group points to its array instead of only the first.
 * @type {Record<TileID, TileID[]>}
 */
export const GROUP_EXCEPTIONS = getGlobalVar("group_exceptions");
for (const arr of Object.values(GROUP_EXCEPTIONS)) {
	for (const tileID of arr) {
		GROUP_EXCEPTIONS[tileID] = arr;
	}
}
/**
 * @type {Record<TileID, number>}
 */
export const ROTATE_EXCEPTIONS = getGlobalVar("rotate_exceptions");
/**
 * @type {TileID[]}
 */
export const CHISEL_TILES = getGlobalVar("chisel_tiles");
export const CHISEL_TILES_OBJ = Object.fromEntries(Object.entries(CHISEL_TILES).map(([a]) => [a, true]));
export const ROTATABLE_OBJ = Object.fromEntries(Object.entries(TILE_INFO.rotatable).map(([a]) => [a, true]));

/**
 * @type {Record<TileID, LayerName>}
 */
export const OBJECT_LAYERS = {};
for (const layername in TILE_INFO.layers) {
	for (const obj of TILE_INFO.layers[layername]) {
		OBJECT_LAYERS[+obj] = layername;
	}
}

/**
 * @param {string} varName
 * @param {boolean} rawString
 */
export function getGlobalVar(varName, rawString = false) {
	const regex = new RegExp(`var\\s+${varName}[:=\\s]*(.+?)\\s*\\b(var|func)\\s+`, "s");
	const match = GLOBAL_GD.match(regex);
	if (!match) return null;
	const string = match[1];
	if (rawString) return string;
	// godot syntax allows unquoted number keys
	// json5 doesn't
	const cleanedString = string.replaceAll(/\b(\d+):/g, '"$1":');
	return JSON5.parse(cleanedString);
}

/**
 * The game's version.
 * @type {string}
 */
export const GAME_VERSION = (GLOBAL_GD.match(/var version[:=\s]*"(.+?)"/) || ["", ""])[1];


/**
 * Every single tile name in BA.
 * Indices are TileID.
 * [string, "c"] is for auto-colored objects; these use color names from the colors object/COLOR_NAMES array,
 * which get prepended to the beginning of their names.
 * @type {(string | [string, "c"] | string[])[]}
 * @readonly
 */
export const BA_TILE_NAMES = TILE_INFO.tilenames;
/**
 * All colors.
 * @readonly
 * @enum {number}
 */
export const Colors = {
	red: 0,
	orange: 1,
	yellow: 2,
	green: 3,
	teal: 4,
	blue: 5,	
	purple: 6,
	pink: 7,
	white: 8,
};
/**
 * @type {string[]}
 * @readonly
 */
export const COLOR_NAMES = getGlobalVar("colornames");

/**
 * @typedef {string} LayerName The node name of a layer. LAYER_NAMES contains a list of all layers the game uses.
 */
/**
 * All layer node names.
 * @type {LayerName[]}
 * @readonly
 */
export const LAYER_NAMES = Object.keys(TILE_INFO.layers);

/**
 * Every tile name, but every item is always an array of all variant names
 * ([name, "c"] and single-variants are normalized).
 * @type {string[][]}
 * @readonly
 */
export const NORMALIZED_TILE_NAMES = [];

/** @type {Record<string, number>} @readonly */
export const TILES_BY_NAME = {};
/** @type {Record<string, number>} @readonly */
export const VARIANT_ID_BY_NAME = {};
for (const _id in TILE_INFO.tilenames) {
	const id = +_id;
	let data = TILE_INFO.tilenames[id];
	if (typeof data === "string") {
		data = [data];
	} else if (data[1] == "c") {
		if (!(data[0] in TILES_BY_NAME)) TILES_BY_NAME[data[0]] = id;
		data = COLOR_NAMES.map(colorname => colorname + " " + data[0]);
	}
	NORMALIZED_TILE_NAMES[id] = data;
	for (const variantId in data) {
		if (data[variantId] in TILES_BY_NAME) continue;
		TILES_BY_NAME[data[variantId]] = id;
		VARIANT_ID_BY_NAME[data[variantId]] = +variantId;
	}
}

/**
 * @param {string} folder
 */
async function tryFolder(folder) {
	try {
		await fs.readdir(folder);
		return folder;
	} catch(_) {
		return null;
	}
}


/** May be "" if BA appdata is missing. */
export const BA_APPDATA = (
	// linux
	await tryFolder(path.join("/home", process.env.USER || "", ".local/share/godot/app_userdata/Barfy's Adventure/")) ||
	// windows
	await tryFolder(path.join(process.env.APPDATA || "", "Godot/app_userdata/Barfy's Adventure")) ||
	""
);
/** May be "" if BA appdata is missing. */
export const LEVELS_PATH = BA_APPDATA ? path.join(BA_APPDATA, "levels") : "";
/** May be "" if BA appdata is missing. */
export const STRUCTURES_PATH = BA_APPDATA ? path.join(BA_APPDATA, "structures") : "";

/**
 * All rotations.
 * @readonly
 * @enum {number}
 */
export const Rotations = {
	/** WARNING: may not match for some objects (e.g arrows)! */
	up: 0,
	/** WARNING: may not match for some objects (e.g arrows)! */
	right: 1,
	/** WARNING: may not match for some objects (e.g arrows)! */
	down: 2,
	/** WARNING: may not match for some objects (e.g arrows)! */
	left: 3,
	conveyor_right: 0,
	conveyor_left: 2,

	arrow_right: 0,
	arrow_down: 1,
	arrow_left: 2,
	arrow_up: 3,

	tree_main: 0,
	tree_alt: 1,

	/**
	 * Chisel rotations. 1 means chiseled out (hole/nonsolid).
	 * Bits from least significant to most significant:
	 * top left, top right, bottom left, bottom right
	 */
	chisel_0000: 0b0000,
	chisel_0001: 0b0001,
	chisel_0010: 0b0010,
	chisel_0011: 0b0011,
	chisel_0100: 0b0100,
	chisel_0101: 0b0101,
	chisel_0110: 0b0110,
	chisel_0111: 0b0111,
	chisel_1000: 0b1000,
	chisel_1001: 0b1001,
	chisel_1010: 0b1010,
	chisel_1011: 0b1011,
	chisel_1100: 0b1100,
	chisel_1101: 0b1101,
	chisel_1110: 0b1110,
	chisel_1111: 0b1111,
};
