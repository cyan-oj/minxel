import { useRef, useState } from "react"

function Layers( { layers, setLayers }) {

  const [list, setList] = useState(data);
  const dragItem = useRef();

  const dragStart = ( index ) => {
    dragItem.current = index
  }

  const dragEnter = ( index ) => {
    const currentItem = dragItem.current;
    setList ( oldList => {
      const newList = [...oldList] 
      const dropItem = newList.splice(currentItem, 1)[0]
      newList.splice(index, 0, dropItem)
      dragItem.current = index
      return newList
    })
  }

  // const listItems = list.map(( item, index ) => 
  //   <div key={ index } 
  //     draggable
  //     onDragStart={ e => dragStart( index )}
  //     onDragEnter={ e => dragEnter( index )}
  //   >{ item }</div>
  // )

  const layerControls = layers.map((layer, i) => 
  <div
    draggable
    onDragStart={ e => dragStart( i )}
    onDragEnter={ e => dragEnter( i )}
  >
    <LayerPreview key={layer.name} id={i} layer={layer} points={ points } 
    />
  </div>
);

  return (
    <div className="toolbox" id="layer-controls" 
      onMouseUp={ e => setLayer( e.target.id ) }
    >
      { layerControls }
      <button onClick={ addLayer }>add canvas</button>
      <h4>Layers</h4>
    </div>
  )
}

export default Layers;