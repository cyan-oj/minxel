export const colorString = ( color ) => {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
} 

export const rgbToGL = ( color ) => {
  const col = `${color}`
  const rgb = col.split(',')
  return [ Number( rgb[0] )/255, Number( rgb[1] )/255, Number( rgb[2] )/255, 1.0 ]
}

export const glToRGB = ( color ) => {
  const newColor = [...color ]
  const converted = [ Math.round( newColor[0] * 255 ), Math.round( newColor[1] * 255 ), Math.round( newColor[2] * 255 )]
  return converted
} 