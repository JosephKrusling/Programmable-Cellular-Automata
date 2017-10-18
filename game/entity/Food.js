const Entity = require('./Entity');

function Food(x, y, radius)
{
    Entity.call(this, x, y, radius);
    // let randomColor = Math.random() * 255.00;
    // this.color = `rgba(${(Math.random() * 255).toFixed(0)}, ${(Math.random() * 255).toFixed(0)}, ${(Math.random() * 255).toFixed(0)}, 1)`;
    this.color = getBrightColor(y);
    //this.color = 'rgba(255, 255, 255, 1)';

    //        ctx.fillStyle = 'rgba(255, 255, 128, 1)';

}

Food.prototype = Object.create(Entity.prototype);

Food.prototype.getPosition = function(){
    return [this.x, this.y];
};

// returns a random color that has one of rgb as at least twice as bright as the other two.
function getBrightColor(xCord){
    let red = -1;
    let green = -1;
    let blue = -1;

    let rgb = Math.random() * 3; // determine which will be the bright color
    if(rgb > 2) red = 255;
    else if(rgb > 1) green = 255;
    else if(rgb > 0) blue = 255;

    if(red < 0) red = Number((Math.random() * 128).toFixed(0));
    if(green < 0) green = Number((Math.random() * 128).toFixed(0));
    if(blue < 0) blue = Number((Math.random() * 128).toFixed(0));
    // make sure at least one color is higher than half 255
    //return `rgba(${red}, ${green}, ${blue}, 1)`;
    let colors = colorWheel(xCord/3);
    let result = `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`;
    return result;
}

// gets a color from the color wheel, index should be less than 256 and at least 0
function colorWheel(index){
    // I stole all of this from: https://github.com/adafruit/Adafruit_NeoPixel/blob/master/examples/buttoncycler/buttoncycler.ino#L154-L165
    let colors = [-1, -1, -1]; // red, green, blue
    let red = -1;
    let green = -1;
    let blue = -1;
    index = 255 - index;

    if(index < 85){ // red
        colors = [index * 3, 255 - index * 3, 0];
        red = index * 3;
        green = Math.abs(255 - index * 3);
        blue = 0;
    }
    else if(index < 170){ // green
        colors = [0, index * 3, 255 - index * 3];
        index -= 85;
        red = 0;
        green = index * 3;
        blue = Math.abs(255 - index * 3);
    }
    else { // blue
        colors = [255 - index * 3, 0, index * 3];
        index -= 170;
        red = Math.abs(255 - index * 3);
        green = 0;
        blue = index * 3;
    }
    // red = colors[0];
    // green = colors[1];
    // blue = colors[2];
    // make sure at least one color is close to max

    if((red > 255 || green > 255 || blue > 255) && (red > 0 || green > 0 || blue > 0)){
        let breakme = 0; // testing and making sure values aren't too big
    }
    return [Math.floor(red), Math.floor(green), Math.floor(blue)];
}

module.exports = Food;