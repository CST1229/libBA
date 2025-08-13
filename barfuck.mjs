// @ts-check
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as process from "node:process";
import * as url from "node:url";

import {
	Level, Tile, LEVELS_PATH,
	colors, rotations, tiles,
	indentedLog, logging
} from "./libBA.mjs";

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
`Compiles a brainfuck/boolfuck/barfuck program (seperated by "--").

node barfuck.mjs --barfuck -- ">>+++<>-+-;>"

  --file [path]            Use a path to a file as the program code.
  --name                   The name of the generated level. Default: "${DEFAULT_NAME}".
  --out                    The path to the generated level .json file.
                           If not present, saves it into your Barfy's Adventure levels folder.
  
  --memory [bits]          The size of the memory, in bits.
                           Set to 0 to disable memory (will break brainfuck mode).
                           Adding memory is very expensive (2 engine groups and 5 entities per bit).
                           Default: ${DEFAULT_MEM} bits.
  --input [bits]           The size of input, in bits. Trying to input after this will just give infinite zeroes.
                           Set to 0 to disable inputting.
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
  
  --verbose                Outputs verbosely.
  --debug                  Outputs WAY too verbosely (as in, "prints a line for every tile placed" verbosely).

Language modes:

  brainfuck (${modeArgs.filter(k => LANGUAGE_MODES[k] === "brainfuck").join(", ")})
    It's brainfuck. It's the default. Valid characters: +-<>,.[]
    Implementation details:
      - 8-bit wrapping cells (I think).
      - Memory is bounded to the limit set by --memory (but bits, so things might be different).
      - Going to the left of memory address 0 is undefined behavior (I think it just doesn't advance?).
      - Going to the right of the maximum memory address is an error (it will also kill the player).
      - Inputting: EOF is infinite zeroes.
      - Outputting: No character set (you just see the bits directly). Though the number of bits
        you can output is limited by --output (anything after this gets discarded).
  boolfuck (${modeArgs.filter(k => LANGUAGE_MODES[k] === "boolfuck").join(", ")})
    Brainfuck but it operates on bits, and outputting is on ";" instead of ".".
    Also "-" was removed.
    https://samuelhughes.com/boof/
  barfuck (${modeArgs.filter(k => LANGUAGE_MODES[k] === "barfuck").join(", ")})
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
const LOADED_LEVELS_PATH = path.join(thisDir, "levels");
const LOADED_STRUCTURES_PATH = path.join(thisDir, "structures");

let LEVEL_NAME = getArg("--name", DEFAULT_NAME);
let OUTPUT_PATH = getArg("--out", path.join(LEVELS_PATH, LEVEL_NAME + ".json"));

logging.TOO_MUCH_LOGGING = args.includes("--debug");
logging.LOGGING = logging.TOO_MUCH_LOGGING || args.includes("--verbose");

let languageMode = "brainfuck";
for (const arg of args) {
	if (arg in LANGUAGE_MODES) {
		languageMode = LANGUAGE_MODES[arg];
	}
}

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
const FOREST_BG = 24;

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

// structures!!
function loadStructure(name) {
	return Level.loadFile(path.join(LOADED_STRUCTURES_PATH, name + ".strc"), name);
}
function loadLevel(name) {
	return Level.loadFile(path.join(LOADED_LEVELS_PATH, name + ".json"));
}
const bf_end = await loadStructure("bf_end");
const bf_mem1 = await loadStructure("bf_mem1_specialized");
const bf_mem2 = await loadStructure("bf_mem2_specialized");
const bf_memend = await loadStructure("bf_memend");
const bf_memend_none = await loadStructure("bf_memend_none");
const bf_out1a = await loadStructure("bf_out1a");
const bf_out1b = await loadStructure("bf_out1b");
const bf_out2a = await loadStructure("bf_out2a");
const bf_out2b = await loadStructure("bf_out2b");
const bf_out_end = await loadStructure("bf_out_end");
const bf_input1 = await loadStructure("bf_input1");
const bf_input2 = await loadStructure("bf_input2");
const bf_inputend = await loadStructure("bf_inputend");

const baseLevel = await loadLevel("wau express bf base");
baseLevel.rename(LEVEL_NAME);
/**
 * @param {Level} level
 */
function compileToLevel(level) {
	const tilemap = level.getLayer("TileMap");
	const decorations = level.getLayer("Decoration");
	const engines = level.getLayer("Engine");
	const walls = level.getLayer("Wall");

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
					layer.deleteTile(x, y, false, !logging.TOO_MUCH_LOGGING);
				}
			}
		}
		return true;
	}

	let [cx, cy] = locateAndDeleteDoor("m_progrm");
	if (logging.LOGGING) {
		console.log(`Unoptimized (and possibly transpiled) barfuck code: ${unoptimized}`);
	}
	console.log(`Optimized barfuck code: ${PROGRAM}`);

	const wau_bump_block_x = cx - 5;
	const wau_bump_block_y = cy - 1;
	if (!tilemap.hasTile(wau_bump_block_x, wau_bump_block_y)) {
		// block that the wau bumps into so it goes right
		tilemap.addTile(tiles.snowydirt, wau_bump_block_x, wau_bump_block_y);
	}

	const WAI_Y = cy - 1;
	if (INPUT_BITS == 0) {
		// delete the pink one-use pressure plate that "initializes" the input system
		tilemap.deleteTile(cx - 3, WAI_Y);
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
				if (OUTPUT_BITS > 0) {
					tilemap.addTile(tiles.button, cx, WAI_Y, actions.output, rotations.up);
					addGround();
					cx++;
				}
				break;
			case ",":
				if (INPUT_BITS > 0) {
					tilemap.addTile(tiles.button, cx, WAI_Y, actions.input, rotations.up);
					addGround();
					cx++;
				}
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
				tilemap.addTile(tiles.snowydirt, cx, bottom_y, 0, rotations.conveyor_left);
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
				tilemap.addTile(tiles.snowydirt, cx, bottom_y2, 0, rotations.conveyor_right);
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
	if (!deleteMarkedSections(INPUT_BITS == 0, "m_noinp1", "m_noinp2")) {
		let [inp_cx, inp_cy] = locateAndDeleteDoor("m_input");
		const input_column_width = bf_input1.width;
		for (let i = 0; i < INPUT_BITS; i++) {
			const structure = i % 16 >= 8 ? bf_input2 : bf_input1;
			level.placeStructure(structure, inp_cx, inp_cy);
			inp_cx += input_column_width;
		}
		level.placeStructure(bf_inputend, inp_cx, inp_cy);
		if (INPUT_BITS >= 8) {
			// add second wrap door
			const newWrapDoor = locateDoor("wrap")[2].duplicate();
			tilemap.placeTile(newWrapDoor, inp_cx, newWrapDoor.y);
		} else {
			// delete wrap door and arrows
			decorations.deleteTile(inp_cx, inp_cy + bf_inputend.height - 1);
			const [wrap_x, wrap_y] = locateAndDeleteDoor("wrap");
			decorations.deleteTile(wrap_x, wrap_y + 2);
		}
	} else {
		// delete input viewer door and place invisible entrance at start door.
		// also change the background
		let [start_x, start_y] = locateAndDeleteDoor("start");
		tilemap.addTile(tiles.entrance, start_x, start_y, 1);
		locateAndDeleteDoor("spectate");
		level.other.bg = FOREST_BG;
	}

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
					decorations.addTile(
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
				engines.deleteTile(out_cx, out_cy, false, true);
				engines.deleteTile(out_cx + 1, out_cy, false, true);
			}
			walls.deleteTile(out_cx + 2, out_cy, false, true);
			walls.deleteTile(out_cx + 3, out_cy, false, true);
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