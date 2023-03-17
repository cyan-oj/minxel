import clsx from 'clsx';
import { ReactComponent as CaretDown } from '../../assets/icons/sharp-icons/caret-down-sharp.svg'
import { ReactComponent as CaretForward } from '../../assets/icons/sharp-icons/caret-forward-sharp.svg'
import './MenuToggle.css'

function MenuToggle({ menuText, Icon, show = false, setShow }) {
  const wide = true;

  const toggleStyle = clsx(
    'menu-toggle',
    { 'menu-open': show },
    { 'menu-wide': show && wide },
  )

  return (
    <div className={ toggleStyle }
      onClick={() => setShow( !show )} >
      <Icon className='unpin'/>
      { show ? menuText : null }
      { show ? <CaretDown className='unpin'/> : null }
    </div>
  )
}

export default MenuToggle;