import { useState, useEffect } from "react";
import { initShaders } from "../WebGLUtils/cuon-utils.js";
import Palette from "./Palette.jsx";
import Brushes from "./Brushes.jsx";
import Brush from "./Brush.js";
import Layers from "./Layers.jsx";
import { FSHADER_SOURCE, VSHADER_SOURCE } from "../utils/shaders.js";
import { getStroke, drawPoint, getAttributes, redraw } from "../utils/glHelpers.js";
import { rgbToGL } from "../utils/colorConvert.js";
import "./Workspace.css"

const defaultPalette = [[ 0, 0, 0 ], [ 255, 255, 255 ]]

const defaultBrushes = [ new Brush( 1, "pen" ), new Brush( 5, "pen" ), new Brush( 50, "pen" ), new Brush( 200, "pen" )]

function Workspace({ name = 'untitled', height = '256', width = '256', image }) {

  const [ newLayerNo, setNewLayerNo ] = useState(1);
  const [ layers, setLayers ] = useState([]);
  const [ colors, setColors ] = useState(defaultPalette);
  const [ brushes, setBrushes ] = useState(defaultBrushes);

  const [ activeLayer, setActiveLayer ] = useState();
  const [ activeColor, setActiveColor ] = useState( rgbToGL( colors[0] ));
  const [ activeBrush, setActiveBrush ] = useState( defaultBrushes[0] );

  const [strokeHistory, setStrokeHistory] = useState({});
  const [strokeFuture, setStrokeFuture] = useState([]);

  const points = [];
  const position = { x: 0, y: 0 }

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

    const glAttributes = getAttributes( gl )

    const lastPoint = JSON.parse(JSON.stringify( position ));
    const currentPoint = setPosition( event );
    const [ dist, angle ] = getStroke( lastPoint, currentPoint );

    console.log(event.pressure)

    for ( let i = 0; i < dist; i += 0.001 ) {
      const x = lastPoint.x + ( Math.sin( angle ) * i );
      const y = lastPoint.y + ( Math.cos( angle ) * i );

      const point = {
        position: [x, y],
        size: activeBrush.size * event.pressure,
        color: activeColor
      }

      drawPoint( gl, point.position, point.size, point.color, glAttributes )
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

    setLayers([...layers, { id: newLayerNo, name: layerName, canvas: newCanvas, context: gl }])
    setNewLayerNo( newLayerNo + 1 )
  }

  const removeLayer = () => { // todo
    // brush stroke history will get fuckin complex here oh god
  }

  const setLayer = id => setActiveLayer( layers[ Number( id )])
  const setBrush = index => setActiveBrush( brushes[ index ])
  const setColor = color => setActiveColor( rgbToGL( color ))

  const redo = strokeFuture => {
    if (strokeFuture.length < 1) return

    const newStrokeFuture = [ ...strokeFuture ]
    const stroke = newStrokeFuture.pop()
    setStrokeFuture( newStrokeFuture )
    saveStroke( strokeHistory, stroke.points, stroke.layer )

    const gl = stroke.layer.context
    const glAttributes = getAttributes( gl )

    stroke.points.forEach( point =>  drawPoint( gl, point.position, point.size, point.color, glAttributes ))
  }

  const undo = strokeHistory => {
    if (strokeHistory[activeLayer.id].strokes.length < 1 ) return

    const newStrokeHistory = { ...strokeHistory }
    const stroke = newStrokeHistory[activeLayer.id].strokes.pop()
    setStrokeHistory( newStrokeHistory )
    
    const newStrokeFuture = [...strokeFuture]
    newStrokeFuture.push({ layer: activeLayer, points: stroke })
    setStrokeFuture( newStrokeFuture )

    const gl = strokeHistory[ activeLayer.id ].context
    redraw( gl, strokeHistory[activeLayer.id].strokes )
  }

  const saveStroke = ( strokeHistory, points, layer ) => {
    if ( points.length > 0 ) {
      const newStrokeHistory = { ...strokeHistory }
      newStrokeHistory[ layer.id ] ? newStrokeHistory[ layer.id ].strokes.push( points ) : newStrokeHistory[ layer.id ] = { context: layer.context, strokes: [ points ] }
      setStrokeHistory( newStrokeHistory )
    }
  }

  const attachLayers = () => {
    const layerParent = document.getElementById("layers")
    layers.forEach(layer => { layerParent.appendChild( layer.canvas )})
  }

  const keyPress = e => { // todo
  }

  return (
    <div className="workspace" id={name}>
      <div className="tools">
        <h1>minxel</h1>
        <button onClick={ e => undo( strokeHistory ) }>undo</button>
        <button onClick={ e => redo( strokeFuture ) }>redo</button>
        <Palette colors={ colors } activeColor={ activeColor } setColors={ setColors } setColor={ setColor } />
        <Brushes brushes={ brushes } setBrushes={ setBrushes } setBrush={ setBrush }/>
        <Layers layers={ layers } setLayers={ setLayers } addLayer={ addLayer } setLayer={ setLayer } points={ points }/>
      </div>
      <div className="layers" id="layers" style={{ width: width, height: height }}
        onPointerDown={ setPosition } 
        onPointerEnter={ setPosition }
        onPointerMove={ e => draw(e, activeLayer.context) }
        onPointerUp={ e => saveStroke( strokeHistory, points, activeLayer ) }
        onPointerLeave={ e => saveStroke( strokeHistory, points, activeLayer ) }
      />
    </div>
  )
}

export default Workspace;