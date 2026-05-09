// @ts-check
// code related to general BA level stuff.

/*
	possible TODOs left:
	- code for converting old levelVersions?
	- the game has SEVERAL tile-based id-hardcoded edgecases, either in global.gd or straight up just id checks in Editor.gd:
		- tiles like regular ground that have variations that are actually separate tile ids
			- `group_exceptions` in global.gd
		- diagonally rotatable tiles are also separate tiles (idk why this isnt in tileinfo lol)
			- `diagonals` in global.gd
		- chiselable tiles, clocks (these use the rotation field to store a second variation
			- `rotate_exceptions` in global.gd
		- 2-way rotatable tiles (whether 90-degree (like gates) or 180-degree (like conveyor belts))
			- these are somehow STILL just checks in editor.gd
			- `if [37, 67, 71, 86, 89, 112, 2].has(global.tileselected[layer]):`
			- `if [31, 45, 95, 96, 100, 128, 160, 230].has(global.tileselected[layer]):`
	- actual Level properties for level properties, that aren't just in Level.other
	- artboard image manipulation??????
	
	honestly i kinda wish barfy added more info to tileinfo.json, its very nice for external tools even currently
	...maybe i should just parse global.gd too or something (could probably be simple regexes)
*/

import * as fs from "node:fs/promises";
import * as process from "node:process";
import * as path from "node:path";

// @ts-ignore whatevs
import JSON5 from "./json5.mjs";

/**
 * libBA's level format version.
 * WARNING: Older level versions are not properly handled
 * (e.g no conversion of colored objects in old levels to post-orange format).
 */
export const LEVEL_VERSION = 7;

/**
 * @typedef {Object} TileInfo
 * @property {Object<string, number[]>} categories The editor categories, and their containing objects.
 * @property {Object<LayerName, number[]>} layers The intended layer of each object ID.
 * 	The game rejects uploading any object in here that's not in its layer.
 * @property {(string | [string, "c"] | string[])[]} tilenames Tile names.
 * 	If it's a string, there's one varaiant. If it's string[], there's multiple.
 * 	If it's [string, "c"], it's a colorable object and uses
 * 	the color names defined in the COLOR_NAMES array as prefixes;
 * @property {number[]} rotatable Lists every object that's rotatable. *ITEMS* are object IDs (not indices!).
 * @property {number[]} variants The variant count of every object. *INDICES* are object IDs.
 */

/**
 * Info about tiles in the game, ripped right from BA's game files.
 * @type {TileInfo}
 * @readonly
 */
export const TILE_INFO = JSON5.parse(await fs.readFile(new URL("./tileinfo.json", import.meta.url), "utf-8"));

// every single tile and color name in BA, ripped directly from the code.
/**
 * Every single tile name in BA.
 * [string, "c"] is for auto-colored objects; these use color names from the colors object/COLOR_NAMES array,
 * which get prepended to the beginning of their names.
 * @type {(string | [string, "c"] | string[])[]}
 * @readonly
 */
export const BA_TILE_NAMES = TILE_INFO.tilenames;
/** @readonly */
export const COLOR_NAMES = ["Red", "Orange", "Yellow", "Green", "Teal", "Blue", "Purple", "Pink", "Silver"];
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
 */
export const NORMALIZED_TILE_NAMES = [];

