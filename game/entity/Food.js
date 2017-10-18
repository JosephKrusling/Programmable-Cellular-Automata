const Entity = require('./Entity');

function Food(x, y, radius)
{
    Entity.call(this, x, y, radius);
    let colors = colorWheel(y);
    this.color = `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`;
}

Food.prototype = Object.create(Entity.prototype);

Food.prototype.getPosition = function(){
    return [this.x, this.y];
};

// gets a color from the color wheel, index should be less than 256 and at least 0
function colorWheel(index){
    // I stole all of this from: https://github.com/adafruit/Adafruit_NeoPixel/blob/master/examples/buttoncycler/buttoncycler.ino#L154-L165
    let colors = [-1, -1, -1]; // red, green, blue
    // adjust value until it is within 0 - 255 range
    while(index > 255 ){
        index = 255 - index;
    }
    while(index < 0){
        index = 255 + index;
    }

    if(index < 85){ // blue
        colors = [255 - index,0, index * 3];
    }
    else if(index < 170){ // green
        index -= 85;
        colors = [0, index * 3, 255 - index];
    }
    else { // red
        index -= 170;
        colors = [index * 3, 255 - index, 0];
    }
    for (let i = 0; i < colors.length; i++){
        colors[i] = Math.floor(colors[i]);
    }
    if((colors[0] > 255 || colors[1] > 255 || colors[2] > 255) && (colors[0] > 0 || colors[1] > 0 || colors[2] > 0)) {
        let breakme = 0;// testing and making sure values aren't too big
    }
    return colors;
}

module.exports = Food;