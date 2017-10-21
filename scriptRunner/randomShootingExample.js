// ABOUT.
// The current game state is exposed as a global variable named gameState.
// You have 100ms to do all of your calculations.
// Example bot script for a random firing bot that will randomly choose a direction to move in and fire

var state = getState(); // the game state that can be used to get information about asteroids, coins, and other tankss

function processGameTick() {
    let shoot = false; // by default do not shoot
    let facing = 0; // direction in which we are facing (radians)
    let thrust = true; // true = accelerate (foot on the gas), false = decelerate (foot off the gas)

    facing = Math.random() * 2 * Math.PI; // get a random radians value to choose the direction to face

    return { // the return value can include all of these values, but each is not required.
        facing: facing, // value between 0 and 2*pi (radians) (inclusive)
        thrust: thrust, // true or false
        shoot: shoot // true or false
    };
}

processGameTick(); // emit update to the server