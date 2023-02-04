import { useRef } from "react";

export function colorString (color) {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
}

export function rgbToGL (color) {
  const col = `${color}`
  const rgb = col.split(',')
  return [Number(rgb[0])/255, Number(rgb[1])/255, Number(rgb[2])/255, 1.0]
}

function PaletteBox({ colors, setColors, setColor }) {

  const dragColor = useRef();
  
  // useEffect(() => {
  // }, [colors])
  
  const dragStart = ( index ) => {
    dragColor.current = index
  } 

  const dragEnter = ( index ) => {
    const currentColor = dragColor.current;
    setColors( oldColors => {
      const newColors = [...oldColors]
      const dropColor = newColors.splice( currentColor, 1 )[0]
      newColors.splice( index, 0, dropColor )
      dragColor.current = index
      return newColors
    })
  }

  const colorsList = colors.map(( color, i) => 
    <button key={ color[0] } className="swatch" style={{ backgroundColor: colorString(color), color: colorString(color) }} value={ `${color}` } draggable
      onDragStart={ e => dragStart( i)}
      onDragEnter={ e => dragEnter( i )}
    >■</button>  
  )

  return (
    <div className="toolbox" onMouseUp={ e => setColor(e.target.value) }>
      { colorsList }
      <button className="swatch" id="addColor">⚙</button>
    </div>
  )
}

export default PaletteBox;  