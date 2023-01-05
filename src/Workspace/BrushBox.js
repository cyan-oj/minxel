import Brush from "./Brush.js";

const defaultBrushes = {}
const basePen = new Brush( 2, "pen")
const baseBrush = new Brush( 50 )

defaultBrushes[basePen.name] = basePen;
defaultBrushes[baseBrush.name] = baseBrush;

class BrushBox {
  constructor( name = "box", brushes = defaultBrushes ) {
    this.name = name;
    this._brushes = brushes;
  }

  get brushes() {
    return this._brushes
  }

  brush(name) {
    if (!this.brushes[name]) throw `no brush in ${this.name} by that name`
    return this.brushes[name]
  }

  addBrush(size, name, pressure) {
    let nameSuffix = 0;

    while(this.brushes[name]) {
      name = `${name}_${nameSuffix}`
      nameSuffix += 1
    }

    const newBrush = new Brush(size, name, pressure)
    this.brushes[name] = newBrush
  }

  removeBrush()
}

export default BrushBox;
