import BrushBox from "./BrushBox.js";
import Brush from "./Brush.js";
import Palette from "./Palette.js";
import "./Workspace.css"
import { useState, useEffect, useRef } from "react";

function Workspace({ 
  name = 'untitled', 
  height = '256', 
  width = '256', 
  brushBox = new BrushBox(), 
  palette = new Palette(), image }) {

  const brush = new Brush(5);
  const color = "blue"

  const [layers, setLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState()

  const context = useRef();
  const position = { x: 0, y: 0 }

  useEffect(() => {
    addLayer();
    console.log(layers)
    const activeLayer = document.getElementById("render")
    context.current = activeLayer.getContext('2d')
    console.log(context.current)
    context.current.fillStyle = "red"
    context.current.fillRect(0, 0, width, height)
  }, [])

  useEffect(() => {
    console.log(layers)
  }, [layers])
  
  const setPosition = e => {
    const box = e.target.getBoundingClientRect();
    position.x = e.clientX - box.left;
    position.y = e.clientY - box.top;
  }

  const draw = ( event, context ) => { // take context and event, to draw in specific layer
    if ( event.buttons !== 1 ) return;
    console.log("color", color)

    context.current.imageSmoothingEnabled = false;

    context.current.beginPath();
    context.current.lineWidth = brush.size;
    context.current.lineCap = "round"
    context.current.strokeStyle = color;

    context.current.moveTo(position.x, position.y)
    setPosition(event);
    context.current.lineTo(position.x, position.y);
    context.current.stroke();
  }

  const addLayer = () => {
    const newCanvas = new OffscreenCanvas(width, height)
    const newContext = newCanvas.getContext('2d')
    const layerName = `Layer ${layers.length + 1}`
    setLayers([...layers, {name: layerName, canvas: newCanvas, context: newContext}])
  }

  const setActive = (target) => {
    const layerId = Number(target.id)
    console.log(layerId)
    setActiveLayer(layers[layerId])
  }

  const showActiveLayer = () => {
    console.log(activeLayer)
  }

  const layersList = layers.map((layer, i) => 
    <button key={layer.name} id={i}>{layer.name}</button>
  );
  
  return (
    <div className="workspace" id={name}>
      <div className="layer-controls" onClick={ e => setActive(e.target) }>
        {layersList}
      </div>
      <div className="layers" onMouseDown={ setPosition } onMouseMove={ e => draw(e) }>
        <canvas id="render" height={ height } width={ width }/>
      </div>
      <button onClick={ addLayer }>add canvas</button>
      <button onClick={ showActiveLayer }>active layer</button>
    </div>
  )
}

export default Workspace;