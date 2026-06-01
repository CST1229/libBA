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
		- chiselable tiles, clocks (these use the rotation field to store a second variation)
			- `rotate_exceptions` in global.gd
		- the list of chiselable tiles
			- `chisel_tiles` in global.gd
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
import * as path from "node:path";

import * as util from "./util.mjs";
import * as data from "./baData.mjs";
import * as effective from "./effectiveTiles.mjs";

export class Tile {
	/**
	 * @type {Layer?}
	 */
	layer = null;
	/**
	 * @type {data.TileID}
	 */
	id = -1;
	x = 0;
	y = 0;
	/**
	 * Synonym for `variant`.
	 */
	get color() {return this.variant;}
	set color(value) {this.variant = value;}
	/**
	 * @type {data.TileVariant}
	 */
	variant = 0;
	/**
	 * @type {data.Rotations}
	 */
	_rotation = data.Rotations.up;
	get rotation() {return this._rotation;}
	set rotation(value) {
		if (typeof value == "string") {
			if (effective.EffectiveRotations[value] === value) {
				throw new TypeError(
					`Tried to pass effective rotation ${value} as raw rotation.
	Switch to 'Rotations' or use a function that uses effective rotations instead.`
				);
			}
		}
		this._rotation = value;
	}
	/**
	 * used for doors
	 * @type {*}
	 */
	specialData = null;

	get effectiveID() {
		return effective.rawTileToEffective(this.id, this.variant, this.rotation)[0];
	}
	get effectiveVariant() {
		return effective.rawTileToEffective(this.id, this.variant, this.rotation)[1];
	}
	get effectiveRotation() {
		return effective.rawTileToEffective(this.id, this.variant, this.rotation)[2];
	}
	set effectiveID(value) {
		[this.id, this.variant, this.rotation] =
			effective.effectiveTileToRaw(value, this.effectiveVariant, this.effectiveRotation);
	}
	set effectiveVariant(value) {
		[this.id, this.variant, this.rotation] =
			effective.effectiveTileToRaw(this.effectiveID, value, this.effectiveRotation);
	}
	set effectiveRotation(value) {
		[this.id, this.variant, this.rotation] =
			effective.effectiveTileToRaw(this.effectiveID, this.effectiveVariant, value);
	}

	/**
	 * @param {Layer | null} layer
	 * @param {typeof Tile.prototype.id} id
	 * @param {typeof Tile.prototype.x} x
	 * @param {typeof Tile.prototype.y} y
	 * @param {typeof Tile.prototype.variant} variant
	 * @param {typeof Tile.prototype.rotation} rotation
	 * @param {typeof Tile.prototype.specialData} specialData
	 */
	constructor(layer, id, x, y, variant = 0, rotation = data.Rotations.up, specialData = null) {
		this.layer = layer;
		this.id = id;
		this.x = x;
		this.y = y;
		this.variant = variant;
		this.rotation = rotation;
		this.specialData = specialData;
	}

	/**
	 * @param {Layer | null} layer
	 * @param {typeof Tile.prototype.effectiveID} id
	 * @param {typeof Tile.prototype.x} x
	 * @param {typeof Tile.prototype.y} y
	 * @param {typeof Tile.prototype.effectiveVariant} variant
	 * @param {typeof Tile.prototype.effectiveRotation} rotation
	 * @param {typeof Tile.prototype.specialData} specialData
	 */
	static fromEffective(
		layer, id, x, y, variant = 0, rotation = effective.EffectiveRotations.no_rotation, specialData = null
	) {
		const tile = new Tile(layer, 0, x, y, 0, 0, specialData);
		[tile.id, tile.variant, tile.rotation] =
			effective.effectiveTileToRaw(id, variant, rotation);
		return tile;
	}
	/**
	 * @param {typeof Tile.prototype.effectiveID} id
	 * @param {typeof Tile.prototype.effectiveVariant} variant
	 * @param {typeof Tile.prototype.effectiveRotation} rotation
	 */
	setEffective(id, variant = 0, rotation = effective.EffectiveRotations.no_rotation) {
		[this.id, this.variant, this.rotation] =
			effective.effectiveTileToRaw(id, variant, rotation);
	}

	toString() {
		return `${this.id},${this.x},${this.y},${this.variant},${this.rotation}/`;
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
		return util.vec2String(this.x, this.y);
	}

	// Returns a name for this tile.
	getName() {
		const nameEntry = data.BA_TILE_NAMES[this.id];
		let name = "";
		if (this.id === -1) {
			name = "Uninitialized";
		} else if (!nameEntry) {
			name = `Unknown (ID ${this.id})`;
		} else if (typeof nameEntry == "string") {
			if (this.id === data.TILES_BY_NAME["Conveyor"]) {
				name = (["Right", "Unknown", "Left"][this.rotation] || "Unknown") + " " + nameEntry;
			} else {
				name = nameEntry;
			}
		} else if (nameEntry[1] === "c") {
			const colorName = data.COLOR_NAMES[this.variant] ?? `Unknown Color ${this.variant}`;
			name = colorName + " " + nameEntry[0];
		} else {
			name = nameEntry[this.variant] ?? `Unknown ${nameEntry[0]} (ID ${this.id}) Variation ${this.variant}`;
		}
		if (this.id == data.TILES_BY_NAME["Door"] && this.specialData?.title) {
			name += ` (${this.specialData.title})`;
		}
		return name;
	}

