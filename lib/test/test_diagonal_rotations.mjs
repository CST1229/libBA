// @ts-check
import {
	Level, OBJECT_LAYERS, EFFECTIVE_ROTATION_GROUPS, effectiveTileToRaw, TILE_INFO, EffectiveRotations, TILES_BY_NAME
} from "../libBA.mjs";

console.log(EFFECTIVE_ROTATION_GROUPS);

const level = new Level("diagonal tiles");
let x = 0;
let y = 0;

/**
 * @param {number} x
 * @param {number} y
 * @param {number} tile
 * @param {number} variant
 * @param {string} rot
 */
function place(x, y, tile, variant, rot) {
	try {
		const [t, v, r] = effectiveTileToRaw(tile, variant, rot);
		level.getLayer(OBJECT_LAYERS[tile] || "TileMap").addTile(t, x, y, v, r, {});
	} catch(e) {
		//throw e;
		level.getLayer("Engine").addTile(TILES_BY_NAME["Red Dot"], x, y);
	}
}

for (const tile of TILE_INFO.rotatable) {
	y = 0;
	//if (tile != 43) continue;
	for (let i = 0; i < TILE_INFO.variants[tile]; i++) {
		place(x, y, tile, i, EffectiveRotations.upleft);
		place(x+1, y, tile, i, EffectiveRotations.up);
		place(x+2, y, tile, i, EffectiveRotations.upright);
		place(x, y+1, tile, i, EffectiveRotations.left);
		place(x+1, y+1, tile, i, EffectiveRotations.no_rotation);
		place(x+2, y+1, tile, i, EffectiveRotations.right);
		place(x, y+2, tile, i, EffectiveRotations.downleft);
		place(x+1, y+2, tile, i, EffectiveRotations.down);
		place(x+2, y+2, tile, i, EffectiveRotations.downright);

		y += 5;
	}

	x += 4;
}

level.saveToLocal();