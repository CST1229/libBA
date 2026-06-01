import * as libBA from "../libBA.mjs";

for (const _id in libBA.BA_TILE_NAMES) {
	const id = +_id;
	const arr = libBA.BA_TILE_NAMES[id];

	let objName = "";
	if (Array.isArray(arr)) {
		objName = arr[0];
	} else {
		objName = arr;
	}

	console.log(`${id}: ${objName}`);
}