import { useState, useRef, useEffect } from "react";
import PaletteEditor from "./PaletteEditor";
import { colorString } from "../../utils/colorConvert";
import "./Palette.css";
import { redraw } from "../../utils/glHelpers";
import { ReactComponent as PaletteIcon } from "../../assets/icons/sharp-icons/color-palette-sharp.svg";
import MenuToggle from "../Workspace/MenuToggle";

function Palette({
  colors,
  setColors,
  activeColor,
  setActiveColor,
  strokeHistory,
  showSettings,
  max = 16,
}) {
  // console.log("Palette Renders");

  const [cacheColor, setCacheColor] = useState(colors[activeColor]);

  useEffect(() => {
    setCacheColor(colors[activeColor]);
  }, [activeColor]);

  const dragColor = useRef();

  const removeColor = (index) => {
    // can't be done nondestructively
    // check if color is used in drawing
    // if no: delete
    // if yes: ask how to handle removal
    // replace with other palette color:
    // choose other palette color and re-reference to that color
    // delete strokes that use this color
    // set colors
    const newColors = [...colors];
    newColors.splice(index, 1);
    setColors(newColors);
    // redraw
  };

  const colorsList = colors.map((color, index) => (
    <button
      key={index}
      className="swatch"
      style={{ backgroundColor: colorString(color), color: colorString(color) }}
      value={index}
      id={index == activeColor ? "active-swatch" : null}
      onMouseUp={(e) => setActiveColor(e.target.value)}
    >
      ■
    </button>
  ));

  return (
    <>
      {colorsList}
      <PaletteEditor
        colors={colors}
        setColors={setColors}
        activeColor={activeColor}
        removeColor={removeColor}
        strokeHistory={strokeHistory}
        showSettings={showSettings}
        cacheColor={cacheColor}
        setCacheColor={setCacheColor}
      />
    </>
  );
}

export default Palette;
