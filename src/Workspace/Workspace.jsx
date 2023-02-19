import { useState, useEffect, useRef, useReducer } from 'react'
import { initShaders } from '../WebGLUtils/cuon-utils.js'
import Palette from './Palette.jsx'
import Brushes from './Brushes.jsx'
import Layers from './Layers.jsx'
import { FSHADER_SOURCE, VSHADER_SOURCE } from '../utils/shaders.js'
import { getStroke, drawPoint, getAttributes, redraw } from '../utils/glHelpers.js'
import { rgbToGL } from '../utils/colorConvert.js'
import './Workspace.css'
import { ReactComponent as UndoIcon } from '../assets/icons/outline-icons/arrow-undo-outline.svg'
import { ReactComponent as RedoIcon } from '../assets/icons/outline-icons/arrow-redo-outline.svg'
import { ReactComponent as DownloadIcon } from '../assets/icons/outline-icons/download-outline.svg'
import { ReactComponent as ZoomInIcon } from '../assets/icons/outline-icons/expand-outline.svg'
import { ReactComponent as ZoomOutIcon } from '../assets/icons/outline-icons/contract-outline.svg'
import { ReactComponent as PanIcon } from '../assets/icons/outline-icons/move-outline.svg'
import { ReactComponent as SettingsIcon } from '../assets/icons/outline-icons/settings-outline.svg'
import { ReactComponent as PenIcon } from '../assets/icons/outline-icons/pencil-outline.svg'
import ToolButton from './ToolButton.jsx'

const defaultPalette = [
  [ 0, 0, 0 ],
  [ 255, 255, 255 ],
]

const defaultBrushes = [ 
  { name: "pen", type: "point", size: 3, spacing: 0.002 }, 
  { name: "pen", type: "point", size: 30, spacing: 0.002 }, 
  { name: "pen", type: "point", size: 100, spacing: 0.002 }
]

const defaultState = {
  colors: defaultPalette,
  panning: false,
  pressure: false,
  canvasScale: '1.0',
  canvasPosition: { left: '0px', top: '0px' },
  activeColor: 0,
  activeBrush: 0,
  activeLayer: 0,
  toolButtons: [
    { buttonText: "zoom in", action: "zoomIn", svg: ZoomInIcon, active: false },
    { buttonText: "zoom out", action: "zoomOut", svg: ZoomOutIcon, active: false },
    { buttonText: "pan canvas", action: "togglePanning", svg: PanIcon, active: "panning" },
    { buttonText: "pen pressure", action: "togglePressure", svg: PenIcon, active: "pressure" }
  ],
  strokeHistory: {},
  redoCache: []
}

const reducer = ( state, action ) => {
  const { type, payload } = action
  switch ( type ) {
    case "zoomIn": 
      return { ...state, canvasScale: (Number(state.canvasScale) * 1.25).toFixed(6).toString()}
    case "zoomOut": 
      return { ...state, canvasScale: (Number(state.canvasScale) / 1.25).toFixed(6).toString()}
    case "togglePanning": 
      return { ...state, panning: !state.panning }
    case "togglePressure": 
      return { ...state, pressure: !state.pressure }
    case "addColor": {
      for ( const swatch of state.colors ) {
        if( swatch === payload ) {
          console.error('color already in palette')
          return { ...state };
        } 
      }
      return { ...state, colors: [...state.colors, payload]}
    }
    case "replaceColor": {
      const colors = [...state.colors]
      colors[payload.index] = payload.color
      return {...state, colors: colors}
    }
    default: return { ...state, [type]: payload }
  }
}

