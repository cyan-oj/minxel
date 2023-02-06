import { useEffect } from "react";
import { colorString, glToRGB, rgbToGL } from "../utils/colorConvert";
import "./PaletteEditor.css"

function PaletteEditor({ activeColor, setColors, showSettings }) {

  useEffect(() => {
    console.log("active color", activeColor)
  }, [showSettings, activeColor])

  const addColor = ( color=[ 255, 255, 255 ]) => {
    setColors( oldColors => [ ...oldColors, color ] )
  }
  
  return (
    <div className="tool-editor" id="palette-editor" style={ showSettings ? { display: "block" } : { display: "none" }}>
      <div className="color-edit-swatch" style={{ backgroundColor: colorString(glToRGB(activeColor)), color: colorString(glToRGB(activeColor)) }} >-</div>
        <button id="addColor" onClick={ e => addColor(activeColor.slice(0, 3)) }>add color</button>
      </div>
  )
}

export default PaletteEditor;