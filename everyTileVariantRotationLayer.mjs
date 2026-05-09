// @ts-check
import {Level, NORMALIZED_TILE_NAMES, LAYER_NAMES, TILE_INFO} from "./lib/libBA.mjs";

const level = new Level("every tile");
let x = 0;
let y = 0;
for (const _i in NORMALIZED_TILE_NAMES) {
	y = 0;
	const tileId = +_i;

	const variantCount = TILE_INFO.variants[tileId];
	const layerGap = Math.max(0, (11 * 4) - (variantCount * 4));

	for (const layerName of LAYER_NAMES) {
		const layer = level.getLayer(layerName);
		for (let rotation = 0; rotation < 4; rotation++) {
			for (let variant = 0; variant < variantCount; variant++) {
				layer.addTile(tileId, x, y, variant, rotation);
				y += 1;
			}
		}
		y += layerGap;
	}
	x++;
}
level.saveToLocalStructure();

console.log(LAYER_NAMES.join(", "));