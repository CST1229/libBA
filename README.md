# libBA and assorted scripts

A [Node.js](https://nodejs.org) library for working with [Barfy's Adventure](https://barfy.itch.io/adventure) level files.

Also, some scripts I made that use it.

## Files

- `lib/libBA.mjs`: The library itself.
- `lib/tileinfo.json`: `res://assets/tileinfo.json` ripped right from BA's game.pck. Used by libBA.
- `lib/json5.mjs`: A copy of `https://unpkg.com/json5@2.2.3/dist/index.min.mjs`, because tileinfo.json uses trailing commas.

- `everyTileVariantRotationLayer.mjs`: Generated the Every Tile level on the BA test zone (put `testzone.txt` in BA appdata).
- `flipLevel.mjs`: Flips a level horizontally and vertically. Used for What Boulder Chamber 1.
- `makePaint.mjs`: Generates the pixel grid used in Paint. (Some alterations were made after generation.)
- `barfuck/*`: Really old (August 2025) brainfuck compiler for BA.
- `template_levels/*`: Level files used by scripts. (except `paint.json`, that's the finished Paint level)