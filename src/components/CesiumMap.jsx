import { useEffect, useRef, useState } from "react";
import "../styles.css";

function CesiumMap({ onClose }) {
  const cesiumContainerRef = useRef();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const viewerRef = useRef(null);

  useEffect(() => {
    const initializeCesium = async () => {
      try {
        const Cesium = await import("cesium");
        
        // Use environment variable or fallback
        Cesium.Ion.defaultAccessToken = process.env.REACT_APP_CESIUM_TOKEN || 
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTAzYWRlNi1lYTdkLTRjOGItOGI0OS0xMTUxNGI4NmM0ZTciLCJpZCI6MjY1Mjk0LCJpYXQiOjE3MzUzMDk4NDZ9.Y5NbdpjOjQX3BvNpEffM3ED4Lq-yO0ncdqA-fA12alA';

        // Check WebGL support
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
        if (!gl) {
          throw new Error("مرورگر شما از WebGL پشتیبانی نمیکند");
        }

        if (!cesiumContainerRef.current) {
          throw new Error("Container not found");
        }

        const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
          terrain: Cesium.Terrain.fromWorldTerrain(),
          imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }),
          baseLayerPicker: true,
          geocoder: true,
          homeButton: true,
          sceneModePicker: true,
          navigationHelpButton: true,
          animation: true,
          timeline: true,
          fullscreenButton: true,
          vrButton: true,
          requestRenderMode: true,
          maximumRenderTimeChange: Infinity,
        });

        viewerRef.current = viewer;

        // Enhanced globe settings
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.globe.showWaterEffect = true;

        // Fly to Tehran with better animation
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(51.3890, 35.6892, 15000),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-45),
            roll: 0.0,
          },
          duration: 3,
        });

        // Improved render loop
        viewer.scene.postUpdate.addEventListener(() => {
          if (viewer.scene.mode !== Cesium.SceneMode.MORPHING) {
            viewer.scene.requestRender();
          }
        });

        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error("Cesium initialization error:", err);
        setError("خطا در لود نقشه سهبعدی: " + err.message);
        setIsLoading(false);
      }
    };

    initializeCesium();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  const enterVR = async () => {
    try {
      if (!navigator.xr) {
        throw new Error("مرورگر شما از WebXR پشتیبانی نمیکند");
      }

      const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
      if (!isSupported) {
        throw new Error("WebXR VR در این دستگاه پشتیبانی نمیشود");
      }

      const session = await navigator.xr.requestSession("immersive-vr");
      console.log("VR session started successfully");
      
      session.addEventListener('end', () => {
        console.log("VR session ended");
      });
    } catch (err) {
      console.error("VR error:", err);
      setError("خطا در فعالسازی VR: " + err.message);
    }
  };

  if (error) {
    return (
      <div className="cesium-error">
        <div className="error-content">
          <h3>خطا در نمایش نقشه سهبعدی</h3>
          <p>{error}</p>
          <button onClick={onClose} className="close-btn">
            بستن
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cesium-container">
      {isLoading && (
        <div className="cesium-loading">
          <div className="loading-spinner"></div>
          <p>در حال بارگذاری نقشه سهبعدی...</p>
        </div>
      )}
      
      <div className="cesium-controls">
        <button onClick={enterVR} className="vr-btn">
          حالت VR
        </button>
        <button onClick={onClose} className="close-btn">
          بستن
        </button>
      </div>
      
      <div 
        ref={cesiumContainerRef} 
        className="cesium-viewer"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default CesiumMap;
