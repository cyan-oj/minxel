import { useRef } from "react"
import LayerPreview from "./LayerPreview"
import "./Layers.css"
import { ReactComponent as Addicon } from "../assets/icons/sharp-icons/add-circle-sharp.svg"

function Layers({ layers, setLayers, addLayer, stroke, activeLayer, dispatch }) {
  const dragLayer = useRef()
  const dragStart = ( index ) => dragLayer.current = index
  const dragEnter = ( index ) => {
    const currentLayer = dragLayer.current
    setLayers( oldLayers => {
      const newLayers = [...oldLayers ]
      const dropLayer = newLayers.splice( currentLayer, 1 )[0]
      newLayers.splice( index, 0, dropLayer )
      dragLayer.current = index
      return newLayers
    })
    dispatch({ type: "activeLayer", payload: index })
  }

  const layerControls = layers.map(( layer, i ) => 
    <div key={ layer.name } draggable
      onDragStart={ e => dragStart( i )}
      onDragEnter={ e => dragEnter( i )}
    >
      <LayerPreview key={ layer.name } id={ i } layer={ layer } stroke={ stroke } activeLayer={ activeLayer } />
    </div>
  )

  return (
    <div className="toolbox" id="layer-controls">
      <div className="toolbar" onClick={ addLayer } >
        <Addicon className="icon" />
        add canvas</div>
      <div className="tool-sample" id="layer-sample" onMouseUp={ e => dispatch({ type: "activeLayer", payload: e.target.id })}>
        { layerControls }
      </div>
    </div>
  )
}

export default Layers