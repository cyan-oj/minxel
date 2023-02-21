import { useEffect, useState } from "react"
import { ReactComponent as PinnedIcon } from '../assets/icons/outline-icons/pin-sharp.svg'
import { ReactComponent as UnPinnedIcon } from '../assets/icons/outline-icons/pin-outline.svg'

function ToolButton({ buttonText, Icon, showTools, state = false, action, dispatch, clickFunction, shortcutText = "" }) {
  const [ pinned, setPinned ] = useState( true );

  useEffect(() => {

  }, [pinned, state])

  return (
    <div className="tool-button">
      { showTools && 
      <>
        <div onClick={() => setPinned( !pinned )}>
          { pinned ? <PinnedIcon className="pin" /> : <UnPinnedIcon className="unpin" /> }
        </div>
        <div className="tool-details">
          <div className="tool-name">
            { buttonText }
          </div>
          <div className="shortcut">
            { shortcutText }
        </div>
        </div>
      </>
      }
      { (showTools || pinned) && 
        <div id={ buttonText } onClick={ dispatch ? (e => dispatch({ type: action })) : clickFunction } >
          <Icon className={ state ? "icon-active" : "icon" }/>
        </div>
      }
    </div>
  )
}

export default ToolButton;