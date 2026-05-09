// @ts-check

import {
	Level, Tile, LEVELS_PATH,
	TILES_BY_NAME, VARIANT_ID_BY_NAME, colors, rotations
} from "./lib/libBA.mjs";
import * as url from "node:url";

import * as path from "node:path";

const thisDir = path.dirname(url.fileURLToPath(import.meta.url));
const LOADED_LEVELS_PATH = path.join(thisDir, "template_levels");

const DEFAULT_INPUT = "paint template";
const DEFAULT_OUTPUT = "paint";

const level = await Level.loadFile(path.join(LOADED_LEVELS_PATH, DEFAULT_INPUT + ".json"));
level.rename(DEFAULT_OUTPUT);

const tilemap = level.getLayer("TileMap");
const engines = level.getLayer("Engine");
const guides = level.getLayer("Guide");

/**
 * locates a "marker door"
 * @param {string} name
 * @returns {Tile}
 */
function locateDoor(name) {
	const tile = Object.values(tilemap.tiles).find(o => o.id === TILES_BY_NAME["Door"] && o?.specialData?.title == name);
	if (!tile) {
		throw new Error("Could not find marker door " + name);
	}
	return tile;
}

const pixelcorner1 = locateDoor("pixel1");
const pixelcorner2 = locateDoor("pixel2");
const pixeleng = locateDoor("pixeleng");

const pixel = level.makeStructure(pixelcorner1.x - 1, pixelcorner1.y + 1, pixelcorner2.x + 1, pixelcorner2.y - 1);
const pixelEngineY = pixeleng.y;

pixelcorner1.delete();
pixelcorner2.delete();
pixeleng.delete();

pixel.getLayer("Engine").addTile(TILES_BY_NAME["Orange Slime"], -1, 0, VARIANT_ID_BY_NAME["Orange Slime"]);

const pixel2 = pixel.duplicate();
for (const tile of Object.values(pixel2.getLayer("Engine").tiles)) {
	if (tile.id == TILES_BY_NAME["Orange Slime"] && tile.color == colors.orange) {
		tile.color = colors.teal;
	}
}

const WIDTH = 8;
const HEIGHT = 8;

const ox = pixelcorner1.x - 1;
const oy = pixelcorner1.y + 1;
const w = pixel.width;
const h = pixel.height;
for (let x = 0; x < WIDTH; x++) {
	for (let y = 0; y < HEIGHT; y++) {
		// already placed this one
		if (x === 0 && y === 0) continue;
		const placeX = ox - (x * w);
		const placeY = oy + (y * h);
		// checkerboard
		if ((x + y) % 2 == 0) {
			level.placeStructure(pixel, placeX, placeY);
		} else {
			level.placeStructure(pixel2, placeX, placeY);
		}

		// haha nginx?!?!?!
		const engineX = placeX - 1 - x * 2;
		engines.addTile(
			TILES_BY_NAME["Turbo Auto Engine"],
			engineX, placeY + y * 2,
			VARIANT_ID_BY_NAME["Turbo Auto Engine"], rotations.up
		);
		guides.addTile(
			TILES_BY_NAME["Turbo Auto Guide"],
			engineX, pixelEngineY,
			VARIANT_ID_BY_NAME["Turbo Auto Guide"], rotations.right
		);
	}
}

level.saveToLocal();