import { useState, useRef } from "react"
import "./DnDDemo.css"

function DnDDemo() {

  const [colors, setColors] = useState([ 
    { 
      title: 'rgb', 
      colors: ['red', 'green', 'blue'] 
    }, 
    { 
      title: 'cmyk', 
      colors: ['cyan', 'yellow', 'magenta', 'black'] 
    }
  ]);

  const [dragging, setDragging] = useState(false);
  
  const dragItem = useRef();
  const dragItemNode = useRef();

  const dragStart = ( e, params ) => {
    console.log('drag start', params)
    dragItem.current = params
    setDragging(true);
  }

  const dragEnter = () => {
    console.log('drag enter')
  }

  const dragOver = () => {
    console.log('drag over')
  }

  const dragLeave = () => {
    console.log('drag leave')
  }

  const drop = () => {
    console.log('drop')
  }

  const getStyles = (group, item) => {
    const currentItem = dragItem.current;
    if (currentItem.group_i === group && currentItem.item_i === item) return 'current dnd-item';
    return 'dnd-item';
  }

  const colorGroups = colors.map((colorGroup, group_i) => 
    <div className="dnd-group" key={ colorGroup.title }>
      <div className="group-title">{ colorGroup.title }</div>
      {
        colorGroup.colors.map(( color, item_i ) =>
          <button key={ item_i } data-id={ item_i } style={{ backgroundColor: color }} 
            className={ dragging ? getStyles( group_i, item_i ) : "dnd-item" } 
            draggable
            onDragStart={ e => dragStart( e, { group_i, item_i })}
            onDragEnter= { dragEnter }
            onDragOver= { dragOver }
            onDragLeave= { dragLeave }
            onDrop={ drop }
            >{ color }
          </button>
        )
      }
    </div>
  )

  return (
    <div className="drag-n-drop">
      {colorGroups}
    </div>
  )
}

export default DnDDemo;