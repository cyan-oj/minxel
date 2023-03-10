import { useEffect, useRef, useState } from 'react'
import { ANGLE_VALUES, drawPoint, getAttributes } from '../../utils/glHelpers'
import { ReactComponent as BrushIcon } from '../../assets/icons/sharp-icons/brush-sharp.svg'
import { ReactComponent as CaretDown } from '../../assets/icons/sharp-icons/caret-down-sharp.svg'
import { ReactComponent as CaretForward } from '../../assets/icons/sharp-icons/caret-forward-sharp.svg'
import { ReactComponent as AddIcon } from '../../assets/icons/outline-icons/add-outline.svg'

import './Brushes.css'
import BrushPreview from './BrushPreview'
import MenuToggle from '../Workspace/MenuToggle'

function Brushes({ brushes, activeBrush, dispatch, brushSample, brushThumbnails }) {
  const [ showSettings, setShowSettings ] = useState( false )
  const dragBrush = useRef()

  useEffect(() => {
    const brushPreview = document.getElementById('brush-preview')
    brushPreview.appendChild( brushSample.canvas )
  }, [])

  useEffect(() => {
    const gl = brushSample.context
    const glAttributes = getAttributes( gl )
    gl.clear(gl.COLOR_BUFFER_BIT)
    // todo: new stroke preview sample
  }, [ brushes, activeBrush ])

  const dragStart = ( index ) => dragBrush.current = index

  const dragEnter = ( index, brushes ) => {
    const currentBrush = dragBrush.current;
    const dropBrush = brushes.splice( currentBrush, 1 )[0]
    brushes.splice( index, 0, dropBrush )
    dragBrush.current = index
    dispatch({ type: 'brushes', payload: brushes })
  }

  const brushList = brushes.map(( brush, index ) => 
    <div key={ index } value={ index } className='brush'
    id={( index == activeBrush ) ? 'active-brush' : null }
    draggable
    onDragStart={() => dragStart( index )}
    onDragEnter={() => dragEnter( index, brushes )}
    onMouseUp={ e => dispatch({ type: 'activeBrush', payload: index })}
    >
      <BrushPreview brushes={ brushes } brush={ brush } canvas={ brushThumbnails[index] } />
    </div>  
  )

  return (
  <>
    <MenuToggle menuText="brush menu"
      Icon={ BrushIcon } show={ showSettings } setShow={ setShowSettings } />
    { brushList }
    <div className='tool-editor' style={{ display:showSettings ? 'contents' : 'none' }}>
      <div id='brush-preview' />
      <div className='sliders'>
        <input type='range' min='0.01' step="0.01" max='5' value={ brushes[activeBrush].scale }
          onChange={ e => dispatch({ type: 'brushScale', payload: { scale: e.target.value, index: activeBrush }})}
        />
        <input type='range' min='0' max={ ANGLE_VALUES.length - 1 } value={ brushes[activeBrush].angle }
          onChange={ e => dispatch({ type: 'brushAngle', payload: { angle: e.target.value, index: activeBrush }})}
        />
        <input type='range' min='0.01' step=".01" max="1" value={ brushes[activeBrush].ratio }
          onChange={ e => dispatch({ type: 'brushRatio', payload: { ratio: e.target.value, index: activeBrush }})}
        />
      </div>
      <div className='tool-sample'>
        <div className='toolbar-clear' 
          onClick={ e => dispatch({ type: 'addBrush', payload: brushes[activeBrush] })}>
          <AddIcon className='icon'/>
          add preset</div>
      </div>
    </div>
  </>
  )
}

export default Brushes