# Functional Minesweeper

(Try it out!)[https://rangerdane.github.io/mines/]
(Requires a modern browser with ES6 support)

Or clone this yourself if you want. No build process, no baloney. `minesweeper()` is a pure reducer that takes a game state and an action,
and returns the next game state. `creategameview()` takes an element and attaches a new game.

Building this functionally allowed me to add time travel for really cheap (a la redux). So I added an undo button!

## Challenges:
You're not supposed to lose at minesweeper on the first click, so mines aren't seeded until then. I used fisher-yates to shuffle the mines.
If a mine is found on the first revealed tile, I move it to the first empty cell (usually top left) on the board, to mimic classic Windows
minesweeper behavior.

Deep cloning an object without lodash is tough (`Object.assign` only does a shallow copy) so I used a `JSON.parse(JSON.stringify(state))`
pattern. If anyone has any deep existential issues with this, please let me know! I'm curious to find a clean generalized solution to this.

## Issues:
Despite believing that I got the algorithm correct, a good friend of mine and seasoned Minesweeper veteran (6,567 games logged) has stated
that my version doesn't "feel" like the classic. I'd love to get to the bottom of this.
