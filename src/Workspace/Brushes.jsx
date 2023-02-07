import { useEffect } from "react";
import { useRef } from "react";
import "./Brushes.css"

function Brushes({ brushes, activeBrush, setBrushes, setBrush }) {
  const dragBrush = useRef();
  
  const dragStart = ( index ) => dragBrush.current = index

  const dragEnter = ( index ) => {
    const currentBrush = dragBrush.current;
    setBrushes( oldBrushes => {
      const newBrushes = [...oldBrushes]
      const dropBrush = newBrushes.splice( currentBrush, 1 )[0]
      newBrushes.splice( index, 0, dropBrush )
      dragBrush.current = index
      return newBrushes
    })
  }

  const brushList = brushes.map( (brush, index) => 
    <button key={ index } value={ index } className="brush"
      id={( index === activeBrush ) ? "active-brush" : null }
      draggable
      onDragStart={ e => dragStart( index )}
      onDragEnter={ e => dragEnter( index )}
    >{brush.size}</button>  
  )

  return (
    <div className="toolbox" onMouseUp={ e => setBrush(e.target.value)}>
      { brushList }
      <button className="brush" id="addBrush">+</button>
    </div>
  )
}

export default Brushes;