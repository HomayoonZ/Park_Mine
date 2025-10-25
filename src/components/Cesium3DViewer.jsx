import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";

function Cesium3DViewer({ features, model3DUrl }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anaglyphMode, setAnaglyphMode] = useState(false);
  const anaglyphStageRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let viewer = null;

    const initViewer = () => {
      try {
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTAzYWRlNi1lYTdkLTRjOGItOGI0OS0xMTUxNGI4NmM0ZTciLCJpZCI6MjY1Mjk0LCJpYXQiOjE3MzUzMDk4NDZ9.Y5NbdpjOjQX3BvNpEffM3ED4Lq-yO0ncdqA-fA12alA';

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
          vrButton: true,
        });

        viewer.scene.globe.enableLighting = false;
        viewer.cesiumWidget.creditContainer.style.display = "none";

        // بارگذاری مدل 3MX
        if (model3DUrl) {
          const tileset = viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
              url: model3DUrl,
              maximumScreenSpaceError: 16,
              maximumMemoryUsage: 512,
            })
          );

          tileset.readyPromise
            .then((tileset) => {
              viewer.zoomTo(
                tileset,
                new Cesium.HeadingPitchRange(0.0, -0.5, tileset.boundingSphere.radius * 2.0)
              );
            })
            .catch((error) => {
              console.error("خطا در بارگذاری مدل 3D:", error);
            });
        }

        // بارگذاری features
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
              const centerLat = (Math.atan(Math.exp((centerLatMerc * Math.PI) / 20037508.34)) * 360) / Math.PI - 90;

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

              if (index === 0 && !model3DUrl) {
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
        } else if (!model3DUrl) {
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
  }, [features, model3DUrl]);

  // ✅ Shader صحیح برای Cesium جدید
  const toggleAnaglyph = () => {
    if (!viewerRef.current) return;

    if (!anaglyphMode) {
      // ✅ Fragment Shader درست (بدون varying)
      const fragmentShaderSource = `
        uniform sampler2D colorTexture;
        in vec2 v_textureCoordinates;
        out vec4 fragColor;
        
        void main() {
          vec4 color = texture(colorTexture, v_textureCoordinates);
          
          // Red-Cyan Anaglyph Effect
          float red = color.r;
          float cyan = (color.g + color.b) * 0.5;
          
          fragColor = vec4(red, cyan, cyan, color.a);
        }
      `;

      try {
        const stage = new Cesium.PostProcessStage({
          fragmentShader: fragmentShaderSource,
          uniforms: {},
        });

        viewerRef.current.scene.postProcessStages.add(stage);
        anaglyphStageRef.current = stage;
        setAnaglyphMode(true);
      } catch (err) {
        console.error("خطا در فعال‌سازی Anaglyph:", err);
        // ✅ Fallback به روش ساده‌تر
        alert("⚠️ مرورگر شما از Anaglyph shader پشتیبانی نمی‌کند.\n\nلطفا از دکمه VR برای نمایش Split-Screen استفاده کنید.");
      }
    } else {
      // ✅ غیرفعال کردن Anaglyph
      if (anaglyphStageRef.current) {
        viewerRef.current.scene.postProcessStages.remove(anaglyphStageRef.current);
        anaglyphStageRef.current = null;
      }
      setAnaglyphMode(false);
    }
  };

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#f5f5f5" }}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>⚠️</div>
          <div style={{ fontSize: "18px", color: "#C2185B" }}>خطا در بارگذاری نقشه 3D</div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ دکمه Anaglyph */}
      <button
        onClick={toggleAnaglyph}
        style={{
          position: "absolute",
          bottom: "80px",
          left: "20px",
          zIndex: 5001,
          background: anaglyphMode
            ? "linear-gradient(135deg, #E53935 0%, #00BCD4 100%)"
            : "linear-gradient(135deg, #555 0%, #333 100%)",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "14px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
        }}
      >
        <span style={{ fontSize: "20px" }}>
          {anaglyphMode ? "🔴🔵" : "🕶️"}
        </span>
        <span>
          {anaglyphMode ? "آناگلیف فعال" : "عینک 3D"}
        </span>
      </button>

      {/* ✅ راهنما */}
      {anaglyphMode && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 5001,
            background: "rgba(0, 0, 0, 0.85)",
            color: "white",
            padding: "15px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            maxWidth: "280px",
            lineHeight: "1.7",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "15px" }}>
            🔴🔵 راهنمای عینک آناگلیف
          </div>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>
            ✓ عینک قرمز-آبی بپوشید
            <br />
            ✓ چشم چپ: لنز <span style={{ color: "#E53935" }}>●</span> قرمز
            <br />
            ✓ چشم راست: لنز <span style={{ color: "#00BCD4" }}>●</span> آبی
            <br />
            ✓ فاصله مناسب از صفحه
          </div>
        </div>
      )}

      {isLoading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", zIndex: 10000, color: "white", fontSize: "18px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🌍</div>
            <div> بارگذاری نقشه 3D...</div>
            {model3DUrl && <div style={{ fontSize: "12px", marginTop: "10px", opacity: 0.7 }}>بارگذاری مدل معدن...</div>}
          </div>
        </div>
      )}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}

export default Cesium3DViewer;
