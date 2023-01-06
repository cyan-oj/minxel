class Layer {
  constructor(width, height, fill, image) {
    this.layer = document.createElement('canvas')
    this.layer.width = width;
    this.layer.height = height;
    this.context = this.layer.getContext('2d')

    this.context.fillStyle = fill
    this.context.fillRect(0, 0, width, height)

    this.penX = 0
    this.penY = 0
  }

  drawLine(event, brush, color) {
    if (e.buttons !== 1) return;
  }

  drawBrush(event, brush, color) {
    if (e.buttons !== 1) return;
    // 16.6 ms is 60fps
    
    // get pen position

    //draw shape specified by brush
  }
}

export default Layer;