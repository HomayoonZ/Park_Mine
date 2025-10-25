import { useEffect } from "react";
import { Draw, Modify } from "ol/interaction";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Fill, Stroke, Style as OlStyle } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import "../styles.css";
import "../GeoProject.css";

function DrawPanel({
  map,
  drawType,
  setDrawType,
  isDrawing,
  setIsDrawing,
  setError,
  drawSource,
}) {
  useEffect(() => {
    if (!map || !drawType || !drawSource) return;

    const drawLayer = new VectorLayer({
      source: drawSource,
      style: new OlStyle({
        stroke: new Stroke({ color: "#26A69A", width: 2.5 }),
        fill: new Fill({ color: "rgba(38, 166, 154, 0.3)" }),
      }),
    });

    const drawInteraction = new Draw({
      source: drawSource,
      type: drawType,
      style: new OlStyle({
        stroke: new Stroke({ color: "#26A69A", width: 2.5 }),
        fill: new Fill({ color: "rgba(38, 166, 154, 0.3)" }),
      }),
    });

    const modifyInteraction = new Modify({ source: drawSource });

    drawInteraction.on("drawend", (event) => {
      setIsDrawing(false);
      setDrawType(null);
    });

    map.addInteraction(drawInteraction);
    map.addInteraction(modifyInteraction);

    return () => {
      map.removeInteraction(drawInteraction);
      map.removeInteraction(modifyInteraction);
    };
  }, [map, drawType, setIsDrawing, setDrawType, setError, drawSource]);

  return null;
}

export default DrawPanel;
