import * as libBA from "../libBA.mjs";

console.log(Object.fromEntries(Object.entries(libBA).filter(([k, v]) => !(v instanceof Object))));