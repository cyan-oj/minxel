import { useState, useEffect, useRef, useReducer } from 'react'
import { getStroke, drawPoint, getAttributes, redraw, createLayer } from '../utils/glHelpers.js'
import { rgbToGL } from '../utils/colorConvert.js'
import Palette from './Palette.jsx'
import Brushes from './Brushes.jsx'
import Layers from './Layers.jsx'
import ToolButton from './ToolButton.jsx'
import './Workspace.css'
import { ReactComponent as UndoIcon } from '../assets/icons/sharp-icons/arrow-undo-sharp.svg'
import { ReactComponent as RedoIcon } from '../assets/icons/sharp-icons/arrow-redo-sharp.svg'
import { ReactComponent as DownloadIcon } from '../assets/icons/sharp-icons/download-sharp.svg'

import { ReactComponent as ZoomInIcon } from '../assets/icons/outline-icons/expand-outline.svg'
import { ReactComponent as ZoomOutIcon } from '../assets/icons/outline-icons/contract-outline.svg'
import { ReactComponent as PanIcon } from '../assets/icons/outline-icons/move-outline.svg'

import { ReactComponent as SettingsIcon } from '../assets/icons/sharp-icons/settings-sharp.svg'
import { ReactComponent as PenIcon } from '../assets/icons/outline-icons/pencil-outline.svg'

const defaultPalette = [
  [ 0, 0, 0 ],
  [ 255, 255, 255 ],
]

const defaultBrushes = [ 
  { name: "pen", type: "point", size: 3, spacing: 0.002 }, 
  { name: "pen", type: "point", size: 30, spacing: 0.002 }, 
  { name: "pen", type: "point", size: 100, spacing: 0.002 }
]

const init = ( props ) => {
  const initialState = {
    colors: defaultPalette,
    brushes: defaultBrushes,
    layers: [],
    width: props.width || 256,
    height: props.height || 256,
    newLayerNo: 1,
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
  const firstLayer = createLayer( props.width, props.height, 0 )
  initialState.layers.push( firstLayer )
  return initialState
}

const workSpaceReducer = ( state, action ) => {
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
    case "addColor":
      return { ...state, colors: [ ...state.colors, payload ], activeColor: state.colors.length}
    case "layers":
      return { ...state, layers: [ ...payload ]}
    case "addLayer": 
      const newLayer = createLayer( state.width, state.height, state.newLayerNo )
      return { 
        ...state, 
        layers: [...state.layers, newLayer], 
        activeLayer: state.layers.length,
        newLayerNo: state.newLayerNo + 1
      }
    case "deleteLayer":
      const newLayers = [...state.layers]
      const newStrokeHistory = { ...state.strokeHistory }
      const [ removed ] = newLayers.splice( payload, 1 )
      delete newStrokeHistory[removed.id]
      return { ...state, layers: [ ...newLayers], activeLayer: 0, strokeHistory: newStrokeHistory }
    case "replaceColor":
      const colors = [...state.colors]
      colors[payload.index] = payload.color
      return {...state, colors: colors}
    case "activeLayer":
      return { ...state, activeLayer: payload }
    default: return { ...state, [type]: payload }
  }
}

function Workspace( props ) {
  const [ state, dispatch ] = useReducer( workSpaceReducer, props, init)
  const { 
    colors, brushes, layers,
    width, height,
    panning, pressure, canvasScale, canvasPosition, 
    activeColor, activeBrush, activeLayer, 
    toolButtons, 
    strokeHistory, redoCache 
  } = state

  const [ showTools, setShowTools ] = useState( false );

  const clientPosition = useRef({ x: 0, y: 0 })
  const stroke = { color: activeColor, points: [] }
  const position = { x: 0, y: 0, pressure: 0 }
  
  useEffect(() => {
    dispatch({
      type: "canvasPosition",
      payload: {
        left: `${( window.innerWidth - width )/ 2 }px`,
        top: `${( window.innerHeight - height ) /2 }px`,
      }
    })
    const keys = ( event ) => {
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
  }, [])

  useEffect(() => {
    const layerParent = document.getElementById( 'layers' )
    layerParent.textContent = ""
    layers.forEach(( layer ) => {
      layerParent.appendChild( layer.canvas )
    })
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

  const redo = ( redoCache ) => {
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
    const newRedoCache = [ ...redoCache ]
    const stroke = newStrokeHistory[ layers[activeLayer].id ].strokes.pop()
    newRedoCache.push({ layer: layers[activeLayer], stroke: stroke })
    dispatch({ type: "strokeHistory", payload: newStrokeHistory })
    dispatch({ type: "redoCache", payload: newRedoCache })

    const gl = strokeHistory[layers[activeLayer].id].context
    redraw( gl, colors, strokeHistory[layers[activeLayer].id].strokes )
  }

  const saveStroke = ( strokeHistory, stroke, layer ) => {
    if ( stroke.points.length > 0 ) {
      const newStrokeHistory = { ...strokeHistory }
      newStrokeHistory[ layer.id] 
        ? newStrokeHistory[ layer.id ].strokes.push( stroke ) 
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

    <div className="workspace" onPointerMove={ panning ? pan : null } onPointerDown={ panning ? setClientPosition : null }>
      <div className='tools-right'> 
        <Brushes brushes={ brushes } activeBrush={ activeBrush } dispatch={ dispatch } />
        <Layers dispatch={ dispatch } layers={ layers } activeLayer={ activeLayer } stroke={ stroke }/>
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
              <SettingsIcon  className="unpin"/> settings  
            </button>
            <button onClick={ saveFile }>
              download image  <DownloadIcon  className="icon"/>
            </button>
          </div>
          <div className='tool-toggles' style={{ flexDirection: showTools ? "column" : "row" }}>
            <ToolButton buttonText={ "undo" } Icon={ UndoIcon } 
              clickFunction={ e => undo( strokeHistory ) } 
              shortcutText={ "ctrl + Z" }
              showTools={ showTools }/>
            <ToolButton buttonText={ "redo" } Icon={ RedoIcon } 
              clickFunction={ e => redo( redoCache ) } 
              shortcutText={ "ctrl + Shift + Z" }
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

export default Workspace
