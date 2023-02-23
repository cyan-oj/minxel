import { useEffect, useState } from "react";
import { redraw } from "../../utils/glHelpers"
import ColorSliders from "./ColorSliders";

function PaletteEditor({ colors, activeColor, showSettings, strokeHistory, dispatch, cacheColor}) {
  const [ newColor, setNewColor ] = useState( colors[activeColor] )

  useEffect(() => {
    replaceColor(newColor, activeColor)
  }, [newColor])

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
    <div className="tool-editor" id="palette-editor" style={{ display:showSettings ? "block" : "none" }}>
      <ColorSliders setNewColor={ setNewColor } cacheColorText={ "previous color"} cacheColor={ cacheColor }/>
      <div className="toolbar">
        <button onClick={() => dispatch({ type: "addColor", payload: newColor })}>+</button>
        <button onClick={() => replaceColor( cacheColor, activeColor )}>revert</button>
      </div>
    </div>
  )
}

export default PaletteEditor;