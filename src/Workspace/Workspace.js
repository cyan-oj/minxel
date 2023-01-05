import BrushBox from "./BrushBox.js";

// const options = {
  //   name: 'test',
  //   height: 256,
  //   width: 200
  // }
  
  // colors
  // image

class Workspace {
  constructor (options) {
    Object.assign(this, {
      name: 'untitled',
      height: 256,
      width: 256,
      brushBox: new BrushBox()
    }, options)

    this.activeBrush = this.brushes[0]
  }

  get brushes() {
    return this.brushBox.brushes
  }

  addBrush(...options) {
    this.brushBox.addBrush(...options)
  }

  removeBrush(index) {
    this.brushBox.removeBrush(index)
  }

}

const w = new Workspace(options)

console.log(w)
console.log(w.brushes)

w.addBrush(78)
console.log(w.brushes)

w.removeBrush(0)
console.log(w.brushes)