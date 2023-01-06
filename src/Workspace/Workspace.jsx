import BrushBox from "./BrushBox.js";
import Layer from "./Layer";

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
      brushBox: new BrushBox(),
      layers: [new Layer()]
    }, options)

    this.activeBrush = this.brushes[0]
  }


}

export default Workspace;