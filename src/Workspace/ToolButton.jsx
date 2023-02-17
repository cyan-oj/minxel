import { useEffect, useState } from "react"
import { ReactComponent as PinnedIcon } from '../assets/icons/outline-icons/pin-sharp.svg'
import { ReactComponent as UnPinnedIcon } from '../assets/icons/outline-icons/pin-outline.svg'

function ToolButton({ buttonText, Icon, showTools, state = false, action, dispatch, clickFunction}) {
  const [ pinned, setPinned ] = useState( true );

  useEffect(() => {

  }, [pinned, state])

  return (
    <>
      { (showTools || pinned) && 
          <div className="tool-button" >
        { showTools && 
          <div onClick={e => setPinned( !pinned )} className="tool-name" >
            { pinned ? <PinnedIcon className="icon" /> : <UnPinnedIcon className="icon" /> }
            { buttonText } 
          </div>
        }
        <button id={ buttonText } onClick={ dispatch ? (e => dispatch({ type: action })) : clickFunction } className={ state ? "tool-icon-active" : "tool-icon" }>
          <Icon className="icon"/>
        </button>
        </div>
      }
    </>
  )
}

export default ToolButton;