function Workspace({ name = 'untitled', height = '256', width = '256', image }) {
  
  const [ state, dispatch ] = useReducer( reducer, { ...defaultState })
  const { colors, panning, pressure, canvasScale, canvasPosition, activeColor, activeBrush, activeLayer, toolButtons, strokeHistory, redoCache } = state

  const [ newLayerNo, setNewLayerNo] = useState( 1 )
  const [ layers, setLayers ] = useState([])
  const [ brushes, setBrushes ] = useState( defaultBrushes )

  const [ showTools, setShowTools ] = useState( false );

  const clientPosition = useRef({ x: 0, y: 0 })
  
  const stroke = { color: activeColor, points: [] }
  const position = { x: 0, y: 0, pressure: 0 }
  
  useEffect(() => {
      addLayer()
      dispatch({
        type: "canvasPosition",
        payload: {
          left: `${( window.innerWidth - width )/ 2 }px`,
          top: `${( window.innerHeight - height ) /2 }px`,
        }
      })
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
        const redo = document.getElementById( 'redo' )
        redo.click()
      } else if (( event.metaKey || event.ctrlKey ) && event.code === 'KeyZ' ) {
        const undo = document.getElementById( 'undo' )
        undo.click()
      }
    }
    document.addEventListener( 'keydown', keys )
    return () => {
      document.removeEventListener( 'keydown', keys )
    }
  }, [layers])

  const setClientPosition = evt => {
    clientPosition.current.x =  evt.clientX,
    clientPosition.current.y =  evt.clientY
    return clientPosition.current 
  }

  const setPosition = ( evt ) => {
    const rect = evt.target.getBoundingClientRect()
    const scale = Number(canvasScale)
    position.x = ( evt.clientX - rect.left - width * scale / 2 ) / ( width * scale / 2 )
    position.y = ( height * scale / 2 - ( evt.clientY - rect.top )) / ( height * scale / 2 )
    if ( pressure ) {
      evt.pressure === 0.5 ? ( position.pressure = 0.001 ) : ( position.pressure = evt.pressure )
    } else {
      position.pressure = 1
    }
    return position
  }

  const draw = ( evt, gl ) => {
    if ( evt.buttons !== 1 ) {
      setPosition( evt )
      return
    }
    const glAttributes = getAttributes( gl )
    const lastPoint = JSON.parse(JSON.stringify( position ))
    const currentPoint = setPosition( evt )
    const [ dist, angle, deltaP ] = getStroke( lastPoint, currentPoint )
    stroke.color = activeColor
    const drawColor = rgbToGL( colors[ stroke.color ])
    for ( let i = 0; i < dist; i += brushes[activeBrush].spacing ) {
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
    dispatch({ type: "activeLayer", payload: 0 })
  }

  const removeLayer = () => {
      // todo
      // cannot be undone
      // when removing layer, add layer to action history when action history is implemented?
  }

  const redo = ( redoCache ) => {
    console.log( strokeHistory, redoCache )
    if ( redoCache.length < 1 ) return

    const newRedoCache = [...redoCache ]
    const nextStroke = newRedoCache.pop()
    dispatch({ type: "redoCache", payload: newRedoCache })
    saveStroke( strokeHistory, nextStroke.stroke, nextStroke.layer )

    const gl = nextStroke.layer.context
    const glAttributes = getAttributes( gl )
    const drawColor = rgbToGL( colors[ nextStroke.stroke.color ])
    nextStroke.stroke.points.forEach(( point ) => {
      drawPoint( gl, point.position, point.size, drawColor, glAttributes )
    })
  }

  const undo = ( strokeHistory ) => {
    if ( !strokeHistory[ layers[activeLayer].id ] || strokeHistory[ layers[activeLayer].id ].strokes.length < 1 ) return
    
    const newStrokeHistory = { ...strokeHistory }
    const newRedoCache = [...redoCache ]
    const stroke = newStrokeHistory[ layers[activeLayer].id ].strokes.pop()
    newRedoCache.push({ layer: layers[activeLayer], stroke: stroke })
    dispatch({ type: "strokeHistory", payload: newStrokeHistory })
    dispatch({ type: "redoCache", payload: newRedoCache })

    const gl = strokeHistory[ layers[activeLayer].id ].context
    redraw( gl, colors, strokeHistory[ layers[activeLayer].id ].strokes )
  }

  const saveStroke = ( strokeHistory, stroke, layer ) => {
    if ( stroke.points.length > 0 ) {
      const newStrokeHistory = { ...strokeHistory }
      newStrokeHistory[ layer.id] 
        ? newStrokeHistory[ layer.id ].strokes.push(stroke) 
        : newStrokeHistory[ layer.id ] = { context: layer.context, strokes: [ stroke ] }
        dispatch({ type: "strokeHistory", payload: newStrokeHistory })
    }
  }

  const saveFile = () => {
    const exportCanvas = document.getElementById( 'export-canvas' )
    const exportContext = exportCanvas.getContext( '2d' )
    layers.forEach(( layer ) => exportContext.drawImage( layer.canvas, 0, 0 ))
    const saveLink = document.getElementById( 'save-link' )
    saveLink.setAttribute( 'download', 'minxel.png' )
    saveLink.setAttribute( 'href', exportCanvas.toDataURL( 'image/png' ).replace( 'image/png', 'image/octet-stream' ))
    saveLink.click()
  }

  const pan = evt => {
    if ( evt.buttons !== 1 ) { 
      setClientPosition(evt);
      return
    }
    const pastPos = JSON.parse(JSON.stringify(clientPosition.current))
    const nextPos = setClientPosition(evt);
    const newCanvasPos = { 
      left: Number(canvasPosition.left.slice(0, canvasPosition.left.length - 2)),
      top: Number(canvasPosition.top.slice(0, canvasPosition.top.length - 2))
    }
    newCanvasPos.left = `${newCanvasPos.left + nextPos.x - pastPos.x}px`
    newCanvasPos.top = `${newCanvasPos.top + nextPos.y - pastPos.y}px`
    dispatch({ type: "canvasPosition", payload: newCanvasPos })
  }

  const toolBar = toolButtons.map(( button, i ) =>
    <ToolButton key={button.buttonText} buttonText={ button.buttonText } Icon={ button.svg } action={ button.action } 
      dispatch={ dispatch } showTools={ showTools } state={ state[button.active] }/>
  )

  return (
    <div className="workspace" id={ name } onPointerMove={ panning ? pan : null } onPointerDown={ panning ? setClientPosition : null }>
      <div className='tools-right'> 
        <Brushes brushes={ brushes } activeBrush={ activeBrush } dispatch={ dispatch } setBrushes={ setBrushes } />
        <Layers dispatch={ dispatch } layers={ layers } setLayers={ setLayers } addLayer={ addLayer } activeLayer={ activeLayer } stroke={ stroke }/>
      </div>
      <div className="layers" id="layers" 
        style={{ width: width, height: height, 
          scale: canvasScale, 
          left: canvasPosition.left, 
          top: canvasPosition.top, 
          cursor: panning ? "grab" : null }}
        onPointerDown={ setPosition }
        onPointerEnter={ setPosition }
        onPointerMove={ panning ? null : e => draw( e, layers[activeLayer].context )}
        onPointerUp={ e => saveStroke( strokeHistory, stroke, layers[activeLayer] )}
        onPointerLeave={ e => saveStroke( strokeHistory, stroke, layers[activeLayer] )}
      />
      <div id="app-info">
      </div>
      <div className="tools">
        <h1>minxel.</h1>
        <div className='toolbox'>
          <div className='toolbar'>
            <button onClick={ e => setShowTools( !showTools ) }>
              <SettingsIcon  className="icon"/> settings  
            </button>
            <button onClick={ saveFile }>
              download image  <DownloadIcon  className="icon"/>
            </button>
          </div>
          <div className='tool-toggles'>
            <ToolButton buttonText={ "undo" } Icon={ UndoIcon } 
              clickFunction={ e => undo( strokeHistory ) } 
              showTools={ showTools }/>
            <ToolButton buttonText={ "redo" } Icon={ RedoIcon } 
              clickFunction={ e => redo( redoCache ) } 
              showTools={ showTools }/>
            { toolBar }
          </div>
        </div>
        <Palette colors={ colors } activeColor={ activeColor } dispatch={ dispatch } strokeHistory={ strokeHistory } />
      </div>
      <a id={ 'save-link' } href="#" style={{ display: 'none' }} />
      <canvas id={ 'export-canvas' } style={{ display: 'none' }} width={ width } height={ height } />
    </div>
  )
}

export default Workspace;
