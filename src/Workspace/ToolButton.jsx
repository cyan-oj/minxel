import { useEffect, useState } from "react"
import { ReactComponent as PinnedIcon } from '../assets/icons/outline-icons/pin-sharp.svg'
import { ReactComponent as UnPinnedIcon } from '../assets/icons/outline-icons/pin-outline.svg'

function ToolButton({ buttonText, Icon, showTools, action, dispatch, }) {
  const [ pinned, setPinned ] = useState( true );

  useEffect(() => {

  }, [pinned])

  return (
    <div className="tool-button">
      { showTools && 
        <div onClick={e => setPinned( !pinned )} className="tool-name">
          { pinned ? <PinnedIcon className="icon" /> : <UnPinnedIcon className="icon" /> }
          { buttonText } 
        </div>
      }
      { (showTools || pinned) && 
        <button onClick={ e => dispatch({ type: action })} className="tool-icon">
          <Icon className="icon"/>
        </button>
      }
    </div>
  )
}

export default ToolButton;