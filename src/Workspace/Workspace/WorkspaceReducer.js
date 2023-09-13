import { createLayer, redraw } from "../../utils/glHelpers";

export const workSpaceReducer = (state, action) => {
  const { type, payload } = action;
  console.log(state);
  switch (type) {
    case "saveStroke": {
      const { stroke, layer } = payload;
      if (stroke.points.length < 1) return { ...state };
      const layerHistory = state.strokeHistory[layer.id];
      let newStrokeHistory = {};
      if (layerHistory) {
        newStrokeHistory = {
          context: state.strokeHistory[layer.id].context,
          strokes: [...state.strokeHistory[layer.id].strokes, stroke],
        };
      } else {
        newStrokeHistory = {
          context: layer.context,
          strokes: [stroke],
        };
      }
      return {
        ...state,
        strokeHistory: { ...state.strokeHistory, [layer.id]: newStrokeHistory },
      };
    }
    case "zoomIn":
      return {
        ...state,
        canvasScale: (Number(state.canvasScale) * 1.25).toFixed(6).toString(),
      };
    case "zoomOut":
      return {
        ...state,
        canvasScale: (Number(state.canvasScale) / 1.25).toFixed(6).toString(),
      };
    case "togglePanning":
      return { ...state, panning: !state.panning };
    case "togglePressure":
      return { ...state, pressure: !state.pressure };
    case "toggleEraser":
      return { ...state, erasing: !state.erasing };
    case "undo": {
      // payload: activeLayer
      if (Object.keys(state.strokeHistory).length < 1) return { ...state };
      const newLayer = { ...state.strokeHistory[payload] };
      if (newLayer.strokes.length < 1) return { ...state };
      const newLayerHistory = [...newLayer.strokes];
      const newCache = [...state.redoCache];
      const stroke = newLayerHistory.pop();
      stroke.layer = newLayer;
      newCache.push({ layer: state.layers[payload], stroke });
      const newStrokeHistory = {
        ...state.strokeHistory,
        [payload]: {
          ...newLayer,
          strokes: [...newLayerHistory],
        },
      };
      const gl = newLayer.context;
      redraw(gl, state.colors, newLayerHistory);
      return {
        ...state,
        strokeHistory: newStrokeHistory,
        redoCache: newCache,
      };
    }
    case "redo": {
      const newCache = [...state.redoCache];
      const { stroke, layer } = newCache.pop();
      const newStrokeHistory = {
        context: state.strokeHistory[layer.id].context,
        strokes: [...state.strokeHistory[layer.id].strokes, stroke],
      };
      return {
        ...state,
        redoCache: newCache,
        strokeHistory: { ...state.strokeHistory, [layer.id]: newStrokeHistory },
      };
    }
    case "activeLayer": // payload: index
      return { ...state, activeLayer: payload };
    case "layers": // payload: [ new layer arrangement ]
      return { ...state, layers: [...payload] };
    case "toggleVisibility": //payload: index, visible
      const { index, visible } = payload;
      const newLayers = [...state.layers];
      const newLayer = { ...newLayers[index] };
      newLayer.visible = !visible;
      newLayers[index] = newLayer;
      return { ...state, layers: [...newLayers] };
    case "addLayer": {
      const newLayer = createLayer(state.width, state.height, state.newLayerNo);
      return {
        ...state,
        layers: [...state.layers, newLayer],
        activeLayer: state.layers.length,
        newLayerNo: state.newLayerNo + 1,
      };
    }
    case "deleteLayer": {
      // payload: index
      if (state.layers.length <= 1) return { ...state };
      const newLayers = [...state.layers];
      const newHistory = { ...state.strokeHistory };
      const [removed] = newLayers.splice(payload, 1);
      delete newHistory[removed.id];
      return {
        ...state,
        layers: [...newLayers],
        activeLayer: 0,
        strokeHistory: newHistory,
        redoCache: [],
      };
    }
    // case "replaceColor": {
    //   // payload: { color, index }
    //   const colors = [...state.colors];
    //   colors[payload.index] = payload.color;
    //   return { ...state, colors: colors };
    // }
    // case "addColor": // payload: color
    //   return {
    //     ...state,
    //     colors: [...state.colors, payload],
    //     activeColor: state.colors.length,
    //   };
    case "replaceBrush": {
      // payload: { size, index }
      const brushes = [...state.brushes];
      brushes[payload.index].scale = payload.scale;
      return { ...state, brushes: brushes };
    }
    case "brushScale": {
      const brushes = [...state.brushes];
      const brush = brushes[payload.index];
      brush.scale = payload.scale;
      return { ...state, brushes: brushes };
    }
    case "brushAngle": {
      const brushes = [...state.brushes];
      const brush = brushes[payload.index];
      brush.angle = payload.angle;
      return { ...state, brushes: brushes };
    }
    case "brushRatio": {
      const brushes = [...state.brushes];
      const brush = brushes[payload.index];
      brush.ratio = payload.ratio;
      return { ...state, brushes: brushes };
    }
    case "addBrush":
      const newBrush = { ...payload };
      const newBrushThumbnail = createLayer(50, 50, -1);
      return {
        ...state,
        brushes: [...state.brushes, newBrush],
        brushThumbnails: [...state.brushThumbnails, newBrushThumbnail],
        activeBrush: state.brushes.length,
      };
    default:
      return { ...state, [type]: payload };
  }
};
