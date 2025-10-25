import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
function Cesium3DViewer({ features }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let viewer = null;

    const initViewer = () => {
      try {
        // Token شما
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTAzYWRlNi1lYTdkLTRjOGItOGI0OS0xMTUxNGI4NmM0ZTciLCJpZCI6MjY1Mjk0LCJpYXQiOjE3MzUzMDk4NDZ9.Y5NbdpjOjQX3BvNpEffM3ED4Lq-yO0ncdqA-fA12alA';

        // ایجاد Viewer
        viewer = new Cesium.Viewer(containerRef.current, {
          baseLayerPicker: true,
          geocoder: false,
          homeButton: true,
          infoBox: true,
          sceneModePicker: true,
          selectionIndicator: false,
          timeline: false,
          animation: false,
          fullscreenButton: true,
        });

        viewer.scene.globe.enableLighting = false;
        viewer.cesiumWidget.creditContainer.style.display = "none";

        // اضافه کردن features
        if (features && features.length > 0) {
          features.forEach((feature, index) => {
            try {
              const geometry = feature.getGeometry();
              if (!geometry) return;

              const extent = geometry.getExtent();
              const [minLon, minLat, maxLon, maxLat] = extent;

              const centerLonMerc = (minLon + maxLon) / 2;
              const centerLatMerc = (minLat + maxLat) / 2;
              const centerLon = (centerLonMerc * 180) / 20037508.34;
              const centerLat =
                (Math.atan(Math.exp((centerLatMerc * Math.PI) / 20037508.34)) * 360) / Math.PI - 90;

              viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 100),
                point: {
                  color: Cesium.Color.RED,
                  pixelSize: 15,
                  outlineColor: Cesium.Color.WHITE,
                  outlineWidth: 3,
                },
                label: {
                  text: `Feature ${index + 1}`,
                  font: "16px sans-serif",
                  fillColor: Cesium.Color.WHITE,
                  backgroundColor: Cesium.Color.BLACK.withAlpha(0.8),
                  showBackground: true,
                  pixelOffset: new Cesium.Cartesian2(0, -30),
                },
              });

              if (index === 0) {
                viewer.camera.flyTo({
                  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 10000),
                  orientation: {
                    heading: 0,
                    pitch: Cesium.Math.toRadians(-60),
                    roll: 0,
                  },
                  duration: 2,
                });
              }
            } catch (err) {
              console.error("خطا در feature:", err);
            }
          });
        } else {
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(51.389, 35.6892, 200000),
            duration: 2,
          });
        }

        viewerRef.current = viewer;
        setIsLoading(false);
      } catch (err) {
        console.error("خطا:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, [features]);

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#f5f5f5" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px" }}>⚠️</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", zIndex: 10000, color: "white" }}>
          <div>🌍 در حال بارگذاری...</div>
        </div>
      )}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}

export default Cesium3DViewer;
