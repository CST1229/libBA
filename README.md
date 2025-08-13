# barfuck

A computer (-ish) + external brainfuck/boolfuck/custom boolfuck derivative compiler that compiles into a [Barfy's Adventure](https://barfy.itch.io/adventure) level.

## Usage

You need node.js. Download this repo, open it in a terminal and:
```
node barfuck.mjs
```
(this will show a list of all arguments. simplest usecase: just pass the code in after `--`: `node barfuck.mjs -- +.`)

By default it will save the level to `%AppData%/Godot/app_userdata/Barfy's Adventure/levels/wau express bf output.json` (so a level called `wau express bf output` in your levels list). If you're not on Windows or you want to save the level JSON somewhere (or you don't have the game installed...), you can use the `--out` argument to put it elsewhere.

## Caveats

The runtime is slow as hell. Also very laggy with high memory sizes or long programs.