import { useEffect } from "react";

function Brushes({ brushes, setBrush }) {
  useEffect(() => {
    console.log(brushes)
  }, [brushes])

  const brushList = brushes.map( (brush, i) => 
    <button key={i} value={i} className="brush">{brush.size}</button>  
  )

  return (
    <>
      <div className="brushes" onClick={ e => setBrush(e.target.value)}>
        { brushList }
        <button className="brush" id="addBrush">+</button>
      </div>
    </>
  )
}

export default Brushes;