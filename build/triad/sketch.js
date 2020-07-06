var dy = 1.0;
var dx = 0.57735;
var side = 700;
var border = 10;
var t = 0.2;
//var i;

class Spot {
    constructor(newX, newY, newA, newB, newD, newName) {
        this.x = newX;
        this.y = newY;
        this.a = newA;
        this.b = newB;
        this.d = newD;
        this.name = newName;

        if (this.a > t && this.b > t && this.d > t) {
            // balanced
            this.c = color(100, 100, 100, 50);
        } else if (this.a > t && this.b > t && this.d < t) {
            // D supressed
            this.c = color(250, 200, 0, 100);
        } else if (this.a < t && this.b < t && this.d > t) {
            // D dominant
            this.c = color(190, 100, 40, 100);
        } else if (this.a < t && this.b > t && this.d > t) {
            // A suppressed
            this.c = color(0, 200, 0, 100);
        } else if (this.a > t && this.b < t && this.d < t) {
            // A dominant
            this.c = color(0, 100, 0, 100);
        } else if (this.a > t && this.b < t && this.d > t) {
            // B supressed
            this.c = color(0, 80, 250, 100);
        } else {
            // B dominant
            this.c = color(0, 0, 100, 100);
        }
    }

    drawSpot() {
        fill(this.c);
        ellipse(this.x, this.y, 10, 10);
    }

    checkHit(cx, cy) {
        return dist(cx, cy, this.x, this.y) < 5;
    }
}

let spots = [];

let table;

function preload() {
    //my table is comma separated value "tsv"
    //and has a header specifying the columns labels
    table = loadTable('data.txt', 'tsv', 'header');

}

function setup() {
    createCanvas(2000, 1000);

    textSize(32);
    fill(255);
    triangle(500, 100 - border, 500 + (side * dx) + border, 100 + (side * dy) + border, 500 - (side * dx) - border, 100 + (side * dy) + border);
    noStroke();

    let a, b, d;
    let x, y;
    let index;
    let name;
    //cycle through the table
    //for (let r = 0; r < 100; r++) {
    for (let r = 0; r < table.getRowCount(); r++) {
        name = table.getString(r, 0);
        a = float(table.getString(r, 1)) / 100;
        b = float(table.getString(r, 2)) / 100;
        d = float(table.getString(r, 3)) / 100;
        x = 500;
        y = 100;
        // both components of A
        x -= dx * (a * side);
        y += dy * (a * side);
        // x component from D
        x += dx * (d * side);
        // y component from D
        y += dy * (d * side);

        spots[r] = new Spot(x, y, a, b, d, name);
        //console.log(spots[r].name + "  A:" + round(spots[r].a * 100) + " B:" + round(spots[r].b * 100) + " D:" + round(spots[r].d * 100));
        spots[r].drawSpot();
        //console.log(spots[r].name);
    }
}

function draw() {
    //triangle(1000,100,1400,900,600,900);
    // clear text area
    fill(255);
    stroke(0);
    rect(600, 100, 800, 100);
    fill(0);
    for (let j = 0; j < table.getRowCount(); j++) {
        if (spots[j].checkHit(mouseX, mouseY)) {
            text(spots[j].name + "  SG1:" + round(spots[j].a * 100) + " SG2:" + round(spots[j].b * 100) + " SG3:" + round(spots[j].d * 100), 620, 150);
            break;
        }
    }
}
