import { useEffect, useRef } from 'react';
import './Layers.css'
import { ReactComponent as EyeIcon } from '../../assets/icons/sharp-icons/eye-sharp.svg'
import { ReactComponent as EyeOffIcon } from '../../assets/icons/sharp-icons/eye-off-sharp.svg'

function LayerPreview( { layer, id, stroke, activeLayer, dispatch } ) {
  const preview = useRef();

  useEffect(() => {
    const ctx = preview.current.getContext( '2d' )
    ctx.clearRect(0, 0, 50, 50)
    ctx.drawImage( layer.canvas, 0, 0, 50, 50 )
  }, [ stroke, activeLayer ])

  return (
    <div id={ id } className={ Number(activeLayer) === id ? 'active-layer' : 'layer-preview' }>
      <canvas ref={ preview } className='layer-thumbnail' width={ 50 } height={ 50 } />
      <p id={ id } className='layer-name'>{ layer.name }</p>
      { layer.visible &&
        <EyeIcon className='icon-active' 
          onClick={() => dispatch({ type: 'toggleVisibility', payload: { index: id, visible: layer.visible }})}/>
      }
      { !layer.visible &&
        <EyeOffIcon className='icon' 
          onClick={() => dispatch({ type: 'toggleVisibility', payload: { index: id, visible: layer.visible }})}/>
      }
    </div>
  )
}

export default LayerPreview;