import BrushBox from "./BrushBox.js";
import Brush from "./Brush.js";
import Palette from "./Palette.js";
import "./Workspace.css"
import { useState, useEffect, useRef } from "react";
import Colors from "./Colors.jsx";

function Workspace({ 
  name = 'untitled', 
  height = '256', 
  width = '256', 
  brushBox = new BrushBox(), 
  palette = new Palette(), image }) {

  const brush = new Brush(5);
  const color = "blue"

  const [layers, setLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState();
  const [activeColor, setActiveColor] = useState(palette.colors[0]);

  const onScreenContext = useRef();

  const position = { x: 0, y: 0 }

  useEffect(() => {
    addLayer();
    // console.log(layers)
    // const testLayer = document.getElementById("render")
    // onScreenContext.current = testLayer.getContext('2d')
    // console.log(onScreenContext.current)
    // onScreenContext.current.fillStyle = "red"
    // onScreenContext.current.fillRect(0, 0, width, height)
    console.log(layers)
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
  }

  const draw = ( event, context ) => { // take context and event, to draw in specific layer
    if ( event.buttons !== 1 ) return;
    // console.log("context", context)
    context.imageSmoothingEnabled = false;

    context.beginPath();
    context.lineWidth = brush.size;
    context.lineCap = "round"
    context.strokeStyle = activeColor;

    context.moveTo(position.x, position.y)
    setPosition(event);
    context.lineTo(position.x, position.y);
    context.stroke();
  }

  const addLayer = () => {
    const newCanvas = document.createElement('CANVAS')
    newCanvas.width = width;
    newCanvas.height = height;
    const newContext = newCanvas.getContext('2d')
    const layerName = `layer ${layers.length + 1}`
    setLayers([...layers, {name: layerName, canvas: newCanvas, context: newContext}])
  }

  const setLayer = id => {
    const layerId = Number(id)
    setActiveLayer(layers[layerId])
  }

  const setColor = color => {
    setActiveColor(color)
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
        <Colors colors={ palette.colors } setColor={setColor} />
        <h3>Layers</h3>
        <div className="layer-controls" onClick={ e => setLayer(e.target.id) }>
          {layerControls}
          <button onClick={ addLayer }>add canvas</button>
        </div>
      </div>
      <div className="layers" id="layers" 
        onMouseDown={ setPosition } 
        onMouseMove={ e => draw(e, activeLayer.context) }>
      </div>
    </div>
  )
}

export default Workspace;