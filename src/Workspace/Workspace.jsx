import { useState, useEffect } from "react";
import { initShaders } from "../WebGLUtils/cuon-utils.js";
import PaletteBox, { rgbToGL } from "./PaletteBox.jsx";
import BrushBox from "./BrushBox.js";
import Palette from "./Palette.js";
import Brushes from "./Brushes.jsx";
import "./Workspace.css"
import { FSHADER_SOURCE, VSHADER_SOURCE } from "../utils/shaders.js";
import { getStroke } from "../utils/glHelpers.js";
import LayerPreview from "./LayerPreview.jsx";
import { useRef } from "react";

function Workspace({ name = 'untitled', height = '256', width = '256', brushBox = new BrushBox(), palette = new Palette(), image }) {

  const [ layers, setLayers ] = useState([]);
  const [ activeLayer, setActiveLayer ] = useState();
  const [ activeColor, setActiveColor ] = useState(rgbToGL( palette.colors[0] ));
  const [ activeBrush, setActiveBrush ] = useState( brushBox.brushes[0] );

  const [strokeHistory, setStrokeHistory] = useState([]);

  const points = [];
  const position = { x: 0, y: 0 }

  const dragLayer = useRef();

  const dragStart = ( index ) => {
    console.log("start drag", index)
    dragLayer.current = index
  }

  const dragEnter = ( index ) => {
    console.log("drag enter", index )
    const currentLayer = dragLayer.current;
    setLayers( oldLayers => {
      const newLayers = [...oldLayers]
      const dropLayer = newLayers.splice( currentLayer, 1 )[0]
      newLayers.splice( index, 0, dropLayer )
      dragLayer.current = index
      return newLayers
    })
  }

  useEffect(() => {
    addLayer();
  }, [])

  useEffect(() => {
    attachLayers();
    setLayer("0")
  }, [layers])
  
  const setPosition = e => {
    const rect = e.target.getBoundingClientRect();
    position.x = (( e.clientX - rect.left ) - width/2 )/( width/2 );
    position.y = ( height/2 - ( e.clientY - rect.top) )/( height/2 );
    return position;
  }

  const draw = ( event, gl ) => {
    if ( event.buttons !== 1 ) {
      setPosition( event );
      return;
    }

    const a_Position = gl.getAttribLocation( gl.program, 'a_Position' );
    const a_PointSize = gl.getAttribLocation( gl.program, 'a_PointSize' );
    const u_FragColor = gl.getUniformLocation( gl.program, 'u_FragColor' );

    const lastPoint = JSON.parse(JSON.stringify( position ));
    const currentPoint = setPosition( event );
    const [ dist, angle ] = getStroke( lastPoint, currentPoint )

    const drawPoint = ( gl, position, size, color ) => {
      gl.vertexAttrib3f( a_Position, position[0], position[1], 0.0 );
      gl.vertexAttrib1f( a_PointSize, size );
      gl.uniform4f( u_FragColor, color[0], color[1], color[2], color[3] )
      gl.drawArrays( gl.points, 0, 1 )
    }

    console.log(event.pressure)

    for ( let i = 0; i < dist; i += 0.001 ) {
      const x = lastPoint.x + ( Math.sin( angle ) * i );
      const y = lastPoint.y + ( Math.cos( angle ) * i );

      const point = {
        position: [x, y],
        size: activeBrush.size * event.pressure,
        color: activeColor
      }

      drawPoint( gl, point.position, point.size, point.color )
      points.push( point )
    }
  }

  const addLayer = () => {
    const layerName = `layer ${layers.length + 1}`
    const newCanvas = document.createElement('CANVAS')
    newCanvas.width = width;
    newCanvas.height = height;
    const gl = newCanvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: true })

    if (!gl) alert('Your browser does not support WebGL. Try using another browser, such as the most recent version of Mozilla Firefox')
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) console.error('failed to initialize shaders')

    setLayers([...layers, { name: layerName, canvas: newCanvas, context: gl }])
  }

  const removeLayer = () => { // todo
    // brush stroke history will get fuckin complex here oh god
  }

  const setLayer = id => {
    const layerId = Number(id)
    setActiveLayer(layers[layerId])
    console.log(id)
  }
  const setBrush = idx => {
    setActiveBrush(brushBox.brushes[idx]);
  }
  const setColor = color => {
    setActiveColor(rgbToGL(color))
  }

  const saveStroke = ( points, gl ) => {
    if (points.length > 0) {
      setStrokeHistory([...strokeHistory, {
        points: points,
        context: gl
      }])
    }
  }

  const layerControls = layers.map((layer, i) => 
    <div
      key={layer.name}
      draggable
      onDragStart={ e => dragStart( i )}
      onDragEnter={ e => dragEnter( i )}
    >
      <LayerPreview id={i} layer={layer} points={ points } />
    </div>
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
        <div className="toolbox" id="layer-controls" 
          onMouseUp={ e => setLayer( e.target.id ) }
        >
          { layerControls }
          <button onClick={ addLayer }>add canvas</button>
          <h4>Layers</h4>
        </div>
      </div>
      <div className="layers" id="layers" style={{ width: width, height: height }}
        onPointerDown={ setPosition } 
        onPointerEnter={ setPosition }
        onPointerMove={ e => draw(e, activeLayer.context) }
        onPointerUp={ e => saveStroke( points, activeBrush, activeColor, activeLayer.context ) }
        onPointerLeave={ e => saveStroke( points, activeBrush, activeColor, activeLayer.context ) }
      />
    </div>
  )
}

export default Workspace;