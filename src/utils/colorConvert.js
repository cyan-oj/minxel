export const colorString = (color) => `rgb(${color[0]}, ${color[1]}, ${color[2]})`


export const rgbToGL = (color) => {
  const col = `${color}`
  const rgb = col.split(',')
  return [Number(rgb[0])/255, Number(rgb[1])/255, Number(rgb[2])/255, 1.0]
}

export const glToRGB = (color) => {
  // console.log("glToRGB incoming color", color)
  const newColor = [...color]
  const converted = [newColor[0] * 255, newColor[1] * 255, newColor[2] * 255]
  // console.log("converted", converted)
  return converted
} 