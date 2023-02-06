import { useEffect } from "react";
import { colorString } from "./Palette";

function PaletteEditor({ colors, setColors, addColor, showSettings }) {

  useEffect(() => {

  }, [showSettings])

  const colorsList = colors.map(( color, index ) => 
  <div key={ index }>
      <button className="swatch" style={{ backgroundColor: colorString(color), color: colorString(color) }} value={ `${color}` }>■</button>
      <button>✕</button>
    </div>
  )
  
  return (
    <div className="tool-editor" id="palette-editor" style={ showSettings ? { display: "flex" } : { display: "none" }}>
      { colorsList }
      <button className="swatch" id="addColor" onClick={ e => addColor([ 0, 0, 0 ]) }>+</button>
    </div>
  )
}

export default PaletteEditor;