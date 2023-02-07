import { useEffect, useRef } from "react";
import "./Layers.css"

function LayerPreview( { layer, id, stroke } ) {
  const preview = useRef();

  useEffect(() => {
    const ctx = preview.current.getContext('2d')
    ctx.drawImage(layer.canvas, 0, 0, 50, 50)
  }, [stroke])

  return (
    <div className="layer-preview" id={id} >
      <canvas ref={ preview } id={id} className="layer-thumbnail" width={50} height={50}></canvas>
      <p id={id} >{ layer.name }</p>
    </div>
  )
}

export default LayerPreview;