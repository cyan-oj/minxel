import { useState } from "react";
import convert from "color-convert"
import { colorString, glToRGB, rgbToGL } from "../utils/colorConvert";
import { redraw } from "../utils/glHelpers";

function PaletteEditor({ colors, activeColor, setColors, showSettings, strokeHistory, setStrokeHistory }) {

  const [ rgbColor, setColorRGB ] = useState( glToRGB( activeColor ) )
  const [ hslColor, setColorHSL ] = useState( convert.rgb.hsl( rgbColor ))

  const addColor = ( color=[ 255, 255, 255 ]) => {
    for ( const swatch of colors ) {
      if( swatch === color ) {
        console.error('color already in palette')
        return;
      } 
    }
    setColors( oldColors => [ ...oldColors, color ] )
  }

  const replaceColor = () => { // gl, strokehistory, newColor, oldColor
  }

  const setRGB = ( value, index ) => {
    const newRGB = [...rgbColor]
    newRGB[index] = Number(value)
    const newHSL = convert.rgb.hsl(newRGB)
    setColorRGB( newRGB )
    setColorHSL( newHSL )
  }

  const setHSL = ( value, index ) => {
    const newHSL = [...hslColor]
    newHSL[index] = Number(value)
    const newRGB = convert.hsl.rgb(newHSL)
    setColorHSL( newHSL )
    setColorRGB( newRGB )
  }
  
  return (
    <div className="tool-editor" id="palette-editor" style={ showSettings ? { display: "block" } : { display: "none" }}>
      <div className="color-preview">
        <div className="color-edit-swatch" style={{ backgroundColor: colorString( glToRGB( activeColor )), color: colorString( glToRGB( activeColor ))}} ></div>
        <div className="color-edit-swatch" style={{ backgroundColor: colorString( rgbColor ), color: colorString( rgbColor )}} ></div>
      </div>
      <div className="sliders" id="rgb-sliders">rgb
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
      <div className="sliders" id="hsl-sliders">hsl
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
        <button id="addColor" onClick={ e => { addColor( rgbColor ) }}>add color</button>
        <button id="replaceColor" onClick={ replaceColor }>replace active color</button>
    </div>
  )
}

export default PaletteEditor;