import * as libBA from "../libBA.mjs";

function get(vari) {
	console.log(vari + ":", libBA.getGlobalVar(vari));
}

get("version");
get("difficulties");
get("soundlist");
get("tilesounds");
get("diagonals");
get("diagonals_reverse");
get("icon_exceptions");
get("group_exceptions");
get("rotate_exceptions");
get("chisel_tiles");
get("colornames");
get("classic_variants");
get("hidden_tiles");
get("key_exceptions");