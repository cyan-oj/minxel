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

  const draw = ( event, brush, color ) => {
    if (e.buttons !== 1) return;

    context.imageSmoothingEnabled = false;
    context.globalAlpha = 1; // not needed?

    context.beginPath();
    context.lineWidth = brush.size;
    context.linecap = "round"
    context.strokestyle = color;

    context.moveTo(position.x, position.y)
    setPosition(e);
    context.lineTo(position.x, position.y);
    context.stroke();
  }

  return (
    <canvas ref={layer} id={name} width={width} height={height}></canvas>
  )
}

export default Layer;