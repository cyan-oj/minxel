import Brush from "./Brush.js";

const defaultBrushes = []
defaultBrushes.push( new Brush( 2, "pen" ))
defaultBrushes.push( new Brush( 50 ))

class BrushBox {
  constructor( name = "box", brushes = defaultBrushes ) {
    this.name = name;
    this._brushes = brushes;
  }

  get brushes() {
    return this._brushes
  }

  count () { // untested
    return Object.keys(this._brushes.keys).length
  }

  brush(index) {
    if (!this.brushes[index]) throw `no brush at index ${index}`
    return this.brushes[index]
  }

  addBrush(size, name, pressure) {
    const newBrush = new Brush(size, name, pressure)
    this.brushes.push(newBrush)
  }

  removeBrush(index) {
    if (!this.brushes[index]) throw `no brush at index ${index}`
    this.brushes.splice(index, 1)
    return true;
  }

  //moveBrush
}

export default BrushBox;
