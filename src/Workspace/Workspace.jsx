import BrushBox from "./BrushBox.js";
import Palette from "./Palette.js";
import Layer from "./Layer";
import { useState } from "react";

// const options = {
  //   name: 'test',
  //   height: 256,
  //   width: 200
  // }
  
  // colors
  // image

function Workspace({ 
  name = 'untitled', 
  height = '256', 
  width = '256', 
  brushBox = new BrushBox(), 
  palette = new Palette() }) {

  
  const [active, toggleActive] = useState( false );
  
  return (
    <div className="workspace" id={name}>
      <input type="checkbox" value={ active } onChange={ e => toggleActive(!active) } />
      <Layer height={ height } width={ width } fill="red" active={ active }/>
    </div>
  )

}

export default Workspace;