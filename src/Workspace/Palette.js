class Palette {
  constructor(name = "palette", colors = [[0, 0, 0], [255, 255, 255]], max = 256 ) {
    this.name = name
    this.colors = colors
  }

  color(index) {
    return this.colors[index]
  }

  colorString(color) {
    
  }

  addColor(color = [0, 0, 0]) {
    if (!color.length === 3) throw `color must be an array of 3 integers from 0 - 255`
    this.colors.push(color)
  }

  removeColor(index) {
    if (!this.colors[index]) throw `no color at index ${index}`
    this.colors.splice(index, 1)
    return true;
  }

  //movecolor
}

export default Palette;