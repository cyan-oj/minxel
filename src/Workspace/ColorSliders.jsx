import { useEffect, useState } from "react";
import { colorString } from "../utils/colorConvert"
import convert from "color-convert"

function ColorSliders ({ setNewColor, cacheColorText, newColorText="new color", cacheColor }) {

  const [ rgbColor, setColorRGB ] = useState( cacheColor )
  const [ hslColor, setColorHSL ] = useState( convert.rgb.hsl( rgbColor ))
  const [ rgbSliders, setSliders ] = useState( false )

  useEffect(() => setColorRGB( cacheColor ), [ cacheColor ])
  useEffect(() => setColorHSL( convert.rgb.hsl( rgbColor )), [ rgbColor ])
  
  const setRGB = ( value, index ) => {
    const newRGB = [...rgbColor]
    newRGB[index] = Number( value )
    const newHSL = convert.rgb.hsl( newRGB )
    setColorRGB( newRGB )
    setNewColor( newRGB )
    setColorHSL( newHSL )
  }
  
  const setHSL = ( value, index ) => {
    const newHSL = [...hslColor]
    newHSL[index] = Number( value )
    const newRGB = convert.hsl.rgb( newHSL )
    setColorHSL( newHSL )
    setColorRGB( newRGB )
    setNewColor( newRGB )
  }

  return (
  <>
  <div className="color-preview">
    <div className="color-edit-swatch" style={{ backgroundColor: colorString( cacheColor )}} >{ cacheColorText }</div>
    <div className="color-edit-swatch" style={{ backgroundColor: colorString( rgbColor )}} >{ newColorText }</div>
  </div>
  <div className="toolbar">
      <button onClick={() => setSliders(true)}>rgb</button><button onClick={() => setSliders(false)}>hsl</button>
  </div>
  <div>
    { rgbSliders 
      ?  
        <div className="sliders" id="rgb-sliders">
          <input type="range" min="0" max="255" value={ rgbColor[0] } 
            style={{ backgroundImage:  `linear-gradient(to right, rgb(0, ${rgbColor[1]}, ${rgbColor[2]}), rgb(255, ${rgbColor[1]}, ${rgbColor[2]}))` }}
            onChange={ e => setRGB( e.target.value, 0 )}
          />
          <input type="range" min="0" max="255" value={ rgbColor[1] } 
            onChange={ e => setRGB( e.target.value, 1 )}
            style={{ backgroundImage:  `linear-gradient(to right, rgb(${rgbColor[0]}, 0, ${rgbColor[2]}), rgb(${rgbColor[0]}, 255, ${rgbColor[2]}))` }}
          />
          <input type="range" min="0" max="255" value={ rgbColor[2] } 
            onChange={ e => setRGB( e.target.value, 2 )}
            style={{ backgroundImage:  `linear-gradient(to right, rgb(${rgbColor[0]}, ${rgbColor[1]}, 0), rgb(${rgbColor[0]}, ${rgbColor[1]}, 255))` }}
          />
        </div>
      :  
        <div className="sliders" id="hsl-sliders">
          <input type="range" id="hue" min="0" max="360" value={ hslColor[0] } 
            style={{ 
              backgroundImage: `linear-gradient(to right, 
                hsl(0, ${hslColor[1]}%, ${hslColor[2]}%),
                hsl(45, ${hslColor[1]}%, ${hslColor[2]}%),
                hsl(90, ${hslColor[1]}%, ${hslColor[2]}%),
                hsl(135, ${hslColor[1]}%, ${hslColor[2]}%),
                hsl(180, ${hslColor[1]}%, ${hslColor[2]}%),
                hsl(225, ${hslColor[1]}%, ${hslColor[2]}%),
                hsl(270, ${hslColor[1]}%, ${hslColor[2]}%),
                hsl(315, ${hslColor[1]}%, ${hslColor[2]}%),
                hsl(360, ${hslColor[1]}%, ${hslColor[2]}%))` 
              }}
              onChange={ e => setHSL( e.target.value, 0 )}
          />
          <input type="range" min="0" max="100" value={ hslColor[1] } 
            onChange={ e => setHSL( e.target.value, 1 )}
            style={{ backgroundImage:  `linear-gradient(to right, hsl(${hslColor[0]}, 0%, ${hslColor[2]}%), hsl(${hslColor[0]}, 100%, ${hslColor[2]}%))` }}
          />
          <input type="range" min="0" max="100" value={ hslColor[2] } 
            onChange={ e => setHSL( e.target.value, 2 )}
            style={{ backgroundImage:  `linear-gradient(to right, hsl(${hslColor[0]}, ${hslColor[1]}%, 0%), hsl(${hslColor[0]}, ${hslColor[1]}%, 50%), hsl(${hslColor[0]}, ${hslColor[1]}%, 100%))` }}
          />
        </div>
    }
  </div>
  </>
  )
}

export default ColorSliders;