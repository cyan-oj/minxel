import { useEffect, useRef } from 'react'

function LayerDisplay({ layer, width, height, visible }) {
  const layerID = useRef(`layer ${layer.id}`)

  useEffect(() => {
    if ( visible ){
      const parent = document.getElementById( layerID.current )
      parent.appendChild( layer.canvas )
    }
  }, [visible])

  return (
    <>
    { visible && 
      <div id={ layerID.current } style={{ width: width, height: height }} />
    }
    </>
  )
}

export default LayerDisplay;