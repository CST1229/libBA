// @ts-check
import * as fs from "node:fs/promises";
import * as process from "node:process";
import * as path from "node:path";
import * as url from "node:url";

let PROGRAM = "";

const DEFAULT_MEM = 8 * 8;
const DEFAULT_IN = 16 * 8;
const DEFAULT_OUT = 64 * 8;
const DEFAULT_NAME = "wau express bf output";

let args = process.argv.slice(2);
const doubledash_index = args.indexOf("--");
if (doubledash_index >= 0) {
	PROGRAM = args.slice(doubledash_index + 1).join(" ");
	args = args.slice(0, doubledash_index);
}

const LANGUAGE_MODES = Object.assign(Object.create(null), {
	"--brainfuck": "brainfuck",
	"--bf": "brainfuck",
	"--boolfuck": "boolfuck",
	"--boolf": "boolfuck",
	"--boof": "boolfuck",
	"--bool": "boolfuck",
	"--barfuck": "barfuck",
	"--barf": "barfuck",
});
const modeArgs = Object.keys(LANGUAGE_MODES);

if (args.includes("--help") || args.includes("-?") || (args.length == 0 && !PROGRAM)) {
	console.log(
`Compiles a barfuck program (seperated by "--").

node barfuck.mjs -- ">>+++<>-+-;>"

  --file [path]            Use a path to a file as the program code.
  --memory [bits]          The size of the memory, in bits.
                           Set to 0 to disable memory (will break brainfuck mode).
                           Adding memory is very expensive (2 engine groups and 5 entities per bit).
                           Default: ${DEFAULT_MEM} bits.
  --input [bits]           The size of input, in bits. Trying to input after this will just give infinite zeroes.
                           Set to 0 to disable inputting.
                           Currently nonfunctional (it's just built into the base level).
                           Adding input bits is relatively cheap (1 vanish block + a few tiles per bit).
                           Default: ${DEFAULT_IN} bits.
  --output [bits]          Amount of bits that can be output. After this, stuff just stops being output.
                           Set to 0 to disable outputting.
                           Adding output bits is very cheap (only adds tiles),
                           and can be made even cheaper with --output-thin-divider.
                           Default: ${DEFAULT_OUT} bits.
  --output-thin-divider    If present, makes the output "cover-up" one block high,
                           instead of having it cover all output.
                           This fixes lag spikes during outputting in large output sizes
                           (due to less tiles having to be moved), but might look worse.
  --name                   The name of the generated level. Default: "${DEFAULT_NAME}".
  --output                 The path to the generated level .json file.
                           If not present, saves it into your Barfy's Adventure levels folder.
  --verbose                Outputs verbosely.
  --debug                  Outputs WAY too verbosely (as in, "prints a line for every tile placed" verbosely).

Language modes:

  brainfuck (${modeArgs.filter(k => LANGUAGE_MODES[k] === "brainfuck").join(", ")})
    It's brainfuck. It's the default. Valid characters: +-<>,.[]
  boolfuck (${modeArgs.filter(k => LANGUAGE_MODES[k] === "boolfuck").join(", ")})
    Brainfuck but it operates on bits, and outputting is on ";" instead of ".".
    Also "-" was removed.
    https://samuelhughes.com/boof/
  barfuck (${modeArgs.filter(k => LANGUAGE_MODES[k] === "boolfuck").join(", ")})
    The internal language of the WAU Express Machine:tm:. bf and boolf compile down to this.
    Differences from boolfuck:
    - The pointer has a direction. ">" moves it forward and "<" reverse its direction.
    - There's a single 1-bit register. The sorta-readded "-" swaps the function of "+" between
      flipping the bit at the pointer and reading it into the register.
      "," reads into the register instead of the bit at the pointer.
      "[" and "]" check the register instead of the bit at the pointer.
    - New character: "}" (functions as a valid ] match but never loops backward. Mostly an internal thing)
`);
	throw new Error("I was told process.exit is bad but return doesn't work... Read the above message for help.");
}

let programPath = getArg("--file", "");
if (programPath) {
	PROGRAM = await fs.readFile(programPath, "utf-8");
}

if (!PROGRAM) {
	throw new Error("No program specified. Use --help or pass no arguments for help");
}

