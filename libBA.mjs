// @ts-check
// code related to general BA level stuff.

import * as fs from "node:fs/promises";
import * as process from "node:process";
import * as path from "node:path";

export const BA_APPDATA = path.join(String(process.env.APPDATA), "Godot", "app_userdata", "Barfy's Adventure");
export const LEVELS_PATH = path.join(BA_APPDATA, "levels");
export const STRUCTURES_PATH = path.join(BA_APPDATA, "structures");

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
export function indentedConsole(func, ...args) {
	args[0] = "\t".repeat(logIndent) + String(args[0]);
	func(...args);
}
export function indentedLog(...args) {
	if (!logging.LOGGING) return;
	return indentedConsole(console.log, ...args);
}
export function indentedWarn(...args) {
	return indentedConsole(console.warn, ...args);
}

/**
 * Specific tile ids that i might need. Not an exhaustive list, for that use tile IDs or the BA_TILE_NAMES array.
 * @readonly
 * @enum {number}
 */
export const tiles = {
	ground: 0,
	semisolid: 1,
	entrance: 2,
	dryground: 20,
	monoground: 21,
	offblock: 22,
	onblock: 23,
	button: 26,
	ice: 34,
	whoareyou: 36,
	antislide: 37,
	spring: 40,
	bubblegumground: 42,
	oneusebutton: 54,
	redbricks: 55,
	conveyor: 67,
	purpleground: 76,
	togglesemisolid: 82,
	number: 84,
	door: 89,
	vanishblock: 104,
	bigvanishblock: 106,
	junglegrass: 123,
	wood: 125,
	mushroomground: 135,
	engine: 142,
	slime: 143,
	guide: 144,
	stopguide: 145,
	reverseguide: 146,
	touchengine: 147,
	touchguide: 148,
	snowydirt: 156,
	sand: 157,
};

/**
 * All colors.
 * @readonly
 * @enum {number}
 */
