const { createCanvas, } = require('canvas');

class WorkSpace {
  constructor(options) {
    this.base = createCanvas(options.width, options.height);
    this.base.id = "base";
    this.context = this.base.getContext("2d");

    options.parent.appendChild(this.base);

    this.palette = options.palette;
    this.brush = Object.assign({}, options.brush);
    this.selected = true;
    this.penPos = {
      x: 0,
      y: 0,
    };
    
    console.log(this.palette);

    addEventListener("mousemove", this.draw.bind(this))
    addEventListener("mousedown", this.setPosition.bind(this))
    addEventListener("mousenter", this.setPosition.bind(this))
  }
  
  setPosition(e) {
    let box = this.base.getBoundingClientRect();
    this.penPos.x = e.clientX - box.left;
    this.penPos.y = e.clientY - box.top;
  }

  draw(e) {
    if (e.buttons !== 1) return; //skip if mouse not held down

    const color = this.palette.activeColor;
    const size = this.brush.size;

    this.context.beginPath();

    this.context.lineWidth = size;
    this.context.lineCap = "round";
    this.context.strokeStyle = color;

    this.context.moveTo(this.penPos.x, this.penPos.y); // line start position
    this.setPosition(e); // update pos
    this.context.lineTo(this.penPos.x, this.penPos.y); // line end position
    this.context.stroke(); 
  }
}

module.exports = WorkSpace;