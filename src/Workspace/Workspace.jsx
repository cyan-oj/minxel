import BrushBox from "./BrushBox.js";
import Brush from "./Brush.js";
import Palette from "./Palette.js";
import Layer from "./Layer";
import "./Workspace.css"
import { useState } from "react";

function Workspace({ 
  name = 'untitled', 
  height = '256', 
  width = '256', 
  brushBox = new BrushBox(), 
  palette = new Palette(), image }) {

  const brush = new Brush(5);
  const color = "blue"
  
  const [active, toggleActive] = useState( false );
  const [active2, toggleActive2] = useState( false );
  
  return (
    <div className="workspace" id={name}>
      <div className="layer-controls">
        <label htmlFor="layer2">Layer 2
          <input type="checkbox" value={ active2 } onChange={ e => toggleActive2(!active2) } />
        </label>
        <label htmlFor="layer1">Layer 1
          <input type="checkbox" value={ active } onChange={ e => toggleActive(!active) } />
        </label>
      </div>
      <div className="layers">
        <Layer height={ height } width={ width } fill="red" active={ active } brush={ brush } color={ color }/>
        <Layer height={ height } width={ width } active={ active2 } brush={ brush } color={ color }/>
      </div>
    </div>
  )
}

export default Workspace;