export const colors = {
	red: 0,
	yellow: 1,
	green: 2,
	teal: 3,
	blue: 4,
	pink: 5,
	white: 6,
	purple: 7
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

/** 
 * All tilemap names.
 */
export const TILEMAPS = [
	"Camera",
	"Camera2",
	"Camera3",
	"Decoration",
	"Engine",
	"Guide",
	"Key",
	"TileMap",
	"Wall",
];

// every single tile and color name in BA, ripped directly from the code.
/**
 * Every single tile name in BA, ripped directly from the code.
 * [string, "c"] is for auto-colored objects; these use color names from the colors object/COLOR_NAMES array,
 * which get prepended to the beginning of their names.
 * @type {Array<string | [string, "c"] | string[]>}
 */
export const BA_TILE_NAMES = ["Ground", ["Semisolid Platform", "c"], ["Entrance", "Invisible Entrance"], ["WAI Portrait", "c"], ["Spike", "Death Spike"], ["Grass", "c"], ["Arrow", "c"], "Healium Can", ["Wall", "c"], ["Dry Wall", "c"], "Torch", ["Dashgate", "Anti-Dashgate"], ["What am I", "c"], ["Barfy Token", "Barfbot Token", "Cubey Token"], "Barfbot Token (Legacy)", "Gravity Bubble (Legacy)", ["Bubble", "Gravity Bubble", "Dash Bubble"], "Gear", "Camera X Follow", "Camera X Lock", "Dry Ground", "Monoground", ["Off Block", "c"], ["On Block", "c"], ["Toggle Token", "c"], "Temporary Toggle Block", ["Pressure Plate", "c"], ["Fence", "c"], ["Pillar", "c"], ["Monowall", "c"], "Tutorial Board", ["Barfy Gate", "Barfbot Gate", "Cubey Gate"], "Barfbot Gate (Legacy)", ["Small Spikes", "Small Death Spikes"], "Ice", ["Sawblade", "Death Sawblade"], ["Who are You", "Pink Who are You"], "Anti-Slide", "Cubey Token (Legacy)", "Cubey Gate (Legacy)", ["Spring", "Gravity Spring", "Dash Spring"], ["Dodgeball", "Respawning Dodgeball"], "Bubblegum Ground", ["X", "Warning", "Checkmark", "Clock", "Repeat", "Hearts", "Skull", "Question Mark"], ["Sign", "Hanging Sign", "Screen", "Wall Sign"], ["Chain", "c"], ["Off Spike", "c"], ["On Spike", "c"], ["Clay", "Gray Clay", "Clay Spike"], "Temporary Clay", "Gear Fragment", ["Beam Block", "Glass Beam Block"], "Wooey", "Wooey Turn Point", ["One-Use Pressure Plate", "c"], "Red Bricks", ["Balloon", "Infinite Balloon"], ["1x Camera Zoom", "1.2x Camera Zoom", "1.5x Camera Zoom", "2x Camera Zoom"], "Respawning Dodgeball (Legacy)", "Coral Crop", "Teal Dirt", "Opticone", ["Web", "c"], ["Square Barfy Token", "Square Barfbot Token", "Square Cubey Token"], ["WAU Portrait", "Pink WAU Portrait"], "Opticone Portrait", ["Wooey Portrait", "Liquify Portrait"], "Conveyor", "Face Block", "WAI Thumbnail", ["Dashpipe", "c"], ["Curved Dashpipe", "c"], "Checkpoint", ["Teletoken", "c"], "invisible semisolid used for dashpipes lol", ["Dot", "c"], "Purple Ground", "Cactus", ["Fire", "Star", "What am I Outline", "Who are You Outline", "Snowflake", "Party Popper", "Problem?", "Lock"], "Alarm", ["Practice Point", "c"], ["Brick Wall", "c"], ["Toggle Semisolid", "c"], ["Toggle Arrow", "c"], ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], ["Toggle Beam Block", "c"], "Thumbnail Charcter", "Camera X Wrap", "Spike Graze Prevention", ["Door", "Exit-Only Door"], ["Bowling Ball", "Respawning Bowling Ball"], ["S Dashpipe", "c"], ["Z Dashpipe", "c"], "Window", ["Spike Block", "Death Spike Block"], "Reset Ray", ["Start Timer Ray", "End Timer Ray"], ["+5 Seconds Clock", "+10 Seconds Clock", "-5 Seconds Clock"], "", ["Large Bubble", "Large Gravity Bubble", "Large Dash Bubble"], ["Barfy Ray", "Barfbot Ray", "Cubey Ray"], "Camera Y Follow", "Camera Y Lock", "Zeteor", ["Vanish Block", "Healium Vanish Block"], "Vanished Block", ["Large Vanish Block", "Large Healium Vanish Block"], "Large Vanished Block", ["Glider", "Infinite Glider"], "Zeteor Portrait", ["WAI Statue", "WAU Statue", "Wooey Statue"], ["Barfy Ring", "Barfbot Ring", "Cubey Ring"], "What Boulder", "What Boulder Portrait", "Boulder Thumbnail", "Jumpspikes", ["Note Block: Piano", "Note Block: Bass", "Note Block: Drum", "Note Block: ", "Note Block: ", "Note Block: ", "Note Block: ", "Note Block: "], ["Rock", "Rock", "Rock"], ["Bush", "c"], ["Red Tulip", "Sunflower", "uhh... green flower", "Tealip", "Blue Orchid", "Pink Tulip", "Daisy", "Purple Orchid"], ["Key", "c"], ["Target", "c"], "Spreading Lava", "Jungle Grass", ["Dirt Wall", "c"], "Wood", ["Wooden Wall", "c"], ["Tree", "Tree", "Tree"], ["Vine", "c"], ["Off Spike Block", "c"], ["On Spike Block", "c"], "Camera Y Wrap", "Camera Gravity Wrap", "Dashcoin", "Bounshroom", "Mushroom Ground", ["Mushroom", "Mushrooms"], "Camera X Connect", "Camera Y Connect", "Temporary Camera Connect", "Waterfall", "Bounshroom Portrait", ["Slow Auto Engine", "Medium Auto Engine", "Fast Auto Engine"], "Slime", ["Slow Auto Guide", "Medium Auto Guide", "Fast Auto Guide"], ["Stop Guide", "Unused Guide"], ["Slow Track Guide", "Medium Track Guide", "Fast Track Guide"], ["Slow Touch Engine", "Medium Touch Engine", "Fast Touch Engine"], ["Slow Touch Guide", "Medium Touch Guide", "Fast Touch Guide"], "Stone", ["Arrow", "c"], "Reset Guide", ["What Chamber 1", "What Chamber 2", "Who\'s Pyramid", "Groundbreaking", "Jump, Fall, Bounce!", "Dash Destroyer", "Meet Wooey", "Going Up", "What Chamber 3", "Intruder Alert", "Operation On Off", "Dash Constructor", "Amethyst Hollow", "Hurry Up", "Pingwrap", "Going Down", "10 Sleepy Seconds", "Jump-start Jungle", "Target Practice", "3-2", "Stored Away"], "Barrier", ["World 1", "World 2", "World 3"], ["World 1", "World 2", "World 3"], "Snowy Dirt", "Sand", ["Pine Tree", "Snowy Pine Tree"], "Palm Tree", "Accessory Gate", "Snowman", "Taped Gear Fragment", "Bubble Arrow", "Bubble Arrow", ["Cracked Clay", "Cracked Gray Clay", "Cracked Clay Spike"], "", ["Small Arrow", "c"], ["Small Arrow", "c"]];
export const COLOR_NAMES = ["Red", "Yellow", "Green", "Teal", "Blue", "Pink", "White", "Purple"];

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
		return [this.id, this.x, this.y, this.color, this.rotation].map(String).join(",") + "/";
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
		}else if (!nameEntry) {
			name = `Unknown (ID ${this.id})`;
		} else if (typeof nameEntry == "string") {
			if (this.id === tiles.conveyor) {
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
		if (this.id == tiles.door && this.specialData?.title) {
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

	/**
	 * creates a new tile and places it in this level.
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
			if (this.tiles[door] && this.tiles[door].id == tiles.door) {
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
			if (tile.id == tiles.door) {
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
	other = Object.create(null);
	/**
	 * @type {{
	 * 	Camera?: Layer,
	 * 	Camera2?: Layer,
	 * 	Camera3?: Layer,
	 * 	Decoration?: Layer,
	 * 	Engine?: Layer,
	 * 	Guide?: Layer,
	 * 	Key?: Layer,
	 * 	TileMap?: Layer,
	 * 	Wall?: Layer,
	 * }}
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

	contructor() {
		this.other.title = "level";
	}

	/**
	 * @param {string} name
	 */
	rename(name) {
		this.other.title = String(name);
	}
	save() {
		return this.saveToFile(path.join(LEVELS_PATH, this.other.title + ".json"));
	}

	getLayer(name) {
		if (!(name in this.layers)) {
			this.layers[name] = new Layer(this, name);
		}
		return this.layers[name];
	}

	async saveToFile(filePath) {
		const serialized = {};
		for (const key of this.keyOrder) {
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
	 * @param {string} code
	 * @param {string?} forceTitle
	 */
	static fromString(code, forceTitle = null) {
		const level = new Level();
		level.other = JSON.parse(code);
		level.keyOrder = Object.keys(level.other);
		if (forceTitle) {
			level.other.title = forceTitle;
		}
		if (logging.TOO_MUCH_LOGGING) {
			indentedLog(`Loading level ${level.other.title}...`);
			logIndent++;
		}
		for (const layerName of TILEMAPS) {
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
	 * @param {string?} forceTitle
	 */
	static async loadFile(path, forceTitle = null) {
		return Level.fromString(await fs.readFile(path, "utf-8"), forceTitle);
	}
}