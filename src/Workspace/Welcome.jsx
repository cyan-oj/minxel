import { ReactComponent as UndoIcon } from '../assets/icons/sharp-icons/arrow-undo-circle-sharp.svg'
import { ReactComponent as RedoIcon } from '../assets/icons/sharp-icons/arrow-redo-circle-sharp.svg'

function Welcome() {



  return (
    <div className="toolbox">
      <div className="toolbar"> 
        <h4>Theme Testing Box</h4>
        <UndoIcon className="icon" />
        undo
        <RedoIcon className="icon" />
        redo
      </div>
      <div className='tooltip'>this is a preview of how a tooltip might display!</div>
    </div>
  )
}

export default Welcome;