/** @type {Object<string, number>} */
export const TILES_BY_NAME = {};
/** @type {Object<string, number>} */
export const VARIANT_ID_BY_NAME = {};
for (const _id in TILE_INFO.tilenames) {
	const id = +_id;
	let data = TILE_INFO.tilenames[id];
	if (typeof data === "string") {
		data = [data];
	} else if (data[1] == "c") {
		data = COLOR_NAMES.map(colorname => colorname + " " + data[0]);
		if (!(data[0] in TILES_BY_NAME)) TILES_BY_NAME[data[0]] = id;
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

// general utilities
export const logging = {
	TOO_MUCH_LOGGING: false,
	LOGGING: false,
};

/**
 * @param {number} x
 * @param {number} y
 */
export function vec2String(x, y) {
	return `(${x}, ${y})`;
}
/**
 * @param {string} string
 */
export function stringVec2(string) {
	string = String(string).replace("(", "").replace(")", "");
	return string.split(", ").map((/** @type {string | number} */ num) => +num);
}

export let logIndent = 0;
/**
 * @param {{ (...data: any[]): void; }} func
 * @param {any[]} args
 */
export function indentedConsole(func, ...args) {
	if (!args[0]) return;
	args[0] = "\t".repeat(logIndent) + String(args[0]);
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

/**
 * All colors.
 * @readonly
 * @enum {number}
 */
export const colors = {
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
 * All rotations.
 * @readonly
 * @enum {number}
 */
export const rotations = {
	up: 0,
	right: 1,
	down: 2,
	left: 3,
	conveyor_right: 0,
	conveyor_left: 2,
};

export class Tile {
	/**
	 * @type {Layer?}
	 */
	layer = null;
	id = -1;
	x = 0;
	y = 0;
	color = 0;
	/**
	 * @type {rotations}
	 */
	rotation = rotations.up;
	/**
	 * used for doors
	 * @type {*}
	 */
	specialData = null;

	/**
	 * @param {Layer | null} layer
	 * @param {typeof Tile.prototype.id} id
	 * @param {typeof Tile.prototype.x} x
	 * @param {typeof Tile.prototype.y} y
	 * @param {typeof Tile.prototype.color} color
	 * @param {typeof Tile.prototype.rotation} rotation
	 * @param {typeof Tile.prototype.specialData} specialData
	 */
	constructor(layer, id, x, y, color = 0, rotation = rotations.up, specialData = null) {
		this.layer = layer;
		this.id = id;
		this.x = x;
		this.y = y;
		this.color = color;
		this.rotation = rotation;
		this.specialData = specialData;
	}

	toString() {
		return `${this.id},${this.x},${this.y},${this.color},${this.rotation}/`;
	}
	
	/**
	 * @param {string} string
	 * @param {typeof Tile.prototype.layer} layer
	 */
	static fromString(string, layer = null) {
		const split = string.split(",");
		return new Tile(layer, +split[0], +split[1], +split[2], +split[3], +split[4]);
	}
	posString() {
		return vec2String(this.x, this.y);
	}

	// Returns a name for this tile.
	getName() {
		const nameEntry = BA_TILE_NAMES[this.id];
		let name = "";
		if (this.id === -1) {
			name = "Uninitialized";
		} else if (!nameEntry) {
			name = `Unknown (ID ${this.id})`;
		} else if (typeof nameEntry == "string") {
			if (this.id === TILES_BY_NAME["Conveyor"]) {
				name = (["Right", "Unknown", "Left"][this.rotation] || "Unknown") + " " + nameEntry;
			} else {
				name = nameEntry;
			}
		} else if (nameEntry[1] === "c") {
			const colorName = COLOR_NAMES[this.color] ?? `Unknown Color ${this.color}`;
			name = colorName + " " + nameEntry[0];
		} else {
			name = nameEntry[this.color] ?? `Unknown ${nameEntry[0]} (ID ${this.id}) Variation ${this.color}`;
		}
		if (this.id == TILES_BY_NAME["Door"] && this.specialData?.title) {
			name += ` (${this.specialData.title})`;
		}
		return name;
	}

	duplicate() {
		return new Tile(
			this.layer, this.id, this.x, this.y, this.color, this.rotation, structuredClone(this.specialData)
		);
	}
	delete() {
		if (!this.layer) {
			return;
		}
		this.layer.deleteTile(this);
	}
}

export class Layer {
	name = "Uninitialized";
	/**
	 * @type {Level?}
	 */
	level = null;
	/**
	 * @type {{[position: string]: Tile}}
	 */
	tiles = Object.create(null);

	// because why not
	minTileX = Infinity;
	maxTileX = -Infinity;
	minTileY = Infinity;
	maxTileY = -Infinity;
	/**
	 * Note: This property does not update when deleting tiles.
	 */
	get width() {
		if (!Number.isFinite(this.minTileX)) {
			return 0;
		}
		return (this.maxTileX - this.minTileX) + 1;
	}
	/**
	 * Note: This property does not update when deleting tiles.
	 */
	get height() {
		if (!Number.isFinite(this.maxTileY)) {
			return 0;
		}
		return (this.maxTileY - this.minTileY) + 1;
	}

	/**
	 * @param {typeof Layer.prototype.level} level
	 * @param {string?} name
	 */
	constructor(level = null, name = null) {
		this.level = level;
		if (name) {
			this.name = name;
		}
		if (logging.TOO_MUCH_LOGGING) {
			indentedLog(`Created layer ${this.name}`);
		}
	}

	duplicate() {
		const newLayer = new Layer();
		newLayer.name = this.name;
		newLayer.level = this.level;
		newLayer.minTileX = this.minTileX;
		newLayer.minTileY = this.minTileY;
		newLayer.maxTileX = this.maxTileX;
		newLayer.maxTileY = this.maxTileY;
		for (const pos in this.tiles) {
			newLayer.tiles[pos] = this.tiles[pos].duplicate();
		}
		return newLayer;
	}

	/**
	 * Creates a new tile and places it in this level.
	 * @param {typeof Tile.prototype.id} id
	 * @param {typeof Tile.prototype.x} x
	 * @param {typeof Tile.prototype.y} y
	 * @param {typeof Tile.prototype.color} color
	 * @param {typeof Tile.prototype.rotation} rotation
	 * @param {typeof Tile.prototype.specialData} specialData
	 * @returns {Tile} the newly created tile
	 */
	addTile(id, x, y, color = 0, rotation = rotations.up, specialData = null) {
		const tile = new Tile(this, id, x, y, color, rotation, specialData);
		// push overridden tiles to the end of the key list
		this.deleteTile(x, y, true);
		this.addTileRaw(tile);
		if (logging.TOO_MUCH_LOGGING) {
			indentedLog(`Added ${tile.getName()} at ${vec2String(x, y)} in ${this.name}`);
		}
		return tile;
	}
	/**
	 * @param {Tile} tile 
	 */
	addTileRaw(tile) {
		this.tiles[tile.posString()] = tile;
		if (tile.x < this.minTileX) {
			this.minTileX = tile.x;
		}
		if (tile.y < this.minTileY) {
			this.minTileY = tile.y;
		}
		if (tile.x > this.maxTileX) {
			this.maxTileX = tile.x;
		}
		if (tile.y > this.maxTileY) {
			this.maxTileY = tile.y;
		}
	}
	/**
	 * duplicates and places an existing tile in this level
	 * @param {Tile} tile
	 * @param {number?} x
	 * @param {number?} y
	 * @param {boolean} isOffset if true, x and y are offsets
	 * @param {boolean} noLogs if true, always disables logging
	 * @returns {Tile} the newly duplicated tile
	 */
	placeTile(tile, x = null, y = null, isOffset = false, noLogs = false) {
		tile = tile.duplicate();
		tile.layer = this;
		if (typeof x == "number" && typeof y == "number") {
			if (isOffset) {
				tile.x += x;
				tile.y += y;
			} else {
				tile.x = x;
				tile.y = y;
			}
		}
		this.deleteTile(tile.x, tile.y, true);
		this.addTileRaw(tile);
		if (logging.TOO_MUCH_LOGGING && !noLogs) {
			indentedLog(`Placed ${tile.getName()} at ${vec2String(tile.x, tile.y)} in ${this.name}`);
		}
		return tile;
	}
	/**
	 * Deletes a tile at a specific position, or ONLY a specific tile.
	 * @param {number | Tile} x
	 * @param {number} y
	 * @param {boolean} isOverwrite
	 * @param {boolean} forceNoLog
	 */
	deleteTile(x, y = 0, isOverwrite = false, forceNoLog = false) {
		let vec;
		if (typeof x == "number") {
			vec = vec2String(x, y);
		} else {
			vec = x.posString();
		}
		if (vec in this.tiles) {
			if (typeof x == "object" && this.tiles[vec] !== x) {
				return;
			}
			if (!forceNoLog) {
				indentedLog(
					`${isOverwrite ? "Overwrote" : "Deleted"} ${this.tiles[vec].getName()} at ${vec} in ${this.name}`
				);
			}
			delete this.tiles[vec];
		}
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {Tile | undefined}
	 */
	getTile(x, y) {
		return  this.tiles[vec2String(x, y)];
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	hasTile(x, y) {
		return vec2String(x, y) in this.tiles;
	}

	/**
	 * @param {any} string
	 * @param {typeof Layer.prototype.level} level
	 * @param {typeof Layer.prototype.name?} name
	 */
	static fromString(string, level = null, name = null) {
		const layer = new Layer(level, name);
		for (const value of String(string).split("/")) {
			if (value == "") {
				continue;
			}
			const tile = Tile.fromString(value, layer);
			layer.addTileRaw(tile);
			if (logging.TOO_MUCH_LOGGING) {
				indentedLog(`Loaded ${tile.getName()} at ${vec2String(tile.x, tile.y)} in ${layer.name}`);
			}
		}
		return layer;
	}

	/**
	 * @param {*} doors
	 */
	loadDoors(doors) {
		for (const door of Object.keys(doors)) {
			if (this.tiles[door] && this.tiles[door].id == TILES_BY_NAME["Door"]) {
				this.tiles[door].specialData = doors[door];
			} else {
				indentedWarn(`Door data found with no door attached (tile ${this.tiles[door].id} at ${door})`);
			}
		}
	}
	/**
	 * @param {*} doors
	 */
	saveDoors(doors) {
		for (const pos of Object.keys(this.tiles)) {
			const tile = this.tiles[pos];
			if (tile.id == TILES_BY_NAME["Door"]) {
				if (tile.specialData) {
					doors[pos] = tile.specialData;
				} else {
					indentedWarn(`Door with no data found at ${pos}`);
				}
			}
		}
	}
	toString() {
		const tiles = [];
		for (const tile of Object.values(this.tiles)) {
			tiles.push(tile.toString());
		}
		return tiles.join("");
	}
	/**
	 * @param {*} serialized
	 * @param {string} key
	 */
	serializeTo(serialized, key) {
		serialized[key] = this.toString();
		if (key == "TileMap") {
			serialized.doors ??= {};
			this.saveDoors(serialized.doors);
		}
	}
}
export class Level {
	/**
	 * Creates a Level object.
	 * @param {string | null} title The name of this level.
	 * 	If null, doesn't initialize the level at all. Use `null` if you're loading a level from file.
	 */
	constructor(title = "level") {
		if (title !== null) {
			this.other.title = title;
			this.other.levelVersion = LEVEL_VERSION;
		}
	}

	other = Object.create(null);
	/**
	 * @type {Object<LayerName, Layer>}
	 */
	layers = Object.create(null);
	/**
	 * @type {string[]}
	 */
	keyOrder = [];

	get width() {
		return Math.max(...Object.values(this.layers).map(l => l.width));
	}
	get height() {
		return Math.max(...Object.values(this.layers).map(l => l.height));
	}
	/**
	 * @param {string} title
	 */
	rename(title) {
		this.other.title = String(title);
	}
	/**
	 * Saves this level to BA's local levels list.
	 */
	saveToLocal() {
		if (!LEVELS_PATH) throw new Error("LEVELS_PATH not found, BA appdata missing?");
		return this.saveToFile(path.join(LEVELS_PATH, this.other.title + ".json"));
	}
	/**
	 * Saves this level to BA's local structures list.
	 * Includes all the level keys as well but ehhhhh the game ignores them anyways
	 */
	saveToLocalStructure() {
		if (!STRUCTURES_PATH) throw new Error("STRUCTURES_PATH not found, BA appdata missing?");
		return this.saveToFile(path.join(STRUCTURES_PATH, this.other.title + ".strc"));
	}

	/**
	 * Returns a layer by node name. If doesn't exist, creates a new layer.
	 * @param {LayerName} name
	 * @returns {Layer}
	 */
	getLayer(name) {
		if (!(name in this.layers)) {
			this.layers[name] = new Layer(this, name);
		}
		return this.layers[name];
	}

	/**
	 * @param {import("fs").PathLike | fs.FileHandle} filePath
	 */
	async saveToFile(filePath) {
		const serialized = {};
		for (const key of this.keyOrder) {
			// @ts-ignore
			serialized[key] = undefined;
		}
		Object.assign(serialized, this.other);
		for (const key of Object.keys(this.layers)) {
			this.layers[key].serializeTo(serialized, key);
		}
		await fs.writeFile(filePath, JSON.stringify(serialized));
		console.log(`Saved "${this.other.title}" to ${filePath}.`);
	}
	/**
	 * Places a structure at a given position.
	 * Structures are actually just small level files that only contain tiles.
	 * @param {Level} structure
	 * @param {number} x
	 * @param {number} y
	 */
	placeStructure(structure, x, y) {
		for (const [layerName, structureLayer] of Object.entries(structure.layers)) {
			this.layers[layerName] ??= new Layer(this, layerName);
			const layer = this.layers[layerName];
			for (const tile of Object.values(structureLayer.tiles)) {
				layer.placeTile(tile, x, y, true, true);
			}
		}
		indentedLog(`Placed structure ${structure.other.title} at ${vec2String(x, y)}`);
	}

	/**
	 * Makes a structure out of a portion of this level.
	 * @param {number} x1 (inclusive)
	 * @param {number} y1 (inclusive)
	 * @param {number} x2 (inclusive)
	 * @param {number} y2 (inclusive)
	 * @returns {Level}
	 */
	makeStructure(x1, y1, x2, y2) {
		const lvl = new Level("structure");

		const checkX1 = Math.min(x1, x2);
		const checkY1 = Math.min(y1, y2);
		const checkX2 = Math.max(x1, x2);
		const checkY2 = Math.max(y1, y2);

		for (const [layerName, layer] of Object.entries(this.layers)) {
			for (const tile of Object.values(layer.tiles)) {
				if (tile.x < checkX1 || tile.x > checkX2) continue;
				if (tile.y < checkY1 || tile.y > checkY2) continue;
				const newLayer = lvl.getLayer(layerName);
				newLayer.placeTile(tile, tile.x - x1, tile.y - y1);
			}
		}

		return lvl;
	}

	duplicate() {
		const newLevel = new Level(null);
		newLevel.other = structuredClone(this.other);
		newLevel.keyOrder = structuredClone(this.keyOrder);
		for (const layerName in this.layers) {
			const layer = this.layers[layerName].duplicate();
			layer.level = newLevel;
			newLevel.layers[layerName] = layer;
		}
		return newLevel;
	}

	/**
	 * @param {string} code
	 * @param {string?} forceTitle
	 */
	static fromString(code, forceTitle = null) {
		const level = new Level(null);
		level.other = JSON.parse(code);
		level.keyOrder = Object.keys(level.other);
		if (forceTitle) {
			level.other.title = forceTitle;
		}
		if (logging.TOO_MUCH_LOGGING) {
			indentedLog(`Loading level ${level.other.title}...`);
			logIndent++;
		}
		for (const layerName of LAYER_NAMES) {
			if (layerName in level.other) {
				const layer = Layer.fromString(level.other[layerName], level, layerName);
				delete level.other[layerName];
				if (layerName == "TileMap") {
					layer.loadDoors(level.other.doors || {});
					delete level.other.doors;
				}
				level.layers[layerName] = layer;
			}
		}
		if (logging.TOO_MUCH_LOGGING) {
			logIndent--;
		}
		indentedLog(`Loaded level ${level.other.title}.`);
		return level;
	}
	/**
	 * @param {import("fs").PathLike | fs.FileHandle} path
	 * @param {string?} forceTitle If non-null, sets this level's title to a specific value.
	 */
	static async loadFile(path, forceTitle = null) {
		return Level.fromString(await fs.readFile(path, "utf-8"), forceTitle);
	}
	/**
	 * @param {string?} title
	 */
	static async loadLocal(title) {
		if (!LEVELS_PATH) throw new Error("LEVELS_PATH not found, BA appdata missing?");
		return Level.loadFile(path.join(LEVELS_PATH, title + ".json"));
	}
	/**
	 * @param {string?} title
	 */
	static async loadLocalStructure(title) {
		if (!STRUCTURES_PATH) throw new Error("STRUCTURES_PATH not found, BA appdata missing?");
		return Level.loadFile(path.join(STRUCTURES_PATH, title + ".strc"));
	}
}
