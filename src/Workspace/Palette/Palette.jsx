import { useState, useRef, useEffect } from "react"
import PaletteEditor from "./PaletteEditor"
import { colorString } from "../../utils/colorConvert"
import "./Palette.css"
import { redraw } from "../../utils/glHelpers"
import { ReactComponent as SettingsIcon } from '../../assets/icons/sharp-icons/settings-sharp.svg'
import { ReactComponent as CaretDown } from '../../assets/icons/sharp-icons/caret-down-sharp.svg'
import { ReactComponent as CaretForward } from '../../assets/icons/sharp-icons/caret-forward-sharp.svg'

function Palette({ colors, activeColor, dispatch, strokeHistory, max = 16 }) {
  const [ showSettings, setShowSettings ] = useState( false )
  const [ cacheColor, setCacheColor ] = useState( colors[activeColor] )

  useEffect(() => {
    setCacheColor( colors[activeColor] )
  }, [activeColor])

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
      id={( index == activeColor ) ? "active-swatch" : null }
      draggable
      onDragStart={ e => dragStart( index )}
      onDragEnter={ e => dragEnter( index )}
      onMouseUp={ e => dispatch({ type: "activeColor", payload: e.target.value })}
    >■</button>  
  )

  return (
    <div className="toolbox" >
      <div className="tool-sample" id="palette">
        { colorsList }
      </div>
      <div className="toolbar"
          onClick={() => setShowSettings( !showSettings )}>
        <SettingsIcon className="unpin"/>
        color menu 
        { showSettings ? <CaretDown className="unpin"/> : <CaretForward className="unpin"/>}
      </div>
      <PaletteEditor 
        colors={ colors } activeColor={ activeColor } removeColor={ removeColor }
        strokeHistory={ strokeHistory } dispatch={ dispatch }
        showSettings={ showSettings } cacheColor={ cacheColor } setCacheColor={ setCacheColor }
      />
    </div>
  )
}

export default Palette;  