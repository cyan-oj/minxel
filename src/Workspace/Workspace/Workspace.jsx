import { useState, useEffect, useRef, useReducer } from "react";
import {
  getStroke,
  drawPoint,
  drawStroke,
  getAttributes,
  createLayer,
  redraw,
} from "../../utils/glHelpers.js";
import { rgbToGL } from "../../utils/colorConvert.js";
import { workSpaceReducer } from "./WorkspaceReducer.js";
import Palette from "../Palette/Palette.jsx";
import Brushes from "../Brushes/Brushes.jsx";
import Layers from "../Layers/Layers.jsx";
import ToolButton from "./ToolButton.jsx";
import "./Workspace.css";
import { ReactComponent as UndoIcon } from "../../assets/icons/sharp-icons/arrow-undo-sharp.svg";
import { ReactComponent as RedoIcon } from "../../assets/icons/sharp-icons/arrow-redo-sharp.svg";
import { ReactComponent as DownloadIcon } from "../../assets/icons/sharp-icons/download-sharp.svg";
import { ReactComponent as ZoomInIcon } from "../../assets/icons/outline-icons/expand-outline.svg";
import { ReactComponent as ZoomOutIcon } from "../../assets/icons/outline-icons/contract-outline.svg";
import { ReactComponent as PanIcon } from "../../assets/icons/outline-icons/move-outline.svg";
import { ReactComponent as SettingsIcon } from "../../assets/icons/sharp-icons/settings-sharp.svg";
import { ReactComponent as PenIcon } from "../../assets/icons/outline-icons/pencil-outline.svg";
import { ReactComponent as BrushIcon } from "../../assets/icons/sharp-icons/brush-sharp.svg";
import { ReactComponent as PaletteIcon } from "../../assets/icons/sharp-icons/color-palette-sharp.svg";
import { ReactComponent as EraserIcon } from "../../assets/icons/sharp-icons/eraser.svg";
import { ReactComponent as LayersIcon } from "../../assets/icons/sharp-icons/layers-sharp.svg";
import LayerDisplay from "../Layers/LayerDisplay.jsx";
import MenuToggle from "./MenuToggle.jsx";

const DEFAULT_PALETTE = [
  [0, 0, 0],
  [255, 255, 255],
];

const DEFAULT_BRUSHES = [
  { ratio: 1, scale: 1, angle: 0, spacing: 0.002 },
  { ratio: 0.5, scale: 1, angle: 6, spacing: 0.002 },
];

const init = (props) => {
  const initialState = {
    // colors: props.colors ? props.colors : DEFAULT_PALETTE,
    // brushes: DEFAULT_BRUSHES,
    layers: [],
    width: props.width,
    height: props.height,
    newLayerNo: 1,
    erasing: false,
    panning: false,
    pressure: false,
    canvasScale: "1.0",
    canvasPosition: { left: "0px", top: "0px" },
    // activeColor: 0,
    activeBrush: 0,
    activeLayer: 0,
    brushSample: {},
    brushThumbnails: [],
    // strokeHistory: {},
    // redoCache: [],
  };
  const firstLayer = createLayer(props.width, props.height, 0);
  initialState.layers.push(firstLayer);
  initialState.brushSample = createLayer(240, 100, -1, [1, 1, 1, 0]);

  // for (let i = 0; i < initialState.brushes.length; i++) {
  //   const canvas = createLayer(50, 50, -1);
  //   initialState.brushThumbnails.push(canvas);
  // }

  return initialState;
};

