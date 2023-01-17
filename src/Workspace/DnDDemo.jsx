function DnDDemo() {

  const colors = [ 'red', 'green', 'blue', 'cyan', 'yellow', 'magenta', 'black' ]

  const dragStart = () => {
    console.log('drag start')
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

  const colorsList = colors.map( ( color, i ) => 
    <li key={ i }
      data-id={ i }
      draggable
      onDragStart={ dragStart }
      onDragEnter= { dragEnter }
      onDragOver= { dragOver }
      onDragLeave= { dragLeave }
      onDrop={ drop }
    >
      <button style={{ backgroundColor: color }} >
        { color }
      </button>
    </li>
  )

  return (
    <div className="toolbox">
      <ul>
      { colorsList }
      <button className="swatch" id="addColor">|</button>
      </ul>
    </div>
  )
}

export default DnDDemo;