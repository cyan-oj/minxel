import { rgbToGL } from "./colorConvert"
import { FRAG_SHADER, FSHADER_SOURCE, VERT_SHADER } from '../utils/shaders.js'
import { initShaders } from '../WebGLUtils/cuon-utils.js'

const BRUSH_VERTICES = new Float32Array([
  -0.1, 0.1,
  -0.1, -0.1, 
  0.1,  0.1, 
  0.1,  -0.1
]) 

// export const getAttributes = gl => {
//   const glAttributes = {
//     a_Position: gl.getAttribLocation( gl.program, 'a_Position' ),
//     a_PointSize: gl.getAttribLocation( gl.program, 'a_PointSize' ),
//     u_FragColor: gl.getUniformLocation( gl.program, 'u_FragColor' )
//   }
//   return glAttributes
// }

export const getAttributes = ( gl ) => {
  const glAttributes = {
    u_ModelMatrix: gl.getUniformLocation(gl.program, 'u_ModelMatrix'),
    a_Position: gl.getAttribLocation(gl.program, 'a_Position'),
    u_FragColor: gl.getUniformLocation(gl.program, 'u_FragColor'),
  }
  return glAttributes
}

export const getStroke = ( point1, point2 ) => { 
  const distance = Math.sqrt( Math.pow( point2.x - point1.x, 2 ) + Math.pow( point2.y - point1.y, 2 ))
  const angle = Math.atan2( point2.x - point1.x, point2.y - point1.y )
  const deltaP = point2.pressure - point1.pressure
  return [ distance, angle, deltaP ]
}

export const initVertexBuffers = ( gl, vertices, a_Position ) => {
  const vertexBuffer = gl.createBuffer();
  if ( !vertexBuffer ){
    console.error( 'failed to create buffer object' )
    return false;
  } 
  gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer )
  gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW )
  gl.vertexAttribPointer( a_Position, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( a_Position );
  return vertices.length/2
}


// export const drawPoint = ( gl, glAttributes, position, size, color,  ) => {
//   gl.vertexAttrib3f( glAttributes.a_Position, position[0], position[1], 0.0 )
//   gl.vertexAttrib1f( glAttributes.a_PointSize, size )
//   gl.uniform4f( glAttributes.u_FragColor, color[0], color[1], color[2], color[3] )
//   gl.drawArrays( gl.points, 0, 1 )
// }

export const drawPoint = ( gl, glAttributes, modelMatrix, color ) => {
  const points = initVertexBuffers(gl, BRUSH_VERTICES, glAttributes.a_Position);
  if (!points) console.error('failed to set vertex positions')
  gl.uniformMatrix4fv( glAttributes.u_ModelMatrix, false, modelMatrix.elements )
  gl.uniform4f(glAttributes.u_FragColor, color[0], color[1], color[2], 1)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

// refactor for square
export const drawStroke = ( gl, glAttributes, color, points ) => {
  if ( !points || points.length < 1 ) return
  for( let i = 0; i < points.length; i++ ){
    const point = points[i]
    drawPoint( gl, glAttributes, point.position, point.size, color )
  }
}

// refactor for square
export const redraw = ( gl, colors, strokes ) => {
  const glAttributes = getAttributes( gl ) 
  gl.clear( gl.COLOR_BUFFER_BIT )
  strokes.forEach( stroke => {
    const drawColor = rgbToGL( colors[stroke.color] )
    drawStroke( gl, glAttributes, drawColor, stroke.points  )
  })
}

export const createLayer = ( width, height, num, backgroundColor=[ 0.0, 0.0, 0.0, 0.0 ] ) => {
  const layerName = `layer ${num + 1}`
  const newCanvas = document.createElement( 'CANVAS' )
  newCanvas.width = width
  newCanvas.height = height
  const gl = newCanvas.getContext( 'webgl', { antialias: false, preserveDrawingBuffer: true })
  gl.clearColor(...backgroundColor);
  gl.clear(gl.COLOR_BUFFER_BIT)
  if ( !gl ) alert( 'Your browser does not support WebGL. Try updating or using another browser, such as the most recent version of Mozilla Firefox' )
  if ( !initShaders( gl, VERT_SHADER, FRAG_SHADER )) console.error( 'failed to initialize shaders' )
  const newLayer = { id: num, name: layerName, canvas: newCanvas, context: gl, visible: true }
  return newLayer
}