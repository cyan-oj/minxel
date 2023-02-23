import { useEffect, useRef, useState } from 'react'
import { drawPoint, getAttributes } from '../../utils/glHelpers'
import { SAMPLE_STROKE } from '../../utils/sampleStroke'
import { ReactComponent as SettingsIcon } from '../../assets/icons/sharp-icons/settings-sharp.svg'
import { ReactComponent as CaretDown } from '../../assets/icons/sharp-icons/caret-down-sharp.svg'
import { ReactComponent as CaretForward } from '../../assets/icons/sharp-icons/caret-forward-sharp.svg'
import { ReactComponent as AddIcon } from '../../assets/icons/outline-icons/add-outline.svg'

import './Brushes.css'

function Brushes({ brushes, activeBrush, dispatch, brushSample }) {
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
    for ( let i = 0; i < SAMPLE_STROKE.points.length; i++ ){
      const point = SAMPLE_STROKE.points[i]
      drawPoint( gl, glAttributes, point.position, point.size * ( brushes[activeBrush].size / 64 ), [ 0, 0, 0, 1 ])
    }
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
    <button key={ index } value={ index } className='brush'
      id={( index == activeBrush ) ? 'active-brush' : null }
      draggable
      onDragStart={() => dragStart( index )}
      onDragEnter={() => dragEnter( index, brushes )}
      onMouseUp={ e => dispatch({ type: 'activeBrush', payload: e.target.value })}
    >{brush.size}</button>  
  )

  return (
    <div className='toolbox' >
      <div className='tool-sample' id='brushes'>
      { brushList }
      </div>
      <div className='toolbar'
        onClick={() => setShowSettings( !showSettings )}>
        <SettingsIcon className='unpin'/>
        brush menu 
        { showSettings ? <CaretDown className='unpin'/> : <CaretForward className='unpin'/>}
      </div>
      <div className='tool-editor' style={{ display:showSettings ? 'contents' : 'none' }}>
        <div id='brush-preview' />
        <div className='sliders'>
          <input type='range' min='1' max='64' value={ brushes[activeBrush].size }
            onChange={ e => dispatch({ type: 'replaceBrush', payload: { size: e.target.value, index: activeBrush }})}
          />
        </div>
        <div className='tool-sample'>
          <div className='toolbar-clear' 
            onClick={ e => dispatch({ type: 'addBrush', payload: brushes[activeBrush].size })}>
            <AddIcon className='icon'/>
            add preset</div>
        </div>
      </div>
    </div>
  )
}

export default Brushes