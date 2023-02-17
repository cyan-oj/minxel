import { useEffect, useRef } from "react"
import "./Brushes.css"
import { ReactComponent as Addicon } from "../assets/icons/sharp-icons/add-circle-sharp.svg"

function Brushes({ brushes, activeBrush, dispatch, setBrushes }) {
  console.log(activeBrush)
  const dragBrush = useRef()

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
      id={( index == activeBrush ) ? "active-brush" : null }
      draggable
      onDragStart={ e => dragStart( index )}
      onDragEnter={ e => dragEnter( index )}
      onMouseUp={ e => dispatch({ type: "activeBrush", payload: e.target.value })}
    >{brush.size}</button>  
  )

  return (
    <div className="toolbox" >
      <div className="tool-sample">
      { brushList }
      </div>
      <div className="toolbar">
          {/* <Addicon className="icon" width="32" height="32"/> */}
          brush size presets
      </div>
    </div>
  )
}

export default Brushes