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
    return position;
  }

  const getStroke = (point1, point2) => { 
    const distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    const angle = Math.atan2( point2.x - point1.x, point2.y - point1.y );
    return [distance, angle]
  }

  const draw = ( event, context ) => {
    if ( event.buttons !== 1 ) return;
    context.imageSmoothingEnabled = false;
    context.fillStyle = activeColor;

    const lastPoint = JSON.parse(JSON.stringify(position));
    const currentPoint = setPosition(event);

    const [dist, angle] = getStroke(lastPoint, currentPoint)

    for ( let i = 0; i < dist; i += activeBrush.spacing ) {
      const x = lastPoint.x + ( Math.sin(angle) * i ) - activeBrush.size/2;
      const y = lastPoint.y + ( Math.cos(angle) * i ) - activeBrush.size/2;      
      context.beginPath();
      context.rect(x, y, activeBrush.size, activeBrush.size);
      context.fill();
    }
  }

  const addLayer = () => {
    const newCanvas = document.createElement('CANVAS')
    newCanvas.width = width;
    newCanvas.height = height;
    const newContext = newCanvas.getContext('2d')
    newContext.translate(0.5, 0.5)
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