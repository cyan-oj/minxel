import { useEffect, useState } from 'react';
import { redraw } from '../../utils/glHelpers'
import ColorSliders from './ColorSliders';
import { ReactComponent as AddIcon } from '../../assets/icons/outline-icons/add-outline.svg'
import { ReactComponent as UndoIcon } from '../../assets/icons/sharp-icons/arrow-undo-sharp.svg'

function PaletteEditor({ colors, activeColor, showSettings, strokeHistory, dispatch, cacheColor}) {
  const [ newColor, setNewColor ] = useState( colors[activeColor] )

  useEffect(() => {
    replaceColor(newColor, activeColor)
  }, [newColor])

  const replaceColor = ( color, index ) => { 
    dispatch({ 
      type: 'replaceColor', 
      payload: {
        color, 
        index
      } 
    })
    const newColors = [...colors]
    newColors[index] = color
    Object.values( strokeHistory ).forEach( layer => { redraw( layer.context, newColors, layer.strokes )})
  }
  
  return (
    <div className='tool-editor' id='palette-editor' style={{ display:showSettings ? 'block' : 'none' }}>
      <ColorSliders setNewColor={ setNewColor } cacheColorText={ 'previous color'} cacheColor={ cacheColor }/>
      <div className='tool-sample'>
        <div className='toolbar-clear' 
          onClick={() => dispatch({ type: 'addColor', payload: newColor })}>
          <AddIcon className='icon'/> 
          add color</div>
        <div className='toolbar-clear' 
          onClick={() => replaceColor( cacheColor, activeColor )}>
          <UndoIcon className='icon'/>
          revert</div>
      </div>
    </div>
  )
}

export default PaletteEditor;