import { useEffect } from "react";

export function colorString (color) {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
}

export function rgbToGL (color) {
  const col = `${color} `
  const rgb = col.split(',')
  return [Number(rgb[0])/255, Number(rgb[1])/255, Number(rgb[2])/255, 1.0]
}

function PaletteBox({ colors, setColor }) {

  useEffect(() => {
  }, [colors])

  const colorsList = colors.map( color => 
    <button className="swatch" key={color[0]} style={{ backgroundColor: colorString(color) }} value={ color }/>  
  )

  return (
    <>
      <div className="toolbox" onClick={ e => setColor(e.target.value) }>
        { colorsList }
        <button className="swatch" id="addColor">+</button>
      </div>
    </>
  )
}

export default PaletteBox;  