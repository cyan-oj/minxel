import { useState, useEffect, useRef, useReducer } from 'react'
import { getStroke, drawPoint, drawStroke, getAttributes, createLayer } from '../../utils/glHelpers.js'
import { rgbToGL } from '../../utils/colorConvert.js'
import { workSpaceReducer } from './WorkspaceReducer.js'
import Palette from '../Palette.jsx'
import Brushes from '../Brushes/Brushes.jsx'
import Layers from '../Layers/Layers.jsx'
import ToolButton from './ToolButton.jsx'
import './Workspace.css'
import { ReactComponent as UndoIcon } from '../../assets/icons/sharp-icons/arrow-undo-sharp.svg'
import { ReactComponent as RedoIcon } from '../../assets/icons/sharp-icons/arrow-redo-sharp.svg'
import { ReactComponent as DownloadIcon } from '../../assets/icons/sharp-icons/download-sharp.svg'
import { ReactComponent as ZoomInIcon } from '../../assets/icons/outline-icons/expand-outline.svg'
import { ReactComponent as ZoomOutIcon } from '../../assets/icons/outline-icons/contract-outline.svg'
import { ReactComponent as PanIcon } from '../../assets/icons/outline-icons/move-outline.svg'
import { ReactComponent as SettingsIcon } from '../../assets/icons/sharp-icons/settings-sharp.svg'
import { ReactComponent as PenIcon } from '../../assets/icons/outline-icons/pencil-outline.svg'
import LayerDisplay from '../Layers/LayerDisplay.jsx'

const DEFAULT_PALETTE = [
  [ 0, 0, 0 ],
  [ 255, 255, 255 ],
]

const DEFAULT_BRUSHES = [ 
  { name: "pen", type: "point", size: 2, spacing: 0.002 }, 
  { name: "pen", type: "point", size: 16, spacing: 0.002 }, 
  { name: "pen", type: "point", size: 64, spacing: 0.002 }
]

const init = ( props ) => { // is there a way to lazy-assign? so that a user can send in props and any not sent in go to defaults
  const initialState = {
    colors: DEFAULT_PALETTE,
    brushes: DEFAULT_BRUSHES,
    layers: [],
    width: props.width,
    height: props.height,
    newLayerNo: 1,
    panning: false,
    pressure: false,
    canvasScale: '1.0',
    canvasPosition: { left: '0px', top: '0px' },
    activeColor: 0,
    activeBrush: 0,
    activeLayer: 0,
    brushSample: {},
    strokeHistory: {},
    redoCache: []
  }
  const firstLayer = createLayer( props.width, props.height, 0 )
  initialState.layers.push( firstLayer )
  initialState.brushSample = createLayer( 240, 100, -1, [1, 1, 1, 1] )
  return initialState
}

function Workspace( props ) {
  const [ state, dispatch ] = useReducer( workSpaceReducer, props, init)
  const { 
    colors, brushes, layers,
    width, height,
    panning, pressure, canvasScale, canvasPosition, 
    activeColor, activeBrush, activeLayer,  
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
    const keysdown = ( event ) => {
      if (( event.metaKey || event.ctrlKey ) && event.shiftKey && event.code === 'KeyZ' ) {
        const redo = document.getElementById( 'redo' )
        redo.click()
      } else if (( event.metaKey || event.ctrlKey ) && event.code === 'KeyZ' ) {
        const undo = document.getElementById( 'undo' )
        undo.click()
      } else if (( event.metaKey || event.ctrlKey ) && event.code === 'Equal' ) {
        const zoomIn = document.getElementById( 'zoom in' )
        zoomIn.click()
      } else if (( event.metaKey || event.ctrlKey ) && event.code === 'Minus' ) {
        const zoomOut = document.getElementById( 'zoom out' )
        zoomOut.click()
      } else if ( event.code === 'Space' ) {        
        dispatch({ type: "panning", payload: true })
      }
    }
    const keysup = ( event ) => {
      if ( event.code === 'Space' ) {
        dispatch({ type: "panning", payload: false })
      }
    }
    document.addEventListener( 'keydown', keysdown )
    document.addEventListener( 'keyup', keysup )
    return () => {
      document.removeEventListener( 'keydown', keysdown )
      document.addEventListener( 'keyup', keysup )
    }
  }, [])

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
    // don't draw on invisible layer!
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
      drawPoint( gl, glAttributes, point.position, point.size, drawColor )
      stroke.points.push( point )
    }
  }

  const redo = ( redoCache ) => {
    if ( redoCache.length < 1 ) return
    const redoCacheDup = [ ...redoCache ]
    const nextStroke = redoCacheDup.pop()

    dispatch({ type: "redo" })

    const gl = nextStroke.layer.context
    const glAttributes = getAttributes( gl )
    const drawColor = rgbToGL( colors[ nextStroke.stroke.color ])
    drawStroke( gl, glAttributes, drawColor, nextStroke.stroke.points )
  }

  const saveStroke = ( stroke, layer ) => dispatch({ type: "saveStroke", payload: { stroke, layer }})

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

  const layerDisplay = layers.map ( layer =>
    <LayerDisplay key={ layer.id } layer={ layer } width={ width } height={ height } visible={ layer.visible } />
  )

  return (
    <div className="workspace" onPointerMove={ panning ? pan : null } onPointerDown={ panning ? setClientPosition : null }>
      <div className='tools-right'> 
        <Brushes brushes={ brushes } activeBrush={ activeBrush } dispatch={ dispatch } brushSample={ state.brushSample } />
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
        onPointerUp={() => saveStroke( stroke, layers[activeLayer] )}
        onPointerLeave={() => saveStroke( stroke, layers[activeLayer] )}
      >{ layerDisplay }</div>
      <div id="app-info">
      </div>
      <div className="tools">
        <h1>minxel.</h1>
        <div className='toolbox'>
          <div className='toolbar'>
            <button onClick={() => setShowTools( !showTools ) }>
              <SettingsIcon  className="unpin"/> settings  
            </button>
            <button onClick={() => console.log( state )}> log state </button>
            <button onClick={ saveFile }>
              download image  <DownloadIcon  className="icon"/>
            </button>
          </div>
          <div className='tool-toggles' style={{ flexDirection: showTools ? "column" : "row" }}>
            <ToolButton buttonText={ "undo" } Icon={ UndoIcon } 
              clickFunction={() => dispatch({ type: "undo", payload: layers[activeLayer].id }) } 
              shortcutText={ "ctrl + Z" }
              showTools={ showTools }/>
            <ToolButton buttonText={ "redo" } Icon={ RedoIcon } 
              clickFunction={() => redo( redoCache ) } 
              shortcutText={ "ctrl + Shift + Z" }
              showTools={ showTools }/>
            <ToolButton buttonText={ "zoom in"} Icon={ ZoomInIcon }
              clickFunction={() => dispatch({ type: "zoomIn" })}
              shortcutText= "ctrl + ="
              showTools={ showTools }/>
            <ToolButton buttonText={ "zoom out"} Icon={ ZoomOutIcon }
              clickFunction={() => dispatch({ type: "zoomOut" })}
              shortcutText= "ctrl + -"
              showTools={ showTools }/>
            <ToolButton buttonText={ "pan canvas"} Icon={ PanIcon }
              clickFunction={() => dispatch({ type: "togglePanning" })}
              active={ panning }
              shortcutText="hold spacebar"
              showTools={ showTools }/>
            <ToolButton buttonText={ "pen pressure"} Icon={ PenIcon }
              clickFunction={() => dispatch({ type: "togglePressure" })}
              active={ pressure }
              showTools={ showTools }/>
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