	duplicate() {
		return new Tile(
			this.layer, this.id, this.x, this.y, this.variant, this.rotation, structuredClone(this.specialData)
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
	/**
	 * @type {data.LayerName}
	 */
	name = "Uninitialized";
	/**
	 * @type {Level?}
	 */
	level = null;
	/**
	 * @type {Record<util.Vec2String, Tile>}
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
		if (util.logging.TOO_MUCH_LOGGING) {
			util.indentedLog(`Created layer ${this.name}`);
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
	 * @param {typeof Tile.prototype.variant} variant
	 * @param {typeof Tile.prototype.rotation} rotation
	 * @param {typeof Tile.prototype.specialData} specialData
	 * @returns {Tile} the newly created tile
	 */
	addTile(id, x, y, variant = 0, rotation = data.Rotations.up, specialData = null) {
		const tile = new Tile(this, id, x, y, variant, rotation, specialData);
		// push overridden tiles to the end of the key list
		this.deleteTile(x, y, true);
		this.addTileRaw(tile);
		if (util.logging.TOO_MUCH_LOGGING) {
			util.indentedLog(`Added ${tile.getName()} at ${util.vec2String(x, y)} in ${this.name}`);
		}
		return tile;
	}
	/**
	 * Creates a new tile from effective tiles and places it in this level.
	 * @param {typeof Tile.prototype.effectiveID} id
	 * @param {typeof Tile.prototype.x} x
	 * @param {typeof Tile.prototype.y} y
	 * @param {typeof Tile.prototype.effectiveVariant} variant
	 * @param {typeof Tile.prototype.effectiveRotation} rotation
	 * @param {typeof Tile.prototype.specialData} specialData
	 * @returns {Tile} the newly created tile
	 */
	addTileEffective(id, x, y, variant = 0, rotation = effective.EffectiveRotations.no_rotation, specialData = null) {
		const tile = Tile.fromEffective(this, id, x, y, variant, rotation, specialData);
		// push overridden tiles to the end of the key list
		this.deleteTile(x, y, true);
		this.addTileRaw(tile);
		if (util.logging.TOO_MUCH_LOGGING) {
			util.indentedLog(`Added ${tile.getName()} at ${util.vec2String(x, y)} in ${this.name}`);
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
		if (util.logging.TOO_MUCH_LOGGING && !noLogs) {
			util.indentedLog(`Placed ${tile.getName()} at ${util.vec2String(tile.x, tile.y)} in ${this.name}`);
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
			vec = util.vec2String(x, y);
		} else {
			vec = x.posString();
		}
		if (vec in this.tiles) {
			if (typeof x == "object" && this.tiles[vec] !== x) {
				return;
			}
			if (!forceNoLog) {
				util.indentedLog(
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
		return  this.tiles[util.vec2String(x, y)];
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	hasTile(x, y) {
		return util.vec2String(x, y) in this.tiles;
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
			if (util.logging.TOO_MUCH_LOGGING) {
				util.indentedLog(`Loaded ${tile.getName()} at ${util.vec2String(tile.x, tile.y)} in ${layer.name}`);
			}
		}
		return layer;
	}

	/**
	 * @param {*} doors
	 */
	loadDoors(doors) {
		for (const door of Object.keys(doors)) {
			if (this.tiles[door] && this.tiles[door].id == data.TILES_BY_NAME["Door"]) {
				this.tiles[door].specialData = doors[door];
			} else {
				util.indentedWarn(`Door data found with no door attached (tile ${this.tiles[door].id} at ${door})`);
			}
		}
	}
	/**
	 * @param {*} doors
	 */
	saveDoors(doors) {
		for (const pos of Object.keys(this.tiles)) {
			const tile = this.tiles[pos];
			if (tile.id == data.TILES_BY_NAME["Door"]) {
				if (tile.specialData) {
					doors[pos] = tile.specialData;
				} else {
					util.indentedWarn(`Door with no data found at ${pos}`);
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
			this.other.levelVersion = data.LEVEL_VERSION;
		}
	}

	other = Object.create(null);
	/**
	 * @type {Record<data.LayerName, Layer>}
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
		if (!data.LEVELS_PATH) throw new Error("LEVELS_PATH not found, BA appdata missing?");
		return this.saveToFile(path.join(data.LEVELS_PATH, this.other.title + ".json"));
	}
	/**
	 * Saves this level to BA's local structures list.
	 * Includes all the level keys as well but ehhhhh the game ignores them anyways
	 */
	saveToLocalStructure() {
		if (!data.STRUCTURES_PATH) throw new Error("STRUCTURES_PATH not found, BA appdata missing?");
		return this.saveToFile(path.join(data.STRUCTURES_PATH, this.other.title + ".strc"));
	}

	/**
	 * Returns a layer by node name. If doesn't exist, creates a new layer.
	 * @param {data.LayerName} name
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
		util.indentedLog(`Placed structure ${structure.other.title} at ${util.vec2String(x, y)}`);
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
		if (util.logging.TOO_MUCH_LOGGING) {
			util.indentedLog(`Loading level ${level.other.title}...`);
			util.logging.indent++;
		}
		for (const layerName of data.LAYER_NAMES) {
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
		if (util.logging.TOO_MUCH_LOGGING) {
			util.logging.indent--;
		}
		util.indentedLog(`Loaded level ${level.other.title}.`);
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
		if (!data.LEVELS_PATH) throw new Error("LEVELS_PATH not found, BA appdata missing?");
		return Level.loadFile(path.join(data.LEVELS_PATH, title + ".json"));
	}
	/**
	 * @param {string?} title
	 */
	static async loadLocalStructure(title) {
		if (!data.STRUCTURES_PATH) throw new Error("STRUCTURES_PATH not found, BA appdata missing?");
		return Level.loadFile(path.join(data.STRUCTURES_PATH, title + ".strc"));
	}
}
