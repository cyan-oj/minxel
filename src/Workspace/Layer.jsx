import { useEffect, useRef } from "react"

function Layer({ width, height, name = 'layer', fill, image }) {
  const layer = useRef()
  const context = useRef()
  const position = { x: 0, y: 0 }

  useEffect(() => {
    context.current = layer.current.getContext('2d')
    console.log(context.current)

    if (fill) {
      context.current.fillStyle = fill
      context.current.fillRect(0, 0, width, height)
    }
  })

  const setPosition = e => {
    const box = e.target.getBoundingClientRect();
    position.x = e.clientX - box.left;
    position.y = e.clientY - box.top;
  }

  const draw = ( event, brush = { size: 1 }, color = "black" ) => {
    if (event.buttons !== 1) return;

    context.current.imageSmoothingEnabled = false;
    context.current.globalAlpha = 1; // not needed?

    context.current.beginPath();
    context.current.lineWidth = brush.size;
    context.current.linecap = "round"
    context.current.strokestyle = color;

    context.current.moveTo(position.x, position.y)
    setPosition(event);
    context.current.lineTo(position.x, position.y);
    context.current.stroke();
  }

  return (
    <canvas ref={layer} id={name} width={width} height={height} 
      onMouseDown={ setPosition }
      onMouseMove={ draw }
    />
  )
}

export default Layer;