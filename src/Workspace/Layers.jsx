import { useRef, useState } from "react"
import LayerPreview from "./LayerPreview"
import "./Layers.css"
import { ReactComponent as AddIcon } from "../assets/icons/outline-icons/add-outline.svg"
import { ReactComponent as TrashIcon } from "../assets/icons/outline-icons/trash-outline.svg"
import { ReactComponent as SettingsIcon } from '../assets/icons/sharp-icons/settings-sharp.svg'
import ToolButton from "./ToolButton"

function Layers({ layers, stroke, activeLayer, dispatch }) {
  const [ showTools, setShowTools ] = useState( false )
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
      onDragStart={ () => dragStart( idx )}
      onDragEnter={ e => dragEnter( idx, Number(e.target.id), layers )}>
      <LayerPreview id={ idx } layer={ layer } stroke={ stroke } activeLayer={ activeLayer } />
    </div>
  )

  return (
    <div className="toolbox" id="layer-controls">
      <div className="toolbar" >
        <button onClick={ e => setShowTools( !showTools ) }>
          <SettingsIcon  className="unpin"/> settings  
        </button>
      </div>
      <div className="tool-toggles" style={{ flexDirection: showTools ? "column" : "row" }}>
        <ToolButton buttonText={ "add layer" } Icon={ AddIcon }
          action={ "addLayer"} dispatch={ dispatch }
          showTools={ showTools }/>
        <ToolButton buttonText={ "delete layer"} Icon={ TrashIcon} 
          clickFunction={() => dispatch({ type: "deleteLayer", payload: activeLayer })}
          showTools={ showTools }/>
      </div>
      <div className="tool-sample" id="layer-sample" 
        onMouseUp={ e => dispatch({ type: "activeLayer", payload: Number(e.target.id) })}>
        { layerControls }
      </div>
    </div>
  )
}

export default Layers