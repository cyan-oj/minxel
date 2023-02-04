import { useRef } from "react";

export function colorString (color) {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
}

export function rgbToGL (color) {
  const col = `${color}`
  const rgb = col.split(',')
  return [Number(rgb[0])/255, Number(rgb[1])/255, Number(rgb[2])/255, 1.0]
}

function PaletteBox({ colors, setColors, setColor, max = 16 }) {

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

  const addColor = ( color=[ 0, 0, 0 ]) => {
    if ( !color.length === 3 ) throw `color must be an array of 3 integers from 0 - 255`
    if ( colors.length >= max ) throw `palette already at max colors`
    setColors( oldColors => { return [ ...oldColors, color ]})
  }

  const removeColor = index => { 
    setColors( oldColors => {
      const newColors = [ ...oldColors ]
      newColors.splice( index, 1 )
      return newColors
    })
  }

  const colorsList = colors.map(( color, index ) => 
    <button key={ index } className="swatch" style={{ backgroundColor: colorString(color), color: colorString(color) }} value={ `${color}` } draggable
      onDragStart={ e => dragStart( index )}
      onDragEnter={ e => dragEnter( index )}
    >■</button>  
  )

  return (
    <div className="toolbox" onMouseUp={ e => setColor(e.target.value) }>
      { colorsList }
      <button className="swatch" id="addColor" onClick={ e => addColor([ 0, 0, 0 ]) }>⚙</button>
    </div>
  )
}

export default PaletteBox;  