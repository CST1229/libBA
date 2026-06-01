import * as libBA from "../libBA.mjs";

console.log(JSON.stringify(Object.fromEntries(Object.entries(libBA).filter(([k, v]) => !(v instanceof Function)))));