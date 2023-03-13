import { ReactComponent as CaretDown } from '../../assets/icons/sharp-icons/caret-down-sharp.svg'
import { ReactComponent as CaretForward } from '../../assets/icons/sharp-icons/caret-forward-sharp.svg'

function MenuToggle({ menuText, Icon, show = false, setShow }) {

  return (
    <div className={ show ? 'menu-toggle-active' : 'menu-toggle'}
      onClick={() => setShow( !show )} >
      <Icon className='unpin'/>
      {/* { show ? menuText : null } */}
      {/* { show ? <CaretDown className='unpin'/> : <CaretForward className='unpin'/> } */}
    </div>
  )
}

export default MenuToggle;