function getArg(name, defaultValue = "") {
	const nameIndex = args.lastIndexOf(name);
	if (nameIndex == -1) {
		return defaultValue;
	} else if (nameIndex >= args.length - 1) {
		throw new SyntaxError(`Argument ${name} has no value provided, maybe omit it?`);
	}
	const arg = args[nameIndex + 1];
	args[nameIndex] = "";
	args[nameIndex + 1] = "";
	return arg;
}
function getIntArg(name, defaultValue = 0) {
	const rawArg = getArg(name, String(defaultValue));
	const arg = Math.round(+rawArg);
	if (!Number.isFinite(arg)) {
		throw new RangeError(`Argument ${name} must be a valid integer, got ${rawArg}`);
	}
	return arg;
}
function getUIntArg(name, defaultValue = 0) {
	const rawArg = getArg(name, String(defaultValue));
	const arg = Math.round(+rawArg);
	if (!Number.isFinite(arg)) {
		throw new RangeError(`Argument ${name} must be a valid integer, got ${rawArg}`);
	}
	if (arg < 0) {
		throw new RangeError(`Argument ${name} must not be negative, got ${rawArg}`);
	}
	return arg;
}

let MEMORY_BITS = getUIntArg("--memory", DEFAULT_MEM);
let INPUT_BITS = getUIntArg("--input", DEFAULT_IN);
let OUTPUT_BITS = getUIntArg("--output", DEFAULT_OUT);
let OUTPUT_THIN_DIVIDER = args.includes("--output-thin-divider");

const thisDir = path.dirname(url.fileURLToPath(import.meta.url));
const BA_APPDATA = path.join(String(process.env.APPDATA), "Godot", "app_userdata", "Barfy's Adventure");
const LEVELS_PATH = path.join(BA_APPDATA, "levels");
const STRUCTURES_PATH = path.join(BA_APPDATA, "structures");
const LOADED_LEVELS_PATH = path.join(thisDir, "levels");
const LOADED_STRUCTURES_PATH = path.join(thisDir, "structures");

let LEVEL_NAME = getArg("--name", DEFAULT_NAME);
let OUTPUT_PATH = getArg("--output", path.join(LEVELS_PATH, LEVEL_NAME + ".json"));

let TOO_MUCH_LOGGING = args.includes("--debug");
let LOGGING = TOO_MUCH_LOGGING || args.includes("--verbose");

let languageMode = "brainfuck";
for (const arg of args) {
	if (arg in LANGUAGE_MODES) {
		languageMode = LANGUAGE_MODES[arg];
	}
}

/**
 * specific tile ids that i might need
 * @readonly
 * @enum {number}
 */
