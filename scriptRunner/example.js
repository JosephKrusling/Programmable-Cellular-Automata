// ABOUT.
// The current game state is exposed as a global variable named gameState.
// You have 100ms to do all of your calculations.

var state = getState();

function processGameTick() {
    // print(state);
    let bestCoin = getNearest(state.myTank, state.coins);
    // print(bestCoin);
    let targetX = bestCoin.x;
    let targetY = bestCoin.y;
    // print(`TARGET: numCouns=${state.coins.length}, x=${targetX.toFixed(2)}, y=${targetY.toFixed(2)}, dist=${distance(state.myTank, bestCoin)}`);
    let direction = Math.atan2(targetY - state.myTank.y, targetX - state.myTank.x);
    return {
        direction: direction,
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