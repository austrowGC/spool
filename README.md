# spool
A fantastical game of canvas-based whimsy.

Writing, graphics, and code by Gregory C. Austrow

## Intro
This is the first computer game I have ideated, designed, and implemented. 
Thank you for taking the time to visit the readme, I hope you will or already have done so for the game itself.

I am presently hosting the game at [my github page](https://austrowGC.github.io/spool).
You may also download this repository to your local files and open the [index.html](index.html) with an internet browser application.
Spool is written with javascript ES6 language features and will not run in browsers which do not support these.
I have no plans to make this version compatible with browsers that do not support ES6 language features.

Development involved use of Firefox 77.0.1 (64-bit) & Chromium 83.0.4103.61 snap (64-bit).

## Menu
Click the [+] graphic to add players. The [-] graphic removes that player when clicked.
Up, Left, Down, Right are by default assigned to the corresponding arrow keys on the keyboard.
To reassign a button for a player, click on that player's graphic labeled by one of the four directions and then press the desired button on the keyboard.
I recommend not duplicating any assignments between or across players; but who knows, maybe emergent game modes can be found that way.
When you are ready to play, click the [Start game] graphic to begin the game.
Color indicates which game graphic belongs to which player and to which button assignments it will respond.

## Gameplay
Pressing the button assigned to Up will send a projectile up. The ship will travel in the opposite direction.

Projectiles travel until they pass the edge of the canvas.

Ships bounce off the edge of the canvas.

Ships will slow down over time, but won't quite stop.

When a ship collides with a projectile, it will disappear. Any projectiles owned by that ship will also be lost at that time.

## Modes
There are only local game modes.

* Single player
	* For as long as possible avoid colliding with other objects.
* Multiplayer
	* Be the last player in the arena by avoiding collisions with other player's projectiles.