const tiles = {
	ground: 0,
	semisolid: 1,
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
 * all colors.
 * @readonly
 * @enum {number}
 */
const colors = {
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
 * all button actions.
 * @readonly
 * @enum {colors}
 */
const actions = {
	move: colors.red,
	turn: colors.yellow,
	action: colors.green,
	switch_rw: colors.teal,
	register: colors.blue,
	input: colors.pink,
	output: colors.purple,
	unused: colors.white,
};
/**
 * all rotations
 * @readonly
 * @enum {number}
 */
const rotations = {
	up: 0,
	right: 1,
	down: 2,
	left: 3,
	conveyor_right: 0,
	conveyor_left: 2,
};

// every single tile and color name in BA, ripped directly from the code.
const BA_TILE_NAMES = ["Ground", ["Semisolid Platform", "c"], ["Entrance", "Invisible Entrance"], ["WAI Portrait", "c"], ["Spike", "Death Spike"], ["Grass", "c"], ["Arrow", "c"], "Healium Can", ["Wall", "c"], ["Dry Wall", "c"], "Torch", ["Dashgate", "Anti-Dashgate"], ["What am I", "c"], ["Barfy Token", "Barfbot Token", "Cubey Token"], "Barfbot Token (Legacy)", "Gravity Bubble (Legacy)", ["Bubble", "Gravity Bubble", "Dash Bubble"], "Gear", "Camera X Follow", "Camera X Lock", "Dry Ground", "Monoground", ["Off Block", "c"], ["On Block", "c"], ["Toggle Token", "c"], "Temporary Toggle Block", ["Pressure Plate", "c"], ["Fence", "c"], ["Pillar", "c"], ["Monowall", "c"], "Tutorial Board", ["Barfy Gate", "Barfbot Gate", "Cubey Gate"], "Barfbot Gate (Legacy)", ["Small Spikes", "Small Death Spikes"], "Ice", ["Sawblade", "Death Sawblade"], ["Who are You", "Pink Who are You"], "Anti-Slide", "Cubey Token (Legacy)", "Cubey Gate (Legacy)", ["Spring", "Gravity Spring", "Dash Spring"], ["Dodgeball", "Respawning Dodgeball"], "Bubblegum Ground", ["X", "Warning", "Checkmark", "Clock", "Repeat", "Hearts", "Skull", "Question Mark"], ["Sign", "Hanging Sign", "Screen", "Wall Sign"], ["Chain", "c"], ["Off Spike", "c"], ["On Spike", "c"], ["Clay", "Gray Clay", "Clay Spike"], "Temporary Clay", "Gear Fragment", ["Beam Block", "Glass Beam Block"], "Wooey", "Wooey Turn Point", ["One-Use Pressure Plate", "c"], "Red Bricks", ["Balloon", "Infinite Balloon"], ["1x Camera Zoom", "1.2x Camera Zoom", "1.5x Camera Zoom", "2x Camera Zoom"], "Respawning Dodgeball (Legacy)", "Coral Crop", "Teal Dirt", "Opticone", ["Web", "c"], ["Square Barfy Token", "Square Barfbot Token", "Square Cubey Token"], ["WAU Portrait", "Pink WAU Portrait"], "Opticone Portrait", ["Wooey Portrait", "Liquify Portrait"], "Conveyor", "Face Block", "WAI Thumbnail", ["Dashpipe", "c"], ["Curved Dashpipe", "c"], "Checkpoint", ["Teletoken", "c"], "invisible semisolid used for dashpipes lol", ["Dot", "c"], "Purple Ground", "Cactus", ["Fire", "Star", "What am I Outline", "Who are You Outline", "Snowflake", "Party Popper", "Problem?", "Lock"], "Alarm", ["Practice Point", "c"], ["Brick Wall", "c"], ["Toggle Semisolid", "c"], ["Toggle Arrow", "c"], ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], ["Toggle Beam Block", "c"], "Thumbnail Charcter", "Camera X Wrap", "Spike Graze Prevention", ["Door", "Exit-Only Door"], ["Bowling Ball", "Respawning Bowling Ball"], ["S Dashpipe", "c"], ["Z Dashpipe", "c"], "Window", ["Spike Block", "Death Spike Block"], "Reset Ray", ["Start Timer Ray", "End Timer Ray"], ["+5 Seconds Clock", "+10 Seconds Clock", "-5 Seconds Clock"], "", ["Large Bubble", "Large Gravity Bubble", "Large Dash Bubble"], ["Barfy Ray", "Barfbot Ray", "Cubey Ray"], "Camera Y Follow", "Camera Y Lock", "Zeteor", ["Vanish Block", "Healium Vanish Block"], "Vanished Block", ["Large Vanish Block", "Large Healium Vanish Block"], "Large Vanished Block", ["Glider", "Infinite Glider"], "Zeteor Portrait", ["WAI Statue", "WAU Statue", "Wooey Statue"], ["Barfy Ring", "Barfbot Ring", "Cubey Ring"], "What Boulder", "What Boulder Portrait", "Boulder Thumbnail", "Jumpspikes", ["Note Block: Piano", "Note Block: Bass", "Note Block: Drum", "Note Block: ", "Note Block: ", "Note Block: ", "Note Block: ", "Note Block: "], ["Rock", "Rock", "Rock"], ["Bush", "c"], ["Red Tulip", "Sunflower", "uhh... green flower", "Tealip", "Blue Orchid", "Pink Tulip", "Daisy", "Purple Orchid"], ["Key", "c"], ["Target", "c"], "Spreading Lava", "Jungle Grass", ["Dirt Wall", "c"], "Wood", ["Wooden Wall", "c"], ["Tree", "Tree", "Tree"], ["Vine", "c"], ["Off Spike Block", "c"], ["On Spike Block", "c"], "Camera Y Wrap", "Camera Gravity Wrap", "Dashcoin", "Bounshroom", "Mushroom Ground", ["Mushroom", "Mushrooms"], "Camera X Connect", "Camera Y Connect", "Temporary Camera Connect", "Waterfall", "Bounshroom Portrait", ["Slow Auto Engine", "Medium Auto Engine", "Fast Auto Engine"], "Slime", ["Slow Auto Guide", "Medium Auto Guide", "Fast Auto Guide"], ["Stop Guide", "Unused Guide"], ["Slow Track Guide", "Medium Track Guide", "Fast Track Guide"], ["Slow Touch Engine", "Medium Touch Engine", "Fast Touch Engine"], ["Slow Touch Guide", "Medium Touch Guide", "Fast Touch Guide"], "Stone", ["Arrow", "c"], "Reset Guide", ["What Chamber 1", "What Chamber 2", "Who\'s Pyramid", "Groundbreaking", "Jump, Fall, Bounce!", "Dash Destroyer", "Meet Wooey", "Going Up", "What Chamber 3", "Intruder Alert", "Operation On Off", "Dash Constructor", "Amethyst Hollow", "Hurry Up", "Pingwrap", "Going Down", "10 Sleepy Seconds", "Jump-start Jungle", "Target Practice", "3-2", "Stored Away"], "Barrier", ["World 1", "World 2", "World 3"], ["World 1", "World 2", "World 3"], "Snowy Dirt", "Sand", ["Pine Tree", "Snowy Pine Tree"], "Palm Tree", "Accessory Gate", "Snowman", "Taped Gear Fragment", "Bubble Arrow", "Bubble Arrow", ["Cracked Clay", "Cracked Gray Clay", "Cracked Clay Spike"], "", ["Small Arrow", "c"], ["Small Arrow", "c"]];
const COLOR_NAMES = ["Red", "Yellow", "Green", "Teal", "Blue", "Pink", "White", "Purple"];

// barfuck: boolfuck but the pointer has a direction, < reverses it and > moves it.
// there's also a register (internal quirk of the wau express machine).
// - toggles + between flipping and reading into the register. it's set to flipping by default.
// ; outputs the register, . inputs into it and [] checks it

// https://samuelhughes.com/boof/
const BRAINFUCK_TO_BOOLFUCK = {
	";": " ", // new character, so remove existing occurrences
	"+": ">[>]+<[+<]>>>>>>>>>[+]<<<<<<<<<",
	"-": ">>>>>>>>>+<<<<<<<<+[>+]<[<]>>>>>>>>>[+]<<<<<<<<<",
	"<": "<<<<<<<<<",
	">": ">>>>>>>>>",
	",": ">,>,>,>,>,>,>,>,<<<<<<<<",
	".": ">;>;>;>;>;>;>;>;<<<<<<<<",
	"[": ">>>>>>>>>+<<<<<<<<+[>+]<[<]>>>>>>>>>[+<<<<<<<<[>]+<[+<]",
	"]": ">>>>>>>>>+<<<<<<<<+[>+]<[<]>>>>>>>>>]<[+<]",
};
const BOOLFUCK_TO_BARFUCK = {
	"-": " ", // new character, so remove existing occurrences
	"}": " ", // new character, so remove existing occurrences
	"<": "<><",
	";": "-+-;",
	",": "-+-[+},[+}", // set the current cell to 0 then flip it again if the input is 1
	"[": "-+-[", // read the current cell then loop
	"]": "-+-]", // read the current cell then loop
};

/**
 * @param {number} x
 * @param {number} y
 */
function vec2String(x, y) {
	return `(${x}, ${y})`;
}
/**
 * @param {string} string
 */
function stringVec2(string) {
	string = String(string).replace("(", "").replace(")", "");
	return string.split(", ").map((/** @type {string | number} */ num) => +num);
}

let logIndent = 0;
function indentedConsole(func, ...args) {
	args[0] = "\t".repeat(logIndent) + String(args[0]);
	func(...args);
}
function indentedLog(...args) {
	if (!LOGGING) return;
	return indentedConsole(console.log, ...args);
}
function indentedWarn(...args) {
	return indentedConsole(console.warn, ...args);
}

class Tile {
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

const TILEMAPS = [
	"Camera",
	"Camera2",
	"Camera3",
	"Decoration",
	"Engine",
	"Guide",
	"Key",
	"TileMap",
	"Wall"
];

class Layer {
	name = "Uninitialized";
	/**
	 * @type {Level?}
	 */
	level = null;
	/**
	 * @type {{[position: string]: Tile}}
	 */
	tiles = {};

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
		if (TOO_MUCH_LOGGING) {
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
		if (TOO_MUCH_LOGGING) {
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
		if (TOO_MUCH_LOGGING && !noLogs) {
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
			if (TOO_MUCH_LOGGING) {
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
class Level {
	other = {};
	/**
	 * @type {{[layerName: string]: Layer}}
	 */
	layers = {};
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
		if (TOO_MUCH_LOGGING) {
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
		if (TOO_MUCH_LOGGING) {
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
	/**
	 * @param {string} name
	 */
	static async loadLevel(name) {
		return Level.loadFile(path.join(LOADED_LEVELS_PATH, name + ".json"));
	}
	/**
	 * @param {string} name
	 */
	static async loadStructure(name) {
		return Level.loadFile(path.join(LOADED_STRUCTURES_PATH, name + ".strc"), name);
	}
}

// transpile brainfuck and boolfuck to barfuck
function performReplacements(string, replacements) {
	// https://stackoverflow.com/a/15604206
    const re = new RegExp(
		Object.keys(replacements)
		.map(key => key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
		.join("|"), "g"
	);

    return string.replace(re, function(matched){
        return replacements[matched];
    });
}
if (languageMode == "brainfuck") {
	PROGRAM = performReplacements(PROGRAM, BRAINFUCK_TO_BOOLFUCK);
	languageMode = "boolfuck";
}
if (languageMode == "boolfuck") {
	PROGRAM = performReplacements(PROGRAM, BOOLFUCK_TO_BARFUCK);
	languageMode = "barfuck";
}

// optimizes barfuck code
function optimizeCode(string) {
	// < only affects >, so it's safe to remove it if it's run twice without > inbetween
	// (except for control flow since that's unpredictable and i don't feel like it... it could probably still be optimized though)
	// same for - and +
	string = string.replace(/<([^\[\]\>\<]*)</g, "$1");
	string = string.replace(/\-([^\[\]\+\-]*)\-/g, "$1");

	// repeated instructions that don't do anything
	string = string.replace(/(?:\+\+)+/g, "");
	string = string.replace(/(?:\-\-)+/g, "");
	string = string.replace(/(?:\<\<)+/g, "");
	string = string.replace(/\>\<\>/g, "<");
	return string;
}
const unoptimized = PROGRAM;
PROGRAM = optimizeCode(PROGRAM);

const bf_end = await Level.loadStructure("bf_end");
const bf_mem1 = await Level.loadStructure("bf_mem1_specialized");
const bf_mem2 = await Level.loadStructure("bf_mem2_specialized");
const bf_memend = await Level.loadStructure("bf_memend");
const bf_memend_none = await Level.loadStructure("bf_memend_none");
const bf_out1a = await Level.loadStructure("bf_out1a");
const bf_out1b = await Level.loadStructure("bf_out1b");
const bf_out2a = await Level.loadStructure("bf_out2a");
const bf_out2b = await Level.loadStructure("bf_out2b");
const bf_out_end = await Level.loadStructure("bf_out_end");

const baseLevel = await Level.loadLevel("wau express bf base");
baseLevel.rename(LEVEL_NAME);
/**
 * @param {Level} level
 */
function compileToLevel(level) {
	const tilemap = level.layers.TileMap;

	/**
	 * locates a "marker door"
	 * @param {string} name
	 * @returns {[number, number, Tile]}
	 */
	function locateDoor(name) {
		const tile = Object.values(tilemap.tiles).find(o => o.id === tiles.door && o?.specialData?.title == name);
		if (!tile) {
			throw new Error("Could not find marker door " + name);
		}
		return [tile.x, tile.y, tile];
	}
	/**
	 * locates and deletes a "marker door"
	 * @param {string} name
	 * @returns {[number, number]}
	 */
	function locateAndDeleteDoor(name) {
		const arr = locateDoor(name);
		tilemap.deleteTile(arr[0], arr[1]);
		return [arr[0], arr[1]]
	}

	/**
	 * Conditionally deletes an area marked by 2 doors.
	 * @param {boolean} doDelete If true, deletes it.
	 * @param {string} from The top left corner.
	 * @param {string} to THe bottom right corner.
	 * @returns Whether the section was deleted or not.
	 */
	function deleteMarkedSections(doDelete, from, to) {
		const [x1, y1] = locateAndDeleteDoor(from);
		const [x2, y2] = locateAndDeleteDoor(to);
		if (!doDelete) {
			return false;
		}
		indentedLog(`Conditionally deleting ${from} to ${to}`);
		for (let y = y1; y <= y2; y++) {
			for (let x = x1; x <= x2; x++) {
				for (const layer of Object.values(level.layers)) {
					layer.deleteTile(x, y, false, !TOO_MUCH_LOGGING);
				}
			}
		}
		return true;
	}

	let [cx, cy] = locateAndDeleteDoor("m_progrm");
	if (LOGGING) {
		console.log(`Unoptimized (and possibly transpiled) barfuck code: ${unoptimized}`);
	}
	console.log(`Optimized barfuck code: ${PROGRAM}`);

	const wau_bump_block_x = cx - 5;
	const wau_bump_block_y = cy - 1;
	if (!tilemap.hasTile(wau_bump_block_x, wau_bump_block_y)) {
		// block that the wau bumps into so it goes right
		tilemap.addTile(tiles.snowydirt, wau_bump_block_x, wau_bump_block_y);
	}

	/**
	 * Finds and validates [] brackets.
	 */
	function findBrackets(string) {
		const brackets = [];
		const bracketStack = [];
		let pos = 0;
		let line = 1;
		let column = 1;
		for (const char of string) {
			if (char == "\n") {
				line++;
				column = 1;
			} else if (char == "[") {
				bracketStack.push({y: cy + 2, pos, line, column, end: 0});
				if (bracketStack.length > 1) {
					// bump existing brackets up one space
					let lastHeight = cy + 2;
					for (let i = bracketStack.length - 2; i >= 0; i--) {
						if (bracketStack[i].y <= lastHeight) {
							bracketStack[i].y = lastHeight + 4;
							lastHeight = bracketStack[i].y;
						}
					}
				}
			} else if (char == "]" || char == "}") {
				if (bracketStack.length == 0) {
					throw new SyntaxError(`unmatched ] at line ${line} column ${column} (position ${pos})`);
				} else {
					const last = bracketStack[bracketStack.length - 1];
					last.end = pos;
					brackets[last.pos] = last;
					brackets[pos] = last;
					bracketStack.pop();
				}
			}
			column++;
			pos++;
		}
		if (bracketStack.length > 0) {
			const last = bracketStack[bracketStack.length - 1];
			throw new SyntaxError(`unmatched [ at line ${last.line} column ${last.column} (position ${last.pos})`);
		}
		return brackets;
	}
	const brackets = findBrackets(PROGRAM);
	const activeBrackets = {};
	function addActiveBrackets() {
		for (const bracket of Object.values(activeBrackets)) {
			tilemap.addTile(tiles.conveyor, cx, bracket.y, 0, rotations.conveyor_right); // right
			tilemap.addTile(tiles.conveyor, cx, bracket.y + 2, 0, rotations.conveyor_left); // left
		}
	}
	function addGround() {
		tilemap.addTile(tiles.snowydirt, cx, cy);
		addActiveBrackets();
	}
	let pos = 0;
	const WAI_Y = cy - 1;
	for (const char of PROGRAM) {
		switch (char) {
			case "+":
				if (MEMORY_BITS > 0) {
					tilemap.addTile(tiles.button, cx, WAI_Y, actions.action, rotations.up);
				} else {
					tilemap.addTile(tiles.button, cx, WAI_Y, actions.register, rotations.up);
				}
				addGround();
				cx++;
				break;
			case "-":
				if (MEMORY_BITS > 0) {
					tilemap.addTile(tiles.button, cx, WAI_Y, actions.switch_rw, rotations.up);
					addGround();
					cx++;
				}
				break;
			case "<":
				if (MEMORY_BITS > 0) {
					addGround();
					cx++;
					tilemap.addTile(tiles.button, cx, WAI_Y, actions.turn, rotations.up);
					addGround();
					cx++;
					addGround();
					cx++;
				}
				break;
			case ">":
				if (MEMORY_BITS > 0) {
					tilemap.addTile(tiles.button, cx, WAI_Y, actions.move, rotations.up);
					addGround();
					cx++;
					addGround();
					cx++;
				}
				break;
			case ";":
				tilemap.addTile(tiles.button, cx, WAI_Y, actions.output, rotations.up);
				addGround();
				cx++;
				break;
			case ",":
				tilemap.addTile(tiles.button, cx, WAI_Y, actions.input, rotations.up);
				addGround();
				cx++;
				break;
			case "[": {
				const bracket = brackets[pos];
				if (!bracket) {
					throw new Error("no [ bracket matched at " + pos);
				}
				const bottom_y = bracket.y + 2;
				tilemap.addTile(tiles.semisolid, cx, WAI_Y, actions.register, rotations.right);
				for (let i = 0; i < bottom_y; i++) {
					tilemap.addTile(tiles.snowydirt, cx, cy + i);
				}
				addActiveBrackets();
				cx++;

				tilemap.addTile(tiles.semisolid, cx, cy, actions.register, rotations.up);
				tilemap.addTile(tiles.semisolid, cx, WAI_Y - 1, actions.register, rotations.down);
				for (let i = bottom_y; i > cy; i -= 4) {
					tilemap.addTile(tiles.spring, cx, i);
				}
				addActiveBrackets();
				cx++;

				const bottom_y2 = bracket.y;
				for (let i = cy; i <= bottom_y2; i++) {
					tilemap.addTile(tiles.snowydirt, cx, i);
				}
				tilemap.addTile(tiles.conveyor, cx, bottom_y, 0, rotations.conveyor_left);
				addActiveBrackets();
				cx++;

				tilemap.addTile(tiles.togglesemisolid, cx, cy, actions.register, rotations.down);
				tilemap.addTile(tiles.conveyor, cx, bottom_y, 0, rotations.conveyor_left);
				tilemap.addTile(tiles.conveyor, cx, bottom_y2, 0, rotations.conveyor_right);
				addActiveBrackets();
				cx++;

				tilemap.addTile(tiles.snowydirt, cx, cy);
				tilemap.addTile(tiles.conveyor, cx, bottom_y, 0, rotations.conveyor_left);
				tilemap.addTile(tiles.conveyor, cx, bottom_y2, 0, rotations.conveyor_right);
				for (let i = cy + 1; i < (bottom_y2 - 1); i++) {
					tilemap.addTile(tiles.semisolid, cx, i, actions.register, rotations.left);
				}
				// allow writing over this column, so no cx++
				activeBrackets[bracket.pos] = bracket;
				break;
			}
			case "]":
			case "}": {
				const bracket = brackets[pos];
				if (!bracket) {
					throw new Error("no ] bracket matched at " + pos);
				}
				delete activeBrackets[bracket.pos];

				const bottom_y2 = bracket.y;
				const bottom_y = bracket.y + 2;

				tilemap.addTile(tiles.semisolid, cx, WAI_Y, actions.register, rotations.right);
				tilemap.addTile(tiles.snowydirt, cx, cy);
				tilemap.addTile(tiles.conveyor, cx, bottom_y, 0, rotations.conveyor_left);
				tilemap.addTile(tiles.conveyor, cx, bottom_y2, 0, rotations.conveyor_right);
				for (let i = 1; i < (bottom_y2 - 1); i++) {
					tilemap.addTile(tiles.semisolid, cx, cy + i, actions.register, rotations.right);
				}
				addActiveBrackets();
				cx++;

				tilemap.addTile(tiles.semisolid, cx, cy , actions.register, rotations.up);
				tilemap.addTile(tiles.semisolid, cx, cy - 2, actions.register, rotations.down);
				for (let i = bottom_y2; i > cy; i -= 4) {
					tilemap.addTile(tiles.spring, cx, i);
				}
				tilemap.addTile(tiles.conveyor, cx, bottom_y, 0, rotations.conveyor_left);
				addActiveBrackets();
				cx++;

				for (let i = cy; i <= bottom_y2; i++) {
					tilemap.addTile(tiles.snowydirt, cx, i);
				}
				tilemap.addTile(tiles.conveyor, cx, bottom_y, 0, rotations.conveyor_left);
				addActiveBrackets();
				cx++;

				if (char == "]") {
					tilemap.addTile(tiles.togglesemisolid, cx, cy, actions.register, rotations.up);
				} else {
					tilemap.addTile(tiles.semisolid, cx, cy, actions.register, rotations.up);
				}
				tilemap.addTile(tiles.conveyor, cx, bottom_y, 0, rotations.conveyor_left);
				addActiveBrackets();
				cx++;
				
				for (let i = cy; i <= bottom_y; i++) {
					tilemap.addTile(tiles.snowydirt, cx, i);
				}
				// allow writing over this column, so no cx++
				break;
			}
		}
		pos++;
	}
	level.placeStructure(bf_end, cx, cy - 3);


	indentedLog("Bits of input:", INPUT_BITS);
	// TODO: modifiable input

	indentedLog("Bits of memory:", MEMORY_BITS);
	let [mem_cx, mem_cy] = locateAndDeleteDoor("m_memory");
	let [memflr_x, memflr_y] = locateAndDeleteDoor("m_memflr");
	// if there is no memory, delete the memory part altogether
	if (!deleteMarkedSections(MEMORY_BITS == 0, "m_nomem1", "m_nomem2")) {
		const memory_column_width = bf_mem1.width;
		for (let i = 0; i < MEMORY_BITS; i++) {
			let structure;
			if (i % 2 == 0) {
				structure = bf_mem1;
			} else {
				structure = bf_mem2;
			}
			level.placeStructure(structure, mem_cx, mem_cy);
			// add memory addresses
			const mem_text = String(i);
			for (let j = 0; j < mem_text.length; j++) {
				const mem_number = +(mem_text[j]);
				if (Number.isFinite(mem_number)) {
					level.layers.Decoration.addTile(
						tiles.number, mem_cx + j + (3 - mem_text.length), mem_cy + 3, mem_number
					);
				}
			}

			// add floor
			tilemap.addTile(tiles.wood, mem_cx, memflr_y);
			tilemap.addTile(tiles.wood, mem_cx + 1, memflr_y);
			tilemap.addTile(tiles.wood, mem_cx + 2, memflr_y);
			mem_cx += memory_column_width;
		}
		level.placeStructure(bf_memend, mem_cx, mem_cy);
	} else {
		level.placeStructure(bf_memend_none, mem_cx, mem_cy);
	}

	indentedLog("Bits of output:", OUTPUT_BITS);
	let [out_cx, out_cy] = locateAndDeleteDoor("m_output");
	let [outend_x, outend_y] = locateAndDeleteDoor("m_outend");
	if (!deleteMarkedSections(OUTPUT_BITS == 0, "m_noout1", "m_noout2")) {
		const output_row_height = bf_out1a.height;
		for (let i = 0; i < OUTPUT_BITS; i++) {
			let structure;
			if (i % 16 >= 8) {
				if (i % 2 == 0) {
					structure = bf_out1a;
				} else {
					structure = bf_out1b;
				}
			} else {
				if (i % 2 == 0) {
					structure = bf_out2a;
				} else {
					structure = bf_out2b;
				}
			}
			level.placeStructure(structure, out_cx, out_cy);
			if (OUTPUT_THIN_DIVIDER && i !== 0) {
				tilemap.deleteTile(out_cx, out_cy, false, true);
				tilemap.deleteTile(out_cx + 1, out_cy, false, true);
				level.layers.Engine.deleteTile(out_cx, out_cy, false, true);
				level.layers.Engine.deleteTile(out_cx + 1, out_cy, false, true);
			}
			level.layers.Wall.deleteTile(out_cx + 2, out_cy, false, true);
			level.layers.Wall.deleteTile(out_cx + 3, out_cy, false, true);
			out_cy += output_row_height;
		}
		level.placeStructure(bf_out_end, out_cx, out_cy);

		// the start of the "output viewer tunnel" that gets created
		if (out_cy > outend_y) {
			while (outend_y < out_cy) {
				outend_y++;
				tilemap.addTile(tiles.purpleground, outend_x - 1, outend_y);
				tilemap.addTile(tiles.purpleground, outend_x + 1, outend_y);
			}
			tilemap.addTile(tiles.purpleground, outend_x, outend_y);
		} else {
			tilemap.addTile(tiles.purpleground, outend_x, outend_y);
		}
	} else {
		tilemap.addTile(tiles.wood, outend_x, outend_y - 1);
		tilemap.deleteTile(outend_x - 1, outend_y);
		tilemap.deleteTile(outend_x + 1, outend_y);
	}
}
compileToLevel(baseLevel);
baseLevel.saveToFile(OUTPUT_PATH);