import { useEffect, useRef } from "react";
import "./Layers.css"

function LayerPreview( { layer, id, stroke, activeLayer } ) {
  const preview = useRef();

  useEffect(() => {
    const ctx = preview.current.getContext( '2d' )
    ctx.drawImage( layer.canvas, 0, 0, 50, 50 )
  }, [ stroke ])

  return (
    <div id={ id } className={ Number(activeLayer) === id ? "active-layer" : "layer-preview" }>
      <canvas ref={ preview } className="layer-thumbnail" width={ 50 } height={ 50 } />
      <p className="layer-name">{ layer.name }</p>
    </div>
  )
}

export default LayerPreview;