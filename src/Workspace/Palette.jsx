import { useState, useRef } from "react";
import PaletteEditor from "./PaletteEditor";
import { colorString } from "../utils/colorConvert";
import "./Palette.css"
import { redraw } from "../utils/glHelpers";

function Palette({ colors, activeColor, setColors, setColor, strokeHistory, setStrokeHistory, max = 16 }) {
  const [ showSettings, setShowSettings ] = useState( false );
  const dragColor = useRef();

  const dragStart = ( index ) => dragColor.current = index

  const dragEnter = ( index ) => {
    const currentColor = dragColor.current;
    setColors( oldColors => {
      const newColors = [ ...oldColors ]
      const dropColor = newColors.splice( currentColor, 1 )[0]
      newColors.splice( index, 0, dropColor )
      dragColor.current = index
      return newColors
    })
    Object.values( strokeHistory ).forEach( layer => { redraw( layer.context, colors, layer.strokes )})
  }

  const removeColor = index => { // before adding, need to implement color replacement
    // check if color is used in drawing
      // if no: delete
      // if yes: ask how to handle removal
        // replace with other palette color:
          // choose other palette color and re-reference to that color
          // delete strokes that use this color
    // set colors 
    setColors( oldColors => {
      const newColors = [ ...oldColors ]
      newColors.splice( index, 1 )
      return newColors
    })
    // redraw
  }

  const colorsList = colors.map(( color, index ) => 
    <button key={ index } className="swatch" 
      style={{ backgroundColor: colorString(color), color: colorString(color) }} value={ index } 
      id={( color === colors[activeColor]) ? "active-swatch" : null }
      draggable
      onDragStart={ e => dragStart( index )}
      onDragEnter={ e => dragEnter( index )}
      onMouseUp={ e => setColor(e.target.value) }
    >■</button>  
  )

  return (
    <div className="toolbox" >
      { colorsList }
      <button className="swatch" id="addColor" 
        onClick={ e => { e.preventDefault(); setShowSettings( !showSettings )}}
      >⚙</button>
      <PaletteEditor 
        colors={ colors } activeColor={ activeColor } setColors={ setColors } removeColor={ removeColor } showSettings={ showSettings }
        strokeHistory={ strokeHistory } setStrokeHistory={ setStrokeHistory }
      />
    </div>
  )
}

export default Palette;  