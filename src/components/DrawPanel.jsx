import { useEffect } from "react";
import { Draw, Modify } from "ol/interaction";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Fill, Stroke, Style as OlStyle } from "ol/style";
import "../styles.css";
import "../GeoProject.css";

function DrawPanel({ map, drawType, setDrawType, isDrawing, setIsDrawing, setError }) {
  useEffect(() => {
    if (!map || !drawType) return;

    const drawSource = new VectorSource();
    const drawLayer = new VectorLayer({
      source: drawSource,
      style: new OlStyle({
        stroke: new Stroke({ color: "#FF6F00", width: 2 }),
        fill: new Fill({ color: "rgba(255, 111, 0, 0.3)" }),
      }),
    });

    const drawInteraction = new Draw({
      source: drawSource,
      type: drawType,
      style: new OlStyle({
        stroke: new Stroke({ color: "#FF6F00", width: 2 }),
        fill: new Fill({ color: "rgba(255, 111, 0, 0.3)" }),
      }),
    });

    const modifyInteraction = new Modify({ source: drawSource });

    drawInteraction.on("drawend", (event) => {
      const features = drawSource.getFeatures();
      const geojson = new (require("ol/format/GeoJSON"))().writeFeatures(features, { featureProjection: "EPSG:3857" });
      localStorage.setItem("drawings", geojson);
      setIsDrawing(false);
      setDrawType(null);
    });

    map.addInteraction(drawInteraction);
    map.addInteraction(modifyInteraction);
    map.addLayer(drawLayer);

    return () => {
      map.removeInteraction(drawInteraction);
      map.removeInteraction(modifyInteraction);
      map.removeLayer(drawLayer);
    };
  }, [map, drawType, setIsDrawing, setDrawType, setError]);

  return (
    <div className="card draggable-panel" draggable="true">
      <div className="card-header">ابزار ترسیم</div>
      <div className="card-body">
        <button className="btn btn-accent" onClick={() => { setDrawType("Point"); setIsDrawing(true); }}>نقطه</button>
        <button className="btn btn-accent" onClick={() => { setDrawType("LineString"); setIsDrawing(true); }}>خط</button>
        <button className="btn btn-accent" onClick={() => { setDrawType("Polygon"); setIsDrawing(true); }}>چندضلعی</button>
        <button className="btn btn-danger" onClick={() => { setDrawType(null); setIsDrawing(false); }}>لغو</button>
      </div>
    </div>
  );
}

export default DrawPanel;