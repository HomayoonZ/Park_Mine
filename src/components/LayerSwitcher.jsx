import { useState } from "react";

function LayerSwitcher({ map }) {
  const [activeLayer, setActiveLayer] = useState("osm");

  const switchLayer = (layerType) => {
    if (!map) return;

    map.getLayers().forEach((layer) => {
      const source = layer.getSource();
      if (source instanceof require("ol/source/OSM").default) {
        layer.setVisible(layerType === "osm");
      } else if (source instanceof require("ol/source/XYZ").default) {
        layer.setVisible(layerType === "satellite");
      }
    });

    setActiveLayer(layerType);
  };

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s",
    minWidth: "120px",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        left: "20px",
        zIndex: 9000,
        background: "white",
        padding: "12px",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", marginBottom: "4px" }}>
        🗺️ لایه پایه:
      </div>
      
      <button
        onClick={() => switchLayer("osm")}
        style={{
          ...buttonStyle,
          background: activeLayer === "osm" ? "linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)" : "#f5f5f5",
          color: activeLayer === "osm" ? "white" : "#263238",
        }}
      >
        🗺️ نقشه
      </button>

      <button
        onClick={() => switchLayer("satellite")}
        style={{
          ...buttonStyle,
          background: activeLayer === "satellite" ? "linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)" : "#f5f5f5",
          color: activeLayer === "satellite" ? "white" : "#263238",
        }}
      >
        🛰️ ماهواره
      </button>
    </div>
  );
}

export default LayerSwitcher;
