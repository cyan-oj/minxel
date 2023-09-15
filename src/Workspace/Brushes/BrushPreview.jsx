import { useEffect, useRef } from "react";
import { ANGLE_VALUES, drawPoint, getAttributes } from "../../utils/glHelpers";
import { Matrix4 } from "../../WebGLUtils/cuon-matrix-utils";

function BrushPreview({ brushes, brush, canvas }) {
  const preview = useRef();

  useEffect(() => {
    const parent = preview.current;
    parent.appendChild(canvas.canvas);
  }, []);

  useEffect(() => {
    console.log("redraw preview");
    const gl = canvas.context;
    const glAttributes = getAttributes(gl);
    const transforms = {
      translate: { x: 0, y: 0 },
      rotate: brush.angle,
      scale: brush.scale,
      ratio: brush.ratio,
      pressure: 1,
    };

    gl.clear(gl.COLOR_BUFFER_BIT);
    drawPoint(gl, glAttributes, transforms, [0.0, 0.0, 0.0, 1.0]);
  }, [brushes]);

  return <div ref={preview} className="brush-thumb" />;
}

export default BrushPreview;
