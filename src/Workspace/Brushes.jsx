import { useRef } from "react"
import "./Brushes.css"

function Brushes({ brushes, activeBrush, dispatch }) {
  const dragBrush = useRef()

  const dragStart = ( index ) => dragBrush.current = index

  const dragEnter = ( index, brushes ) => {
    const currentBrush = dragBrush.current;
    const dropBrush = brushes.splice( currentBrush, 1 )[0]
    brushes.splice( index, 0, dropBrush )
    dragBrush.current = index
    dispatch({ type: "brushes", payload: brushes })
  }

  const brushList = brushes.map(( brush, index ) => 
    <button key={ index } value={ index } className="brush"
      id={( index == activeBrush ) ? "active-brush" : null }
      draggable
      onDragStart={ e => dragStart( index )}
      onDragEnter={ e => dragEnter( index, brushes )}
      onMouseUp={ e => dispatch({ type: "activeBrush", payload: e.target.value })}
    >{brush.size}</button>  
  )

  return (
    <div className="toolbox" >
      <div className="tool-sample">
      { brushList }
      </div>
      <div className="toolbar">
          brush size presets
      </div>
    </div>
  )
}

export default Brushes