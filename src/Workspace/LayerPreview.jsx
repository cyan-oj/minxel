import { useEffect, useRef } from "react";

function LayerPreview( { layer, id, points } ) {

  const preview = useRef();

  useEffect(() => {
    const ctx = preview.current.getContext('2d')
    ctx.drawImage(layer.canvas, 0, 0)
  }, [points])

  return (
    <div className="layer-preview" id={id} >
      <canvas ref={ preview } width={50} height={50}></canvas>
      <p>{ layer.name }</p>
    </div>
  )
}

export default LayerPreview;