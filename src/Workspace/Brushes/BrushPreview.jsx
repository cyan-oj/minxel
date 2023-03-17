import { useEffect, useRef } from "react";
import { ANGLE_VALUES, drawPoint, getAttributes } from "../../utils/glHelpers";
import { Matrix4 } from "../../WebGLUtils/cuon-matrix-utils";

function BrushPreview({ brushes, brush, canvas }) {
  const preview = useRef();

  useEffect(() => {
    const parent = preview.current
    parent.appendChild( canvas.canvas )
  }, [])

  useEffect(() => {
    console.log("redraw preview")
    const gl = canvas.context
    const glAttributes = getAttributes( gl )
    const modelMatrix = new Matrix4()
    gl.clear( gl.COLOR_BUFFER_BIT )
    modelMatrix.rotate( ANGLE_VALUES[brush.angle], 0, 0, 1 )
    modelMatrix.scale( brush.scale * brush.ratio * 10, brush.scale * 10 )
    drawPoint( gl, glAttributes, modelMatrix, [0.0, 0.0, 0.0, 1.0] )
  }, [ brushes ])

  return (
    <div ref={ preview } className="brush-thumb" />
  )
}

export default BrushPreview