function Workspace(props) {
  console.log("workspace renders");
  const [state, dispatch] = useReducer(workSpaceReducer, props, init);
  const {
    // colors,
    // brushes,
    layers,
    width,
    height,
    brushSample,
    brushThumbnails,
    panning,
    pressure,
    erasing,
    canvasScale,
    canvasPosition,
    // activeColor,
    activeBrush,
    activeLayer,
    // strokeHistory,
    // redoCache,
  } = state;

  const [showTools, setShowTools] = useState(false);
  const [brushSettings, showBrushSettings] = useState(false);
  const [paletteSettings, showPaletteSettings] = useState(false);
  const [showLayers, setShowLayers] = useState(false);

  const [activeColor, setActiveColor] = useState(0);

  const [colors, setColors] = useState(
    props.colors ? props.colors : DEFAULT_PALETTE
  );
  const [brushes, setBrushes] = useState(
    props.brushes ? props.brushes : DEFAULT_BRUSHES
  );

  const strokeHistory = useRef({});
  const redoCache = useRef([]);

  const clientPosition = useRef({ x: 0, y: 0 });
  const brushStroke = {
    color: activeColor,
    points: [],
  };
  const position = { x: 0, y: 0, pressure: 0 };

  useEffect(() => {
    dispatch({
      type: "canvasPosition",
      payload: {
        left: `${(window.innerWidth - width) / 2}px`,
        top: `${(window.innerHeight - height) / 2}px`,
      },
    });
    const keysdown = (event) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.code === "KeyZ"
      ) {
        const redo = document.getElementById("redo");
        redo.click();
      } else if ((event.metaKey || event.ctrlKey) && event.code === "KeyZ") {
        const undo = document.getElementById("undo");
        undo.click();
      } else if ((event.metaKey || event.ctrlKey) && event.code === "Equal") {
        const zoomIn = document.getElementById("zoom in");
        zoomIn.click();
      } else if ((event.metaKey || event.ctrlKey) && event.code === "Minus") {
        const zoomOut = document.getElementById("zoom out");
        zoomOut.click();
      } else if (event.code === "KeyE") {
        const eraser = document.getElementById("eraser");
        eraser.click();
      } else if (event.code === "Space") {
        dispatch({ type: "panning", payload: true });
      }
    };
    const keysup = (event) => {
      if (event.code === "Space") dispatch({ type: "panning", payload: false });
    };
    document.addEventListener("keydown", keysdown);
    document.addEventListener("keyup", keysup);
    return () => {
      document.removeEventListener("keydown", keysdown);
      document.addEventListener("keyup", keysup);
    };
  }, []);

  const setClientPosition = (evt) => {
    (clientPosition.current.x = evt.clientX),
      (clientPosition.current.y = evt.clientY);
    return clientPosition.current;
  };

  const setPosition = (evt) => {
    const rect = evt.target.getBoundingClientRect();
    const scale = Number(canvasScale);
    position.x =
      (evt.clientX - rect.left - (width * scale) / 2) / ((width * scale) / 2);
    position.y =
      ((height * scale) / 2 - (evt.clientY - rect.top)) /
      ((height * scale) / 2);
    if (pressure) {
      evt.pressure === 0.5
        ? (position.pressure = 0.001)
        : (position.pressure = evt.pressure);
    } else {
      position.pressure = 1;
    }
    return position;
  };

  const draw = (evt, gl) => {
    const lastPoint = { ...position };
    const currentPoint = setPosition(evt);
    if (evt.buttons !== 1) return;
    const [dist, angle, deltaP] = getStroke(lastPoint, currentPoint);
    const glAttributes = getAttributes(gl);
    brushStroke.color = activeColor;
    brushStroke.brush = brushes[activeBrush];
    const drawColor = erasing ? [0] : rgbToGL(colors[brushStroke.color]);
    for (let i = 0; i < dist; i += brushStroke.brush.spacing) {
      const x = lastPoint.x + Math.sin(angle) * i;
      const y = lastPoint.y + Math.cos(angle) * i;
      const pressure = lastPoint.pressure + deltaP / (dist / i);
      const transforms = {
        translate: { x, y },
        rotate: brushStroke.brush.angle,
        scale: brushStroke.brush.scale,
        ratio: brushStroke.brush.ratio,
        pressure: pressure,
      };
      drawPoint(gl, glAttributes, transforms, drawColor);
      brushStroke.points.push(transforms);
    }
  };

  const undo = (layer, history, cache) => {
    console.log(cache);
    if (Object.keys(history).length < 1) return;
    const newLayer = { ...history[layer] };
    if (newLayer.strokes.length < 1) return;
    const newLayerHistory = [...newLayer.strokes];
    const newCache = [...cache];
    const stroke = newLayerHistory.pop();
    stroke.layer = newLayer;
    newCache.push({
      layer: layers[layer],
      stroke,
    });
    const newStrokeHistory = {
      ...history,
      [layer]: {
        ...newLayer,
        strokes: [...newLayerHistory],
      },
    };
    const gl = newLayer.context;
    redraw(gl, colors, newLayerHistory);
    strokeHistory.current = newStrokeHistory;
    redoCache.current = newCache;
  };

  const redo = (history, cache) => {
    if (cache.length < 1) return;

    const newCache = [...cache];
    const nextStroke = newCache.pop();

    const { stroke, layer } = nextStroke;

    const newStrokeHistory = {
      context: history[layer.id].context,
      strokes: [...history[layer.id].strokes, stroke],
    };

    strokeHistory.current = { ...history, [layer.id]: newStrokeHistory };
    redoCache.current = newCache;

    const gl = nextStroke.layer.context;
    const glAttributes = getAttributes(gl);
    const drawColor = rgbToGL(colors[nextStroke.stroke.color]);
    drawStroke(gl, glAttributes, drawColor, nextStroke.stroke.points);
  };

  const saveStroke = (stroke, layer, history) => {
    if (stroke.points.length < 1) return;
    const layerHistory = history[layer.id];
    let newStrokeHistory = {};
    if (layerHistory) {
      newStrokeHistory = {
        context: history[layer.id].context,
        strokes: [...history[layer.id].strokes, stroke],
      };
    } else {
      newStrokeHistory = {
        context: layer.context,
        strokes: [stroke],
      };
    }
    strokeHistory.current = { ...history, [layer.id]: newStrokeHistory };
    console.log("history", strokeHistory.current);
    brushStroke.color = activeColor;
    brushStroke.points = [];
  };

  const saveFile = () => {
    const exportCanvas = document.getElementById("export-canvas");
    const exportContext = exportCanvas.getContext("2d");
    layers.forEach((layer) => exportContext.drawImage(layer.canvas, 0, 0));
    const saveLink = document.getElementById("save-link");
    saveLink.setAttribute("download", "minxel.gif");
    saveLink.setAttribute(
      "href",
      exportCanvas
        .toDataURL("image/gif")
        .replace("image/gif", "image/octet-stream")
    );
    saveLink.click();
  };

  const pan = (evt) => {
    if (evt.buttons !== 1) {
      setClientPosition(evt);
      return;
    }
    const pastPos = JSON.parse(JSON.stringify(clientPosition.current));
    const nextPos = setClientPosition(evt);
    const newCanvasPos = {
      left: Number(
        canvasPosition.left.slice(0, canvasPosition.left.length - 2)
      ),
      top: Number(canvasPosition.top.slice(0, canvasPosition.top.length - 2)),
    };
    newCanvasPos.left = `${newCanvasPos.left + nextPos.x - pastPos.x}px`;
    newCanvasPos.top = `${newCanvasPos.top + nextPos.y - pastPos.y}px`;
    dispatch({ type: "canvasPosition", payload: newCanvasPos });
  };

  const layerDisplay = layers.map((layer) => (
    <LayerDisplay
      key={layer.id}
      layer={layer}
      width={width}
      height={height}
      visible={layer.visible}
    />
  ));

  return (
    <div
      className="workspace"
      onPointerMove={panning ? pan : null}
      onPointerDown={panning ? setClientPosition : null}
    >
      <div className="tools-right">
        <div className="toolbox">
          <MenuToggle
            menuText="tools"
            Icon={SettingsIcon}
            show={showTools}
            setShow={setShowTools}
          />
          <ToolButton
            buttonText={"eraser"}
            Icon={EraserIcon}
            clickFunction={() => dispatch({ type: "toggleEraser" })}
            shortcutText={"e"}
            active={erasing}
            showTools={showTools}
          />
          <ToolButton
            buttonText={"undo"}
            Icon={UndoIcon}
            clickFunction={() =>
              undo(
                layers[activeLayer].id,
                strokeHistory.current,
                redoCache.current
              )
            }
            shortcutText={"ctrl + z"}
            showTools={showTools}
          />
          <ToolButton
            buttonText={"redo"}
            Icon={RedoIcon}
            clickFunction={() => redo(strokeHistory.current, redoCache.current)}
            shortcutText={"ctrl + shift + Z"}
            showTools={showTools}
          />
          <ToolButton
            buttonText={"zoom in"}
            Icon={ZoomInIcon}
            clickFunction={() => dispatch({ type: "zoomIn" })}
            shortcutText="ctrl + ="
            showTools={showTools}
          />
          <ToolButton
            buttonText={"zoom out"}
            Icon={ZoomOutIcon}
            clickFunction={() => dispatch({ type: "zoomOut" })}
            shortcutText="ctrl + -"
            showTools={showTools}
          />
          <ToolButton
            buttonText={"pan canvas"}
            Icon={PanIcon}
            clickFunction={() => dispatch({ type: "togglePanning" })}
            active={panning}
            shortcutText="hold spacebar"
            showTools={showTools}
          />
          <ToolButton
            buttonText={"pen pressure"}
            Icon={PenIcon}
            clickFunction={() => dispatch({ type: "togglePressure" })}
            active={pressure}
            showTools={showTools}
          />
          <ToolButton
            buttonText={"download image"}
            Icon={DownloadIcon}
            clickFunction={saveFile}
            showTools={showTools}
          />
        </div>
        <div className="toolbox">
          <MenuToggle
            menuText="layers"
            Icon={LayersIcon}
            show={showLayers}
            setShow={setShowLayers}
          />
          <Layers
            dispatch={dispatch}
            layers={layers}
            activeLayer={activeLayer}
            stroke={brushStroke}
            showTools={showLayers}
          />
        </div>
      </div>
      <div
        className="layers"
        id="layers"
        style={{
          width: width,
          height: height,
          scale: canvasScale,
          left: canvasPosition.left,
          top: canvasPosition.top,
          cursor: panning ? "grab" : null,
        }}
        onPointerDown={setPosition}
        onPointerEnter={setPosition}
        onPointerMove={
          !panning && layers[activeLayer].visible
            ? (e) => draw(e, layers[activeLayer].context)
            : null
        }
        onPointerUp={() =>
          saveStroke(
            { ...brushStroke },
            layers[activeLayer],
            strokeHistory.current
          )
        }
        onPointerLeave={() =>
          saveStroke(
            { ...brushStroke },
            layers[activeLayer],
            strokeHistory.current
          )
        }
      >
        {layerDisplay}
      </div>
      <div className="tools-left">
        {/* <div className='header'>
          <h1>minxel.</h1>
          <a href="https://github.com/cyan-oj/minxel">
            <img src={ mark } alt="github-logo" className='header-icon'/>
          </a>
        </div> */}
        <div className="break" />
        <MenuToggle
          menuText="color menu"
          Icon={PaletteIcon}
          show={paletteSettings}
          setShow={showPaletteSettings}
        />
        <Palette
          colors={colors}
          setColors={setColors}
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          strokeHistory={strokeHistory}
          showSettings={paletteSettings}
        />
        <div className="break" />
        <MenuToggle
          menuText="brush menu"
          Icon={BrushIcon}
          show={brushSettings}
          setShow={showBrushSettings}
        />
        <Brushes
          brushes={brushes}
          setBrushes={setBrushes}
          activeBrush={activeBrush}
          dispatch={dispatch}
          brushSample={brushSample}
          brushThumbnails={brushThumbnails}
          showSettings={brushSettings}
        />
        <div className="break" />
        <button onClick={() => console.log(state)}> log state </button>
      </div>
      <a id={"save-link"} href="#" style={{ display: "none" }} />
      <canvas
        id={"export-canvas"}
        style={{ display: "none" }}
        width={width}
        height={height}
      />
    </div>
  );
}

export default Workspace;
