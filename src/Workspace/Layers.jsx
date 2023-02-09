import { useRef } from "react"
import LayerPreview from "./LayerPreview"
import "./Layers.css"

function Layers({ layers, setLayers, addLayer, setLayer, stroke, activeLayer }) {
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
    setLayer( index )
  }

  const layerControls = layers.map(( layer, i ) => 
    <div key={ layer.name } draggable className={( activeLayer && ( activeLayer.id === layer.id )) ? "active-layer" : "passive-layer" }
      onDragStart={ e => dragStart( i )}
      onDragEnter={ e => dragEnter( i )}
    >
      <LayerPreview key={ layer.name } id={ i } layer={ layer } stroke={ stroke } />
    </div>
  )

  return (
    <div className="toolbox" id="layer-controls" onMouseUp={ e => setLayer( e.target.id ) }>
      { layerControls }
      <button onClick={ addLayer }>add canvas</button>
      <h4>Layers</h4>
    </div>
  )
}

export default Layers