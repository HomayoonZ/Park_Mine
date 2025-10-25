import { useEffect, useState } from "react";
import { Draw, Modify, Snap } from "ol/interaction";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Fill, Stroke, Style as OlStyle, Circle } from "ol/style";
import { GeoJSON } from "ol/format";
import DraggableWrapper from "./DraggableWrapper";
import "../styles.css";

function DrawPanel({
  map,
  drawType,
  setDrawType,
  isDrawing,
  setIsDrawing,
  setError,
  drawSource,
  showDrawPanel,
  onClose,
}) {
  const [currentDrawType, setCurrentDrawType] = useState(null);
  const [strokeColor, setStrokeColor] = useState("#FF6F00");
  const [fillColor, setFillColor] = useState("rgba(255, 111, 0, 0.3)");
  const [strokeWidth, setStrokeWidth] = useState(3);

  // رنگ‌های پیش‌فرض
  const predefinedColors = [
    { name: "نارنجی", stroke: "#FF6F00", fill: "rgba(255, 111, 0, 0.3)" },
    { name: "آبی", stroke: "#1E88E5", fill: "rgba(30, 136, 229, 0.3)" },
    { name: "سبز", stroke: "#26A69A", fill: "rgba(38, 166, 154, 0.3)" },
    { name: "قرمز", stroke: "#C2185B", fill: "rgba(194, 24, 91, 0.3)" },
    { name: "بنفش", stroke: "#7B1FA2", fill: "rgba(123, 31, 162, 0.3)" },
    { name: "زرد", stroke: "#F57F17", fill: "rgba(245, 127, 23, 0.3)" },
  ];

  useEffect(() => {
    if (!map || !currentDrawType || !drawSource) return;

    const drawInteraction = new Draw({
      source: drawSource,
      type: currentDrawType,
      style: new OlStyle({
        stroke: new Stroke({ color: strokeColor, width: strokeWidth }),
        fill: new Fill({ color: fillColor }),
        image: new Circle({
          radius: 5,
          fill: new Fill({ color: strokeColor }),
        }),
      }),
    });

    const modifyInteraction = new Modify({
      source: drawSource,
      style: new OlStyle({
        stroke: new Stroke({ color: strokeColor, width: strokeWidth + 1 }),
        fill: new Fill({ color: fillColor }),
        image: new Circle({
          radius: 7,
          fill: new Fill({ color: strokeColor }),
          stroke: new Stroke({ color: "white", width: 2 }),
        }),
      }),
    });

    const snapInteraction = new Snap({ source: drawSource });

    drawInteraction.on("drawend", () => {
      setCurrentDrawType(null);
    });

    map.addInteraction(drawInteraction);
    map.addInteraction(modifyInteraction);
    map.addInteraction(snapInteraction);

    return () => {
      map.removeInteraction(drawInteraction);
      map.removeInteraction(modifyInteraction);
      map.removeInteraction(snapInteraction);
    };
  }, [map, currentDrawType, drawSource, strokeColor, fillColor, strokeWidth]);

  const handleDownload = () => {
    if (!drawSource) return;

    const features = drawSource.getFeatures();
    if (features.length === 0) {
      setError("هیچ شکلی برای دانلود وجود ندارد");
      return;
    }

    const geojsonFormat = new GeoJSON();
    const geojsonStr = geojsonFormat.writeFeatures(features, {
      featureProjection: "EPSG:3857",
      dataProjection: "EPSG:4326",
    });

    const blob = new Blob([geojsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `drawn_features_${Date.now()}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (drawSource) {
      drawSource.clear();
    }
  };

  if (!showDrawPanel) return null;

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "center",
  };

  const colorButtonStyle = (isActive) => ({
    ...buttonStyle,
    background: isActive ? "linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)" : "#f5f5f5",
    color: isActive ? "white" : "#263238",
    flex: 1,
  });

  return (
    <DraggableWrapper
      title="✏️ ابزار رسم"
      onClose={onClose}
      defaultPosition={{ x: 200, y: 20 }}
      minWidth="360px"
      maxWidth="450px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* ابزارهای رسم */}
        <div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#263238", marginBottom: "8px" }}>
            ✏️ ابزارهای رسم:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            <button
              onClick={() => setCurrentDrawType("Point")}
              style={{
                ...buttonStyle,
                background: currentDrawType === "Point" ? "linear-gradient(135deg, #FF6F00 0%, #F57C00 100%)" : "#f5f5f5",
                color: currentDrawType === "Point" ? "white" : "#263238",
              }}
            >
              <span>📍</span>
              <span>نقطه</span>
            </button>

            <button
              onClick={() => setCurrentDrawType("LineString")}
              style={{
                ...buttonStyle,
                background: currentDrawType === "LineString" ? "linear-gradient(135deg, #FF6F00 0%, #F57C00 100%)" : "#f5f5f5",
                color: currentDrawType === "LineString" ? "white" : "#263238",
              }}
            >
              <span>📏</span>
              <span>خط</span>
            </button>

            <button
              onClick={() => setCurrentDrawType("Polygon")}
              style={{
                ...buttonStyle,
                background: currentDrawType === "Polygon" ? "linear-gradient(135deg, #FF6F00 0%, #F57C00 100%)" : "#f5f5f5",
                color: currentDrawType === "Polygon" ? "white" : "#263238",
              }}
            >
              <span>⬟</span>
              <span>چندضلعی</span>
            </button>

            <button
              onClick={() => setCurrentDrawType("Circle")}
              style={{
                ...buttonStyle,
                background: currentDrawType === "Circle" ? "linear-gradient(135deg, #FF6F00 0%, #F57C00 100%)" : "#f5f5f5",
                color: currentDrawType === "Circle" ? "white" : "#263238",
              }}
            >
              <span>⭕</span>
              <span>دایره</span>
            </button>
          </div>
        </div>

        {/* رنگ‌های پیش‌فرض */}
        <div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#263238", marginBottom: "8px" }}>
            🎨 انتخاب رنگ:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
            {predefinedColors.map((color) => (
              <button
                key={color.name}
                onClick={() => {
                  setStrokeColor(color.stroke);
                  setFillColor(color.fill);
                }}
                style={{
                  padding: "12px",
                  border: strokeColor === color.stroke ? "3px solid #1E88E5" : "2px solid #ddd",
                  borderRadius: "8px",
                  background: color.fill,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#263238",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "40px",
                }}
                title={color.name}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>

        {/* رنگ‌های دلخواه */}
        <div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#263238", marginBottom: "8px" }}>
            🌈 رنگ دلخواه:
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              style={{
                width: "50px",
                height: "40px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              title="رنگ خط"
            />
            <div style={{ flex: 1, fontSize: "12px", color: "#666" }}>
              <div>خط: {strokeColor}</div>
              <div>پر: {fillColor}</div>
            </div>
          </div>
        </div>

        {/* ضخامت خط */}
        <div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#263238", marginBottom: "8px" }}>
            📏 ضخامت خط: {strokeWidth}px
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            style={{
              width: "100%",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* خط جداکننده */}
        <div style={{ borderTop: "2px solid #e0e0e0" }} />

        {/* عملیات */}
        <div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#263238", marginBottom: "8px" }}>
            ⚙️ عملیات:
          </div>

          <button
            onClick={handleDownload}
            style={{
              ...buttonStyle,
              background: "linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)",
              color: "white",
              width: "100%",
              marginBottom: "8px",
            }}
          >
            <span>💾</span>
            <span>دانلود GeoJSON</span>
          </button>

          <button
            onClick={handleClear}
            style={{
              ...buttonStyle,
              background: "#ffebee",
              color: "#C2185B",
              width: "100%",
            }}
          >
            <span>🗑️</span>
            <span>پاک کردن همه</span>
          </button>
        </div>

        {/* نکات کمکی */}
        <div style={{
          background: "#f5f5f5",
          padding: "10px 12px",
          borderRadius: "8px",
          fontSize: "11px",
          color: "#666",
          lineHeight: "1.6",
        }}>
          <strong>💡 نکات:</strong>
          <br />
          • دابل کلیک برای اتمام شکل
          <br />
          • درگ برای جابجایی
          <br />
          • کلیک بر روی نقطه برای حذف
        </div>
      </div>
    </DraggableWrapper>
  );
}

export default DrawPanel;
