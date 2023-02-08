import { rgbToGL } from "./colorConvert";

export const getStroke = ( point1, point2 ) => { 
  const distance = Math.sqrt( Math.pow( point2.x - point1.x, 2 ) + Math.pow( point2.y - point1.y, 2 ));
  const angle = Math.atan2( point2.x - point1.x, point2.y - point1.y );
  const deltaP = point2.pressure - point1.pressure;
  return [ distance, angle, deltaP ]
}

export const drawPoint = ( gl, position, size, color, glAttributes ) => {
  gl.vertexAttrib3f( glAttributes.a_Position, position[0], position[1], 0.0 );
  gl.vertexAttrib1f( glAttributes.a_PointSize, size );
  gl.uniform4f( glAttributes.u_FragColor, color[0], color[1], color[2], color[3] )
  gl.drawArrays( gl.points, 0, 1 )
}

export const getAttributes = gl => {
  const glAttributes = {
    a_Position: gl.getAttribLocation( gl.program, 'a_Position' ),
    a_PointSize: gl.getAttribLocation( gl.program, 'a_PointSize' ),
    u_FragColor: gl.getUniformLocation( gl.program, 'u_FragColor' )
  }
  return glAttributes
}

export const redraw = ( gl, colors, strokes ) => {
  const glAttributes = getAttributes( gl ) 
  gl.clear( gl.COLOR_BUFFER_BIT )
  strokes.forEach( stroke => {
    const drawColor = rgbToGL( colors[stroke.color] )
    stroke.points.forEach( point => {
      drawPoint( gl, point.position, point.size, drawColor, glAttributes )
    })
  })
}