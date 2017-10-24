// Example bot script for a pacifist bot that never attempts to shoot enemies, but only shoots asteroids to pick up points

var state = getState();

function processGameTick() {
    let shoot = false; // by default do not shoot
    let facing = 0; // direction in which we are facing (radians)
    let target = {x:0, y:0};
    let thrust = true;

    if(state.myTank.mayShoot()) // if we can shoot then aim at the closest asteroid
    {
        let closestAsteroid = getNearest(state.myTank, state.asteroids);
        target.x = closestAsteroid.x;
        target.y = closestAsteroid.y;
        shoot = true;
        thrust = false; // don't continue movement on fire (no real reason other than to demonstrate this command)
    }
    else{ // if we can't shoot then aim at a coin and thrust towards it
        let bestCoin = getNearest(state.myTank, state.coins);
        // print(bestCoin);
        target.x = bestCoin.x;
        target.y = bestCoin.y;
        shoot = false;
        thrust = true;
    }

    // calculate the angle to get the direction we want to face
    facing = Math.atan2(target.y - state.myTank.y, target.x - state.myTank.x);
    // print(`TARGET: numCouns=${state.coins.length}, x=${targetX.toFixed(2)}, y=${targetY.toFixed(2)}, dist=${distance(state.myTank, bestCoin)}`);

    return {
        facing: facing, // value between 0 and 2*pi (radians) (inclusive)
        thrust: thrust, // true or false
        shoot: shoot // true or false
    };
}

function getNearest(toEntity, candidateEntities) {
    let bestCandidate = null;
    let bestDistance = 9999999;

    for (let candidateIndex = 0; candidateIndex < candidateEntities.length; candidateIndex++) {
        let candidate = candidateEntities[candidateIndex];
        let dist = distance(toEntity, candidate);
        if (dist < bestDistance) {
            bestDistance = dist;
            bestCandidate = candidate;
        }
    }
    // print(`best dist ${bestDistance}`);
    return bestCandidate;
}

function distance(entity1, entity2) {
    let dist =  Math.sqrt(Math.pow(entity1.x - entity2.x, 2) + Math.pow(entity1.y - entity2.y, 2));
    return dist;
}

processGameTick();