import { ReactComponent as UndoIcon } from '../assets/icons/sharp-icons/arrow-undo-circle-sharp.svg'
import { ReactComponent as RedoIcon } from '../assets/icons/sharp-icons/arrow-redo-circle-sharp.svg'

function ThemeTest() {

  return (
    <div className='tools'>
      <div className="toolbox">
        <div className="toolbar"> 
          <h4>Theme Testing Box</h4>
          <UndoIcon className="icon" />
          undo
          <RedoIcon className="icon" />
          redo
        </div>
        <div className='tool-sample' style={{ width: 200, height: 200 }}>
          <button>.</button>
          <button>.</button>
          <button>.</button>
        </div>
        <div className='tooltip'>this is a preview of how a tooltip might display!</div>
      </div>
    </div>
  )
}

export default ThemeTest;