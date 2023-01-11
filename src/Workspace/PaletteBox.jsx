import { useEffect } from "react";

export function colorString (color) {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
}

function PaletteBox({ colors, setColor }) {

  useEffect(() => {
  }, [colors])

  const colorsList = colors.map( color => 
    <button className="swatch" key={color[0]} style={{ backgroundColor: colorString(color) }} value={colorString(color)}/>  
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