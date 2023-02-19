import { useState, useRef } from "react"
import PaletteEditor from "./PaletteEditor"
import { colorString } from "../utils/colorConvert"
import "./Palette.css"
import { redraw } from "../utils/glHelpers"

function Palette({ colors, activeColor, dispatch, strokeHistory, max = 16 }) {
  const [ showSettings, setShowSettings ] = useState( false );
  // const [ showRGB, setShowRGB ] = useState( false )
  // const [ showHSL, setShowHSL ] = useState( true )

  const dragColor = useRef();

  const dragStart = ( index ) => dragColor.current = index

  const dragEnter = ( index ) => {
    const currentColor = dragColor.current;
    const newColors = [ ...colors ]
    const dropColor = newColors.splice( currentColor, 1 )[0]
    newColors.splice( index, 0, dropColor )
    dragColor.current = index
    dispatch({ type: "colors", payload: newColors })
    Object.values( strokeHistory ).forEach( layer => { redraw( layer.context, colors, layer.strokes )})
  }

  const removeColor = index => { // can't be done nondestructively
    // check if color is used in drawing
      // if no: delete
      // if yes: ask how to handle removal
        // replace with other palette color:
          // choose other palette color and re-reference to that color
          // delete strokes that use this color
    // set colors 
      const newColors = [ ...colors ]
      newColors.splice( index, 1 )
      dispatch({ type: "colors", payload: newColors })
    // redraw
  }

  const colorsList = colors.map(( color, index ) => 
    <button key={ index } className="swatch" 
      style={{ backgroundColor: colorString(color), color: colorString( color )}} value={ index } 
      id={( color === colors[activeColor]) ? "active-swatch" : null }
      draggable
      onDragStart={ e => dragStart( index )}
      onDragEnter={ e => dragEnter( index )}
      onMouseUp={ e => dispatch({ type: "activeColor", payload: e.target.value })}
    >■</button>  
  )

  return (
    <div className="toolbox" >
      <div className="tool-sample">
        { colorsList }
      </div>
      <div className="toolbar"
          onClick={ e => { e.preventDefault(); setShowSettings( !showSettings )}}
          >{`⚙ color menu ${ showSettings ? '▼' : '▶'}`}</div>
      <PaletteEditor 
        colors={ colors } activeColor={ activeColor } removeColor={ removeColor }
        strokeHistory={ strokeHistory } dispatch={ dispatch }
        showSettings={ showSettings }
      />
    </div>
  )
}

export default Palette;  