import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import "../styles.css";

function Cesium3DViewer({ features, cesiumToken }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // تنظیم Cesium Ion Token (رایگان)
    Cesium.Ion.defaultAccessToken = cesiumToken || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYjg0ODI4Yy1kYTI4LTQ5NTgtOTJiNi03ZTJhYjU2ZjI2OWEiLCJpZCI6MTc4NzksInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE3MTcyMzc5MjZ9.qpGE_zPNv8GYYzNSMlLr0Kw2RXc3RXLzXqGwJvKqZz8";

    // ایجاد Viewer
    const viewer = new Cesium.Viewer(containerRef.current, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: true,
      timeline: true,
      baseLayerPicker: true,
      geocoder: true,
      homeButton: true,
    });

    viewer.scene.globe.enableLighting = true;

    // اضافه کردن features به Cesium
    if (features && features.length > 0) {
      features.forEach((feature) => {
        const geometry = feature.getGeometry();
        const coords = geometry.getCoordinates();
        const extent = geometry.getExtent();

        // تبدیل به مختصات Cesium
        const [minLon, minLat, maxLon, maxLat] = extent;
        const centerLon = (minLon + maxLon) / 2;
        const centerLat = (minLat + maxLat) / 2;

        // نمایش روی نقشه
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 1000),
          duration: 2,
        });
      });
    }

    viewerRef.current = viewer;

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, [features, cesiumToken]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    />
  );
}

export default Cesium3DViewer;
