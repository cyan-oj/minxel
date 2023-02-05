export const getStroke = (point1, point2) => { 
  const distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  const angle = Math.atan2( point2.x - point1.x, point2.y - point1.y );
  return [distance, angle]
}

export const drawPoint = ( gl, position, size, color, glAttributes ) => {
  gl.vertexAttrib3f( glAttributes.a_Position, position[0], position[1], 0.0 );
  gl.vertexAttrib1f( glAttributes.a_PointSize, size );
  gl.uniform4f( glAttributes.u_FragColor, color[0], color[1], color[2], color[3] )
  gl.drawArrays( gl.points, 0, 1 )
}