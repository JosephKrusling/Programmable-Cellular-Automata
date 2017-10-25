// ABOUT.
// The current game state is exposed as a global variable named gameState.
// You have 100ms to do all of your calculations.

var state = getState();

function processGameTick() {
    // lol what is this who wrote this
    let direction = 0;

    let bestPlayer = getNearest(state.myTank, state.tanks);
    if (bestPlayer) {
        let targetX = bestPlayer.x;
        let targetY = bestPlayer.y;
        direction = Math.atan2(targetY - state.myTank.y, targetX - state.myTank.x);
    } else {
        let bestCoin = getNearest(state.myTank, state.coins);
        if (bestCoin) {
            let targetX = bestCoin.x;
            let targetY = bestCoin.y;
            direction = Math.atan2(targetY - state.myTank.y, targetX - state.myTank.x);
        } else {
            // find the nearest asteroid
            let nearestAsteroid = getNearest(state.myTank, state.asteroids);
            if (nearestAsteroid) {
                let targetX = nearestAsteroid.x;
                let targetY = nearestAsteroid.y;
                direction = Math.atan2(targetY - state.myTank.y, targetX - state.myTank.x);
            } else {
                if (Math.random() > 0.9)
                    direction = Math.random() * 2 * Math.PI;
                else
                    direction = state.myTank.facing;
            }
        }
    }

    return {
        facing: direction,
        // direction: 0,
        thrust: true,
        shoot: true
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