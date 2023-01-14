import BrushBox from "./BrushBox.js";
import Palette from "./Palette.js";
import "./Workspace.css"
import { useState, useEffect } from "react";
import PaletteBox, { rgbToGL } from "./PaletteBox.jsx";
import Brushes from "./Brushes.jsx";
import { initShaders } from "../WebGLUtils/cuon-utils.js";


function Workspace({ name = 'untitled', height = '256', width = '256', brushBox = new BrushBox(), palette = new Palette(), image }) {

  const [layers, setLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState();
  const [activeColor, setActiveColor] = useState(rgbToGL(palette.colors[0]));
  const [activeBrush, setActiveBrush] = useState(brushBox.brushes[0]);

  const [strokeHistory, setStrokeHistory] = useState([]);

  const points = [];
  const position = { x: 0, y: 0 }
  // let brush = brushBox.brushes[0]
  // let color = rgbToGL(palette.colors[0])

  const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main() {
      gl_Position = a_Position;
      gl_PointSize = a_PointSize;
    }
  `

  const FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
      gl_FragColor = u_FragColor;
    }
  `

  useEffect(() => {
    addLayer();
    console.log(brushBox)
  }, [])
  
  useEffect(() => {
    console.log(layers)
    attachLayers();
    setLayer("0")
  }, [layers])
  
  const setPosition = e => {
    const rect = e.target.getBoundingClientRect();
    position.x = ((e.clientX - rect.left) - width/2)/(width/2);
    position.y = (height/2 - (e.clientY - rect.top))/(height/2);
    return position;
  }

  const getStroke = (point1, point2) => { 
    const distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    const angle = Math.atan2( point2.x - point1.x, point2.y - point1.y );
    return [distance, angle]
  }

  const draw = ( event, gl ) => {
    if ( event.buttons !== 1 ) return;

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

    const lastPoint = JSON.parse(JSON.stringify(position));
    const currentPoint = setPosition(event);
    const [dist, angle] = getStroke(lastPoint, currentPoint)

    for ( let i = 0; i < dist; i += 0.01 ) {
      const x = lastPoint.x + ( Math.sin(angle) * i );
      const y = lastPoint.y + ( Math.cos(angle) * i );
      points.push([x,y])
    }

    for (let i = 0; i < points.length; i+= 1) {
      gl.vertexAttrib3f(a_Position, points[i][0], points[i][1], 0.0);
      gl.vertexAttrib1f(a_PointSize, activeBrush.size);
      gl.uniform4f(u_FragColor, activeColor[0], activeColor[1], activeColor[2], activeColor[3])
      gl.drawArrays(gl.points, 0, 1)
    }
  }

  const addLayer = () => {
    const newCanvas = document.createElement('CANVAS')
    newCanvas.width = width;
    newCanvas.height = height;
    const gl = newCanvas.getContext('webgl', { antialias: false })

    if (!gl) alert('Your browser does not support WebGL. Try using another browser, such as the most recent version of Mozilla Firefox')
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) console.error('failed to initialize shaders')

    gl.clear(gl.COLOR_BUFFER_BIT);

    const layerName = `layer ${layers.length + 1}`
    setLayers([...layers, {name: layerName, canvas: newCanvas, context: gl}])
  }

  const setLayer = id => {
    const layerId = Number(id)
    setActiveLayer(layers[layerId])
  }

  const setBrush = idx => {
    setActiveBrush(brushBox.brushes[idx]);
  }
  const setColor = color => {
    setActiveColor(rgbToGL(color))
  }

  const saveStroke = ( points, brush, color, gl ) => {
    setStrokeHistory([...strokeHistory, {
      points: points,
      brush: brush,
      color: color,
      context: gl
    }])
    console.log("strokes", strokeHistory)
  }

  const layerControls = layers.map((layer, i) => 
    <button key={layer.name} id={i}>{layer.name}</button>
  );

  const attachLayers = () => {
    const layerParent = document.getElementById("layers")
    layers.forEach(layer => {
      layerParent.appendChild(layer.canvas);
    })
  }
  
  return (
    <div className="workspace" id={name}>
      <div className="tools">
        <h1>minxel</h1>
        <PaletteBox colors={ palette.colors } setColor={ setColor } />
        <Brushes brushes={ brushBox.brushes } setBrush={ setBrush }/>
        <div className="toolbox" id="layer-controls" onClick={ e => setLayer(e.target.id) }>
          {layerControls}
          <button onClick={ addLayer }>add canvas</button>
          <h4>Layers</h4>
        </div>
      </div>
      <div className="layers" id="layers" style={{width: width, height: height}}
        onMouseDown={ setPosition } 
        onMouseMove={ e => draw(e, activeLayer.context) }
        onMouseUp={ e => saveStroke( points, activeBrush, activeColor, activeLayer.context ) }
      />
    </div>
  )
}

export default Workspace;