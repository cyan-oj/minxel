import { useState, useEffect } from 'react'
import { initShaders } from '../WebGLUtils/cuon-utils.js'
import Palette from './Palette.jsx'
import Brushes from './Brushes.jsx'
import Brush from './Brush.js'
import Layers from './Layers.jsx'
import { FSHADER_SOURCE, VSHADER_SOURCE } from '../utils/shaders.js'
import { getStroke, drawPoint, getAttributes, redraw } from '../utils/glHelpers.js'
import { rgbToGL } from '../utils/colorConvert.js'
import './Workspace.css'
import { ReactComponent as UndoIcon } from '../assets/icons/sharp-icons/arrow-undo-circle-sharp.svg'
import { ReactComponent as RedoIcon } from '../assets/icons/sharp-icons/arrow-redo-circle-sharp.svg'

const defaultPalette = [
  [ 0, 0, 0 ],
  [ 255, 255, 255 ],
]

const defaultBrushes = [ new Brush( 100, 'pen' ), new Brush( 5, 'pen' ), new Brush( 50, 'pen' )]

function Workspace({ name = 'untitled', height = '256', width = '256', image }) {
  const [ newLayerNo, setNewLayerNo] = useState( 1 )
  const [ layers, setLayers ] = useState([])
  const [ colors, setColors ] = useState( defaultPalette )
  const [ brushes, setBrushes ] = useState( defaultBrushes )
  const [ pressure, togglePressure ] = useState( true )

  const [ activeLayer, setActiveLayer ] = useState({})
  const [ activeColor, setActiveColor ] = useState( 0 )
  const [ activeBrush, setActiveBrush ] = useState( 0 )

  const [ strokeHistory, setStrokeHistory ] = useState({})
  const [ strokeFuture, setStrokeFuture ] = useState([])

  const stroke = { color: activeColor, points: [] }
  const position = { x: 0, y: 0, pressure: 0 }

  useEffect(() => {
      addLayer()
  }, [])

  useEffect(() => {
    // attach layers and set new layer as active
    const layerParent = document.getElementById( 'layers' )
    layers.forEach(( layer ) => {
      layerParent.appendChild( layer.canvas )
    })
    const keys = ( event ) => {
      //set keyboard shortcuts
      if (( event.metaKey || event.ctrlKey ) && event.shiftKey && event.code === 'KeyZ' ) {
        const redo = document.getElementById( 'redo-button' )
        redo.click()
      } else if (( event.metaKey || event.ctrlKey ) && event.code === 'KeyZ' ) {
        const undo = document.getElementById( 'undo-button' )
        undo.click()
      }
    }
    document.addEventListener( 'keydown', keys )
    return () => {
      document.removeEventListener( 'keydown', keys )
    }
  }, [layers])

  const setPosition = ( e ) => {
    const rect = e.target.getBoundingClientRect()
    position.x = ( e.clientX - rect.left - width / 2 ) / ( width / 2 )
    position.y = ( height / 2 - ( e.clientY - rect.top )) / ( height / 2 )
    if ( pressure ) {
      e.pressure === 0.5 ? ( position.pressure = 0.001 ) : ( position.pressure = e.pressure )
    } else {
      position.pressure = 1
    }
    return position
  }

  const draw = ( event, gl ) => {
    if ( event.buttons !== 1 ) {
      setPosition( event )
      return
    }
    const glAttributes = getAttributes( gl )
    const lastPoint = JSON.parse(JSON.stringify( position ))
    const currentPoint = setPosition( event )
    const [ dist, angle, deltaP ] = getStroke( lastPoint, currentPoint )
    stroke.color = activeColor
    const drawColor = rgbToGL( colors[ stroke.color ])
    for ( let i = 0; i < dist; i += 0.001 ) {
      const x = lastPoint.x + Math.sin( angle ) * i
      const y = lastPoint.y + Math.cos( angle ) * i
      const pressure = lastPoint.pressure + deltaP / (dist / i)
      const point = {
        position: [ x, y ],
        size: brushes[activeBrush].size * pressure
      }
      drawPoint( gl, point.position, point.size, drawColor, glAttributes )
      stroke.points.push( point )
    }
  }

  const addLayer = () => {
    const layerName = `layer ${layers.length + 1}`
    const newCanvas = document.createElement( 'CANVAS' )
    newCanvas.width = width
    newCanvas.height = height
    const gl = newCanvas.getContext( 'webgl', { antialias: false, preserveDrawingBuffer: true })

    if ( !gl ) alert( 'Your browser does not support WebGL. Try using another browser, such as the most recent version of Mozilla Firefox' )
    if ( !initShaders( gl, VSHADER_SOURCE, FSHADER_SOURCE )) console.error( 'failed to initialize shaders' )

    const newLayer = { id: newLayerNo, name: layerName, canvas: newCanvas, context: gl }

    setLayers([...layers, newLayer])
    setNewLayerNo( newLayerNo + 1 )
    setActiveLayer(newLayer)
  }

  const removeLayer = () => {
      // todo
      // cannot be undone
      // when removing layer, add layer to action history when action history is implemented?
  }

  const setLayer = ( id ) => setActiveLayer( layers[Number( id )])
  const setBrush = ( index ) => setActiveBrush( Number( index ))
  const setColor = ( index ) => setActiveColor( Number( index ))

  const redo = ( strokeFuture ) => {
    console.log( strokeHistory, strokeFuture )
    if ( strokeFuture.length < 1 ) return

    const newStrokeFuture = [...strokeFuture ]
    const nextStroke = newStrokeFuture.pop()
    setStrokeFuture( newStrokeFuture )
    saveStroke( strokeHistory, nextStroke.stroke, nextStroke.layer )

    const gl = nextStroke.layer.context
    const glAttributes = getAttributes( gl )
    const drawColor = rgbToGL( colors[ nextStroke.stroke.color ])
    nextStroke.stroke.points.forEach(( point ) => {
      drawPoint( gl, point.position, point.size, drawColor, glAttributes )
    })
  }

  const undo = ( strokeHistory ) => {
    if ( !strokeHistory[ activeLayer.id ] || strokeHistory[ activeLayer.id ].strokes.length < 1 ) return
    
    const newStrokeHistory = { ...strokeHistory }
    const newStrokeFuture = [...strokeFuture ]
    const stroke = newStrokeHistory[ activeLayer.id ].strokes.pop()
    newStrokeFuture.push({ layer: activeLayer, stroke: stroke })
    setStrokeHistory( newStrokeHistory )
    setStrokeFuture( newStrokeFuture )

    const gl = strokeHistory[ activeLayer.id ].context
    redraw( gl, colors, strokeHistory[ activeLayer.id ].strokes )
  }

  const saveStroke = ( strokeHistory, stroke, layer ) => {
    console.log( 'saveStroke', strokeHistory )
    if ( stroke.points.length > 0 ) {
      const newStrokeHistory = { ...strokeHistory }
      newStrokeHistory[ layer.id] 
        ? newStrokeHistory[ layer.id ].strokes.push(stroke) 
        : newStrokeHistory[ layer.id ] = { context: layer.context, strokes: [ stroke ] }
      setStrokeHistory( newStrokeHistory )
    }
  }

  function saveFile() {
    const exportCanvas = document.getElementById( 'export-canvas' )
    const exportContext = exportCanvas.getContext( '2d' )
    layers.forEach(( layer ) => exportContext.drawImage( layer.canvas, 0, 0 ))
    const saveLink = document.getElementById( 'save-link' )
    saveLink.setAttribute( 'download', 'minxel.png' )
    saveLink.setAttribute( 'href', exportCanvas.toDataURL( 'image/png' ).replace( 'image/png', 'image/octet-stream' ))
    saveLink.click()
  }

  return (
    <div className="workspace" id={ name }>
      <div className="layers" id="layers" style={{ width: width, height: height }}
        onPointerDown={ setPosition }
        onPointerEnter={ setPosition }
        onPointerMove={ e => draw( e, activeLayer.context )}
        onPointerUp={ e => saveStroke( strokeHistory, stroke, activeLayer )}
        onPointerLeave={ e => saveStroke( strokeHistory, stroke, activeLayer )}
      />
      <div id="app-info">
        <h1>minxel</h1>
      </div>
      <div className="tools">
        <UndoIcon id="undo-button" className="icon" width="32" height="32" 
          onClick={ e => undo( strokeHistory )} />
        <RedoIcon className="icon" width="32" height="32" id="redo-button" 
          onClick={ e => redo( strokeFuture )} />
        <button id="pressure-button" onClick={ e => togglePressure( !pressure )}>
          {`pen pressure: ${ pressure ? "on" : "off" }`}</button>
        <button onClick={ saveFile }>
          save file</button>
        <Palette colors={ colors } activeColor={ activeColor } setColors={ setColors } setColor={ setColor } strokeHistory={ strokeHistory } setStrokeHistory={ setStrokeHistory }/>
        <Brushes brushes={ brushes } activeBrush={ activeBrush } setBrushes={ setBrushes } setBrush={ setBrush }/>
        <Layers layers={ layers } setLayers={ setLayers } addLayer={ addLayer } setLayer={ setLayer } activeLayer={ activeLayer } setActiveLayer={ setActiveLayer } stroke={ stroke }/>
      </div>
      <a id={ 'save-link' } href="#" style={{ display: 'none' }} />
      <canvas id={ 'export-canvas' } style={{ display: 'none' }} width={ width } height={ height } />
    </div>
  )
}

export default Workspace;
