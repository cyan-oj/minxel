import { useEffect, useRef, useState, useMemo } from "react"
import { createLayer, drawPoint, getAttributes } from "../utils/glHelpers"
import { SAMPLE_STROKE } from "../utils/sampleStroke"

import "./Brushes.css"

function Brushes({ brushes, activeBrush, dispatch, brushSample }) {
  const [ showSettings, setShowSettings ] = useState( false )
  const dragBrush = useRef()

  useEffect(() => {
    const brushPreview = document.getElementById("brush-preview")
    brushPreview.appendChild( brushSample.canvas )
  }, [])

  useEffect(() => {
    const gl = brushSample.context
    const glAttributes = getAttributes( gl )
    gl.clear(gl.COLOR_BUFFER_BIT)
    SAMPLE_STROKE.points.forEach(point => {
      drawPoint( gl, point.position, point.size * ( brushes[activeBrush].size / 64 ), [0, 0, 0, 1], glAttributes)
    })
  }, [brushes])

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
      <div className="toolbar" onClick={() => setShowSettings(!showSettings)}>
          brush size presets
      </div>
      <div className="tool-editor" style={{ display:showSettings ? "block" : "none" }}>
        <div id="brush-preview">

        </div>
        <input type="range" min="1" max="64" value={ brushes[activeBrush].size }
          onChange={ e => dispatch({ type: "replaceBrush", payload: { size: e.target.value, index: activeBrush }})}
        />
        <button onClick={ e => dispatch({ type: "addBrush", payload: brushes[activeBrush].size })}>add Brush Preset</button>
      </div>
    </div>
  )
}

export default Brushes