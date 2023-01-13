import BrushBox from "./BrushBox.js";
import Brush from "./Brush.js";
import Palette from "./Palette.js";
import "./Workspace.css"
import { useState, useEffect } from "react";
import PaletteBox from "./PaletteBox.jsx";
import Brushes from "./Brushes.jsx";

function Workspace({ 
  name = 'untitled', 
  height = '256', 
  width = '256', 
  brushBox = new BrushBox(), 
  palette = new Palette(), image }) {

  const [layers, setLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState();
  const [activeColor, setActiveColor] = useState(palette.colors[0]);
  const [activeBrush, setActiveBrush] = useState(brushBox.brushes[0]);

  const position = { x: 0, y: 0 }

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
  }

  const draw = ( event, context ) => {
    if ( event.buttons !== 1 ) return;
    context.imageSmoothingEnabled = false;

    context.beginPath();
    context.lineWidth = activeBrush.size;
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