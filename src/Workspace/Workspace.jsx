import BrushBox from "./BrushBox.js";
import Palette from "./Palette.js";
import "./Workspace.css"
import { useState, useEffect } from "react";
import PaletteBox from "./PaletteBox.jsx";
import Brushes from "./Brushes.jsx";

function Workspace({ name = 'untitled', height = '256', width = '256', brushBox = new BrushBox(), palette = new Palette(), image }) {

  const [layers, setLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState();
  const [activeColor, setActiveColor] = useState(palette.colors[0]);
  const [activeBrush, setActiveBrush] = useState(brushBox.brushes[0]);

  const position = { x: 0, y: 0 }

  const vertexShaderText = `
    precision mediump float;

    attribute vec2 vertPosition;
    attribute vec3 vertColor;
    varying vec3 fragColor;

    void main()
    {
      fragColor = vertColor;
      gl_Position = vec4(vertPosition, 0.0, 1.0);
    }
    `

  const fragmentShaderText = `
    precision mediump float;
    varying vec3 fragColor;
    
    void main()
    {
      gl_FragColor = vec4(fragColor, 1.0);
    }
    `
  const triangleVertices = 
    [ // X, Y,       R, G, B
      0.0, 0.5,    1.0, 1.0, 0.0,
      -0.5, -0.5,  0.7, 0.0, 1.0,
      0.5, -0.5,   0.1, 1.0, 0.6
    ];

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
    const box = e.target.getBoundingClientRect();
    position.x = e.clientX - box.left;
    position.y = e.clientY - box.top;
    return position;
  }

  const getStroke = (point1, point2) => { 
    const distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    const angle = Math.atan2( point2.x - point1.x, point2.y - point1.y );
    return [distance, angle]
  }

  const draw = ( event, context ) => {
    if ( event.buttons !== 1 ) return;

    const lastPoint = JSON.parse(JSON.stringify(position));
    const currentPoint = setPosition(event);
    const [dist, angle] = getStroke(lastPoint, currentPoint)

    context.drawArrays(context.TRIANGLES, 0, 3);

    for ( let i = 0; i < dist; i += activeBrush.spacing ) {
      const x = lastPoint.x + ( Math.sin(angle) * i ) - activeBrush.size/2;
      const y = lastPoint.y + ( Math.cos(angle) * i ) - activeBrush.size/2;      
    }
  }

  const addLayer = () => {
    const newCanvas = document.createElement('CANVAS')
    newCanvas.width = width;
    newCanvas.height = height;
    const gl = newCanvas.getContext('webgl')
    if (!gl) alert('Your browser does not support WebGL. Try using another browser, such as the most recent version of Mozilla Firefox')

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('ERROR linking program!', gl.getProgramInfoLog(program));
      return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      console.error('ERROR validating program!', gl.getProgramInfoLog(program));
      return;
    }

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
      positionAttribLocation, // Attribute location
      2, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
      colorAttribLocation, // Attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.useProgram(program);

    const layerName = `layer ${layers.length + 1}`
    setLayers([...layers, {name: layerName, canvas: newCanvas, context: gl}])
  }

  const setLayer = id => {
    const layerId = Number(id)
    setActiveLayer(layers[layerId])
  }
  const setColor = color => {
    setActiveColor(color)
  }
  const setBrush = idx => {
    console.log("brush", idx)
    setActiveBrush(brushBox.brushes[idx])
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
        <PaletteBox colors={ palette.colors } setColor={setColor} />
        <Brushes brushes={ brushBox.brushes } setBrush={setBrush}/>
        <div className="toolbox" id="layer-controls" onClick={ e => setLayer(e.target.id) }>
          {layerControls}
          <button onClick={ addLayer }>add canvas</button>
          <h4>Layers</h4>
        </div>
      </div>
      <div className="layers" id="layers" style={{width: width, height: height}}
        onMouseDown={ setPosition } 
        onMouseMove={ e => draw(e, activeLayer.context) }>
      </div>
    </div>
  )
}

export default Workspace;