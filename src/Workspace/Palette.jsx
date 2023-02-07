import { useState, useRef } from "react";
import PaletteEditor from "./PaletteEditor";
import { colorString, glToRGB } from "../utils/colorConvert";
import "./Palette.css"

function Palette({ colors, activeColor, setColors, setColor, max = 16 }) {
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
  }

  const removeColor = index => { 
    setColors( oldColors => {
      const newColors = [ ...oldColors ]
      newColors.splice( index, 1 )
      return newColors
    })
  }

  const colorsList = colors.map(( color, index ) => 
    <button key={ index } className="swatch" 
      style={{ backgroundColor: colorString(color), color: colorString(color) }} value={ `${color}` } 
      id={( color.toString() === glToRGB( activeColor ).toString()) ? "active-swatch" : null }
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
      <PaletteEditor colors={ colors } activeColor={ activeColor } setColors={ setColors } removeColor={ removeColor } showSettings={ showSettings }/>
    </div>
  )
}

export default Palette;  