//MAZE CODE:
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
//Engine - transition from the current state of our entire World shapes we have
//Render - draw the stuff up to the screen
//Runner - updates between Engine and the World
//Bodies - reference the entire collection of all the different shapes we have created
//Body - object that allow us to update different properties inside of a shape so we can use it to change dimensions, philosophy, rotation, etc.
//Events - object that listens the events (detecting the WIN in the maze)

//if we ever want to change this values, we can change it in one location here:
//how many cells you want your maze to have?:
//max of cells could be around +-100 since we're doing recursion
const cellsHorizontal = 6;
const cellsVertical = 6;
//size of the maze?
//(it will expand to the user's window size)
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

//boilerplate code:-------------------------------------
const engine = Engine.create(); //create new engine
//disabeling gravity in the maze:
engine.world.gravity.y = 0;

const { world } = engine; //create access to the world we're going to create
//when we create engine we get world with it
//world is like a snapshot of all the different shapes we got

//this will show content on the screen:
const render = Render.create({ //we create render object
    element: document.body, //where we want to show our representation inside of our HTML document
    engine: engine, //what engine to use
    options: {
        wireframes: false, //this allows us to apply different solid shapes and colors
        width,
        height
    }
});
Render.run(render); //run our render object we created
Runner.run(Runner.create(), engine); //running form A to B point
//----------------------------------------------------------

//making Walls for our World:
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }), //UP BARRIER
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }), //DOWN BARRIER
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }), //LEFT BARRIER
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }) //RIGHT BARRIER
];
World.add(world, walls);

//----------------
// EXPLANATION OF THE SHUFFLE FUNCTION:
// The shuffle algorithm used in the lecture is called the Fisher-Yates Shuffling Algorithm. The easiest way to think about it is:
// First, we grab the length of our array to get a sense of how many elements are there in the array and set it to a variable, say x.
// Then, we set a while loop and the condition for the while loop is to say while not bigger than variable x.
// Then, inside the while loop, we randomly select an index with the help of Math.random() * variable x (available elements in the array which).
// After we select an element, we make sure to decrease one from the variable x, so that for the next iteration, we do not include that.
// Also, to make sure our while loop logic becomes false at a point so that we avoid looping forever.
// Finally, we swap the element at the current index with the random index we just created and that element on the random index to the element at the current index. (BASIC SWAPPING).
// ----------------

//Maze generation
const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter); //finding random element inside there

        counter--;

        //swapping whatever that random index is with whatever is that counter
        //that will ensure that we swap each element at least one time
        const temp = arr[counter]; //temporary!
        arr[counter] = arr[index]; //update the value
        arr[index] = temp; //update the element
    }

    return arr;
};

const grid = Array(cellsVertical) //3 rows (outter array)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false)); //3 columns (inner array) //run inner function and generate 3 times each different array

//creating grid array of verticals (with hardcoded values):
const verticals = Array(cellsVertical) //3 rows
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false)); //2 elements

//creating grid array of horizontals (with hardcoded values):
const horizontals = Array(cellsVertical - 1) //2 rows
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));


//RANDOM PICKING STARTING POINT
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

//ENTIRE ALGORITHM
const stepThroughCell = (row, column) => {
    //(CHECK 1) If I have visited the cell at [row, column], then return
    if (grid[row][column]) {
        return;
    }

    //Mark this cell as being visited
    grid[row][column] = true;

    //Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'], //top
        [row, column + 1, 'right'], //right
        [row + 1, column, 'down'], //bottom
        [row, column - 1, 'left'] //left
    ]);

    //For each neighbor...
    for (let neighbor of neighbors) {
        const [nextRow, nextColum, direction] = neighbor;

        //See if that neighbor is out of balance (is it end of grid/no more cells?)
        if (nextRow < 0 || nextRow >= cellsVertical || nextColum < 0 || nextColum >= cellsHorizontal) {
            continue; //don't leave this for loop, just dont do anything else for the current iteration of the current step, skip all the next steps and go to the next neighbor
        }

        //(CHECK 2) If we have visited that neighbor, continue to next neighbor
        if (grid[nextRow][nextColum]) {
            continue;
        }

        //Remove a wall from either horizontals or verticals
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

        stepThroughCell(nextRow, nextColum);
    }

    //Visit that next cell (call that "stepThroughCell" function again and pass in the row and column of the cell you are now trying to visit)
};

stepThroughCell(startRow, startColumn); //startRow & startColumn

//VERTICALS & HORIZONTALS
//where I want to draw walls?:
horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        //horizontal segments:
        const wall = Bodies.rectangle(
            //where the walls are?:
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            //how wide?:
            unitLengthX,
            //hot tall?:
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world, wall);
    });
});

//GOAL
const goal = Bodies.rectangle(
    width - unitLengthX / 2, //X
    height - unitLengthY / 2, //Y
    //size always scales with length:
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    }
);
World.add(world, goal);

//BALL
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius, //radius (ball is half the width of the cell)
    //it gives us property on which we will recognize that this is a ball when it gets to the goal:
    {
        label: 'ball',
        render: {
            fillStyle: 'blue'
        }
    }
);
World.add(world, ball);

//adding keypress
//adding speedLimit to stop the ball from going out of bounds
document.addEventListener('keydown', () => {
    const { x, y } = ball.velocity;
    const speedLimit = 5;

    if (event.keyCode === 87 && y > -speedLimit) { //keyCode for W = 87 (up)
        Body.setVelocity(ball, { x, y: y - 5 });
    }

    if (event.keyCode === 68 && x < speedLimit) { //D = 68 (right)
        Body.setVelocity(ball, { x: x + 5, y });
    }

    if (event.keyCode === 83 && y < speedLimit) { //S = 83 (down)
        Body.setVelocity(ball, { x, y: y + 5 });
    }

    if (event.keyCode === 65 && x > -speedLimit) { //A = 65 (left)
        Body.setVelocity(ball, { x: x - 5, y });
    }
});

//WIN Condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];

        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            //when user wins the game, remove the hidden class and display the message "YOU WIN!"
            document.querySelector('.winner').classList.remove('hidden');
            //removing gravity (walls will fall when user wins):
            world.gravity.y = 1;
            //recognizing walls:
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});

//RESTART BUTTON (refresh the page)
function refreshPage() {
    window.location.reload();
};