import { useEffect, useState } from "react";
import { redraw } from "../../utils/glHelpers";
import ColorSliders from "./ColorSliders";
import { ReactComponent as AddIcon } from "../../assets/icons/outline-icons/add-outline.svg";
import { ReactComponent as UndoIcon } from "../../assets/icons/sharp-icons/arrow-undo-sharp.svg";
import { ReactComponent as SwapIcon } from "../../assets/icons/sharp-icons/swap-horizontal-sharp.svg";

function PaletteEditor({
  colors,
  setColors,
  activeColor,
  showSettings,
  strokeHistory,
  cacheColor,
}) {
  const [newColor, setNewColor] = useState(colors[activeColor]);

  const replaceColor = (color, index) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
    Object.values(strokeHistory).forEach((layer) => {
      redraw(layer.context, newColors, layer.strokes);
    });
  };

  const addColor = (color) => {
    setColors([...colors, color]);
    console.log(`added color ${color}`);
  };

  return (
    <div
      className="tool-editor"
      id="palette-editor"
      style={{ display: showSettings ? "block" : "none" }}
    >
      <ColorSliders
        setNewColor={setNewColor}
        cacheColorText={"previous color"}
        cacheColor={cacheColor}
      />
      <div className="tool-sample">
        <div className="toolbar-clear" onClick={() => addColor(newColor)}>
          <AddIcon className="icon" />
          add color
        </div>
        <div
          className="toolbar-clear"
          onClick={() => replaceColor(newColor, activeColor)}
        >
          <SwapIcon className="icon" />
          replace color
        </div>
        <div
          className="toolbar-clear"
          onClick={() => replaceColor(cacheColor, activeColor)}
        >
          <UndoIcon className="icon" />
          revert
        </div>
      </div>
    </div>
  );
}

export default PaletteEditor;
