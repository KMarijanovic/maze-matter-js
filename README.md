# maze-matter-js
Maze Game (2022)

DESCRIPTION:

Guide the ball through the maze until you reach the green square.
(W = up, S = down, A = left, D = right)

This maze game was made during my practice with JavaScript through "The Modern JavaScript Bootcampt Course (2022)" by Colt Steele & Stephen Grider. Matter JS library is used to detect collisions between different shapes so they can be reported to us as events. Also, drawing maze onto a canvas while giving the ability to map key presses to movements of shapes. Extra "homework" was making the RESTART button. With this project we learned recursion to implement the simple algorithm.

PROBLEM:

The main problem with this maze game was the velocity of the ball and the collision. If you hold W/S/A or D for longer, it will go through the walls and "escape" the game.

SOLUTION:

Adding the speed limit in code stops ball from going out of bounds.
