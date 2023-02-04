import { useEffect } from "react";

function Brushes({ brushes, setBrush }) {
  useEffect(() => {
  }, [brushes])

  const brushList = brushes.map( (brush, i) => 
    <button key={i} value={i} className="brush">{brush.size}</button>  
  )

  return (
    <div className="toolbox" onMouseUp={ e => setBrush(e.target.value)}>
      { brushList }
      <button className="brush" id="addBrush">+</button>
    </div>
  )
}

export default Brushes;