import { useState } from "react";
import convert from "color-convert"
import { colorString } from "../utils/colorConvert"
import { redraw } from "../utils/glHelpers"
import ColorSliders from "./ColorSliders";

function PaletteEditor({ colors, activeColor, showSettings, strokeHistory, dispatch }) {
  const [newColor, setNewColor] = useState( colors[activeColor] )
  const replaceColor = ( color, index ) => { 
    dispatch({ 
      type: "replaceColor", 
      payload: {
        color, 
        index
      } 
    })
    const newColors = [...colors]
    newColors[index] = color
    Object.values( strokeHistory ).forEach( layer => { redraw( layer.context, newColors, layer.strokes )})
  }
  
  return (
    <div className="tool-editor" id="palette-editor" style={ showSettings ? { display: "block" } : { display: "none" }}>
      <ColorSliders oldColor={ colors[activeColor] } setNewColor={ setNewColor } oldColorText={ "active color"} />
      <div className="toolbar">
        <button id="addColor" title="add color to palette" 
          onClick={ e => dispatch({ type: "addColor", payload: newColor })}>+</button>
        <button id="replaceColor" title="replace active color with new color" 
          onClick={() => replaceColor( newColor, activeColor )}>swap</button>
      </div>
    </div>
  )
}

export default PaletteEditor;