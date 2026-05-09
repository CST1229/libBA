// @ts-check

import {
	Level, TILE_INFO, LEVELS_PATH,
} from "./lib/libBA.mjs";

import * as path from "node:path";

const DEFAULT_INPUT = "1_1";
const DEFAULT_OUTPUT = "you play as wc1";

const level = await Level.loadFile(path.join(LEVELS_PATH, DEFAULT_INPUT + ".json"));
level.other.title = DEFAULT_OUTPUT;

for (const layer of Object.values(level.layers)) {
	const tiles = Object.values(layer.tiles);
	for (const pos in layer.tiles) {
		delete layer.tiles[pos];
	}
	for (const tile of tiles) {
		if (TILE_INFO.rotatable.includes(tile.id)) {
			tile.rotation = (tile.rotation + 2) % 4;
		}
		layer.placeTile(tile, -tile.x, -tile.y);
	}
}

level.saveToFile(path.join(LEVELS_PATH, DEFAULT_OUTPUT + ".json"));