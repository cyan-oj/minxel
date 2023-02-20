import { useRef } from "react"
import LayerPreview from "./LayerPreview"
import "./Layers.css"
import { ReactComponent as Addicon } from "../assets/icons/sharp-icons/add-circle-sharp.svg"

function Layers({ layers, stroke, activeLayer, dispatch }) {
  const dragLayer = useRef()

  const dragStart = ( index ) => dragLayer.current = index

  const dragEnter = ( index, targetID, layers ) => {
    const currentLayer = dragLayer.current
    const dropLayer = layers.splice( currentLayer, 1 )[0]
    layers.splice( index, 0, dropLayer )
    dragLayer.current = index
    dispatch({ type: "layers", payload: layers })
    dispatch({ type: "activeLayer", payload: targetID })
  }

  const layerControls = layers.map(( layer, idx ) => 
    <div key={ layer.id } draggable
      onDragStart={ e => dragStart( idx )}
      onDragEnter={ e => dragEnter( idx, Number(layer.id), layers )}>
      <LayerPreview id={ layer.id } layer={ layer } stroke={ stroke } activeLayer={ activeLayer } />
    </div>
  )

  return (
    <div className="toolbox" id="layer-controls">
      <div className="toolbar" 
        onClick={() => dispatch({ type: "addLayer" })} >
        <Addicon className="icon" />
        add canvas</div>
      <div className="tool-sample" id="layer-sample" 
        onMouseUp={ e => dispatch({ type: "activeLayer", payload: e.target.id })}>
        { layerControls }
      </div>
    </div>
  )
}

export default Layers