import { useCallback, useEffect, useRef } from "react"

function Layer({ width, height, name = 'layer', fill, image, active, brush, color }) {
  const layer = useRef()
  const context = useRef()
  const position = { x: 0, y: 0 }

  useEffect(() => {
    console.log("fill", fill)
    context.current = layer.current.getContext('2d')
    console.log(context.current)

    if (fill) {
      context.current.fillStyle = fill
      context.current.fillRect(0, 0, width, height)
    }
  }, [])

  useEffect(() => {
    console.log("togglin'", active)
    if (active) {
      console.log("add listeners")
      layer.current.addEventListener( 'mousedown', setPosition )
      layer.current.addEventListener( 'mousemove', draw )
    } else {
      console.log("remove listeners")
      removeEventListener( 'mousedown', layer.current )
      removeEventListener( 'mousemove', layer.current )
    }
    
    return(() => {
      layer.current.removeEventListener( 'mousedown', setPosition )
      layer.current.removeEventListener( 'mousemove', draw )
    })
  }, [ active, brush, color ])
  
  const setPosition = e => {
    const box = e.target.getBoundingClientRect();
    position.x = e.clientX - box.left;
    position.y = e.clientY - box.top;
  }

  const draw = ( event ) => {
    if ( event.buttons !== 1 ) return;
    console.log("color", color)

    context.current.imageSmoothingEnabled = false;

    context.current.beginPath();
    context.current.lineWidth = brush.size;
    context.current.lineCap = "round"
    context.current.strokeStyle = color;

    context.current.moveTo(position.x, position.y)
    setPosition(event);
    context.current.lineTo(position.x, position.y);
    context.current.stroke();
  }

  return (
    <canvas ref={ layer } id={ name } width={ width } height={ height } />
  )
}

export default Layer;