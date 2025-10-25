import { useState, useEffect, useCallback } from "react";
import "./styles.css";
import "./GeoProject.css";
import MapContainer from "./components/MapContainer";
import DrawPanel from "./components/DrawPanel";
import FilterPanel from "./components/FilterPanel";
import FeatureTable from "./components/FeatureTable";
import ControlButtons from "./components/ControlButtons";
import FileUploadBox from "./components/FileUploadBox";
import LayerSwitcher from "./components/LayerSwitcher";
import Cesium3DViewer from "./components/Cesium3DViewer";
import shp from "shpjs";
import { GeoJSON } from "ol/format";
import KML from "ol/format/KML";
import { Vector as VectorSource } from "ol/source";

function UploadableMap() {
  const [map, setMap] = useState(null);
  const [features, setFeatures] = useState([]);
  const [filteredFeatures, setFilteredFeatures] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [filters, setFilters] = useState([]);
  const [filterLogic, setFilterLogic] = useState("AND");
  const [attributeKeys, setAttributeKeys] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showDrawPanel, setShowDrawPanel] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [mouseCoord, setMouseCoord] = useState(null);
  const [error, setError] = useState(null);
  const [layer, setLayer] = useState("osm");
  const [drawType, setDrawType] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState({
    main: true,
    drawings: true,
  });

  const [savedGeojsonData, setSavedGeojsonData] = useState(null);
  const [drawSource] = useState(() => new VectorSource());

  const applyFilters = useCallback(
    (currentFilters) => {
      if (!currentFilters || !currentFilters.length) {
        setFilteredFeatures(features);
        return;
      }

      const newFiltered = features.filter((f) => {
        const props = f.getProperties();
        const evaluations = currentFilters.map((filt) => {
          const val = props[filt.key];
          if (val === undefined || val === null) return false;

          const filterValue = isNaN(filt.value)
            ? filt.value
            : parseFloat(filt.value);
          const propValue = isNaN(val) ? val : parseFloat(val);

          switch (filt.operator) {
            case "eq":
              return (
                String(propValue).toLowerCase() ===
                String(filterValue).toLowerCase()
              );
            case "gt":
              return Number(propValue) > Number(filterValue);
            case "lt":
              return Number(propValue) < Number(filterValue);
            case "contains":
              return String(propValue)
                .toLowerCase()
                .includes(String(filterValue).toLowerCase());
            default:
              return false;
          }
        });

        return filterLogic === "AND"
          ? evaluations.every(Boolean)
          : evaluations.some(Boolean);
      });

      setFilteredFeatures(newFiltered);
    },
    [filterLogic, features]
  );

  const clearFilters = useCallback(() => {
    setFilters([]);
    setFilteredFeatures(features);
  }, [features]);

  const handleFileUpload = useCallback((files) => {
    const fileList = Array.from(files);
    const isShapefile = fileList.some(
      (file) =>
        file.name.endsWith(".shp") ||
        file.name.endsWith(".dbf") ||
        file.name.endsWith(".shx")
    );
    const isGeojson = fileList.some((file) => file.name.endsWith(".geojson"));
    const isKML = fileList.some((file) => file.name.endsWith(".kml"));

    if (isShapefile) {
      const shpFile = fileList.find((file) => file.name.endsWith(".shp"));
      if (!shpFile) {
        setError("فایل .shp مورد نیاز است");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const buffer = event.target.result;
          const geojson = await shp(buffer);
          const geojsonText = JSON.stringify(geojson);

          setSavedGeojsonData(geojsonText);
          setFeatures(
            new GeoJSON().readFeatures(geojsonText, {
              featureProjection: "EPSG:3857",
            })
          );
          setError(null);
          setShowUpload(false);
        } catch (error) {
          console.error(error);
          setError("خطا در خواندن فایل Shapefile");
        }
      };
      reader.onerror = () => setError("خطا در خواندن فایل");
      reader.readAsArrayBuffer(shpFile);
    } else if (isGeojson) {
      const geojsonFile = fileList.find((file) =>
        file.name.endsWith(".geojson")
      );
      if (!geojsonFile) {
        setError("لطفاً فایل GeoJSON یا Shapefile آپلود کنید");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setSavedGeojsonData(text);

        try {
          setFeatures(
            new GeoJSON().readFeatures(text, {
              featureProjection: "EPSG:3857",
            })
          );
          setError(null);
          setShowUpload(false);
        } catch (error) {
          console.error(error);
          setError("فایل GeoJSON نامعتبر است");
        }
      };
      reader.onerror = () => setError("خطا در خواندن فایل");
      reader.readAsText(geojsonFile);
    } else if (isKML) {
      const kmlFile = fileList.find((file) => file.name.endsWith(".kml"));
      if (!kmlFile) {
        setError("لطفاً فایل KML معتبر آپلود کنید");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;

        try {
          const kmlFormat = new KML();
          const parsedFeatures = kmlFormat.readFeatures(text, {
            featureProjection: "EPSG:3857",
          });

          const geojsonFormat = new GeoJSON();
          const geojsonText = geojsonFormat.writeFeatures(parsedFeatures);
          setSavedGeojsonData(geojsonText);

          setFeatures(parsedFeatures);
          setError(null);
          setShowUpload(false);
        } catch (error) {
          console.error(error);
          setError("فایل KML نامعتبر است");
        }
      };
      reader.onerror = () => setError("خطا در خواندن فایل KML");
      reader.readAsText(kmlFile);
    } else {
      setError("لطفاً فایل GeoJSON، Shapefile یا KML آپلود کنید");
    }
  }, []);

  const zoomToFeature = useCallback(
    (feature) => {
      if (!map || !feature) return;
      const geometry = feature.getGeometry();
      if (geometry) {
        map.getView().fit(geometry.getExtent(), {
          padding: [100, 100, 100, 100],
          duration: 1000,
          maxZoom: 16,
        });
      }
    },
    [map]
  );

  useEffect(() => {
    setFilteredFeatures(features);
    const keys = features.length
      ? Object.keys(features[0].getProperties()).filter((k) => k !== "geometry")
      : [];
    setAttributeKeys(keys);
  }, [features]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 3D Mode */}
      {show3D && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 5000,
            background: "white",
          }}
        >
          <button
            onClick={() => setShow3D(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: 5001,
              background: "linear-gradient(135deg, #C2185B 0%, #AD1457 100%)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              transition: "all 0.2s",
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
            ❌ بازگشت به 2D
          </button>
          <Cesium3DViewer features={features} />
        </div>
      )}

      {/* 2D Mode */}
      {!show3D && (
        <>
          {/* نقشه */}
          <div style={{ flex: 1, width: "100%", height: "100%", position: "relative" }}>
            <MapContainer
              map={map}
              setMap={setMap}
              features={features}
              setFeatures={setFeatures}
              filteredFeatures={filteredFeatures}
              setFilteredFeatures={setFilteredFeatures}
              selectedFeatures={selectedFeatures}
              setSelectedFeatures={setSelectedFeatures}
              setAttributeKeys={setAttributeKeys}
              setMouseCoord={setMouseCoord}
              setError={setError}
              layer={layer}
              drawType={drawType}
              isDrawing={isDrawing}
              layerVisibility={layerVisibility}
              drawSource={drawSource}
              savedGeojsonData={savedGeojsonData}
              setSavedGeojsonData={setSavedGeojsonData}
            />

            {/* مختصات */}
            {mouseCoord && (
              <div
                style={{
                  position: "absolute",
                  bottom: "15px",
                  left: "15px",
                  background: "rgba(255, 255, 255, 0.95)",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                  zIndex: 8000,
                  direction: "ltr",
                  border: "1px solid #ddd",
                }}
              >
                <strong>طول:</strong> {mouseCoord[0].toFixed(5)} |{" "}
                <strong>عرض:</strong> {mouseCoord[1].toFixed(5)}
              </div>
            )}
          </div>

          {/* دکمه‌ها */}
          <ControlButtons
            map={map}
            setShowFilter={setShowFilter}
            setShowTable={setShowTable}
            setShowUpload={setShowUpload}
            setShowDrawPanel={setShowDrawPanel}
            setShow3D={setShow3D}
          />

          {/* تعویض لایه */}
          <LayerSwitcher map={map} />

          {/* پنل‌های Draggable */}
          {showUpload && (
            <FileUploadBox
              onFileUpload={handleFileUpload}
              onClose={() => setShowUpload(false)}
            />
          )}

          {showFilter && (
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              filterLogic={filterLogic}
              setFilterLogic={setFilterLogic}
              applyFilters={applyFilters}
              clearFilters={clearFilters}
              attributeKeys={attributeKeys}
              onClose={() => setShowFilter(false)}
            />
          )}

          {showTable && (
            <FeatureTable
              filteredFeatures={filteredFeatures}
              zoomToFeature={zoomToFeature}
              onClose={() => setShowTable(false)}
              isFiltered={
                filteredFeatures.length < features.length && features.length > 0
              }
            />
          )}

          {showDrawPanel && (
            <DrawPanel
              map={map}
              drawType={drawType}
              setDrawType={setDrawType}
              isDrawing={isDrawing}
              setIsDrawing={setIsDrawing}
              setError={setError}
              drawSource={drawSource}
              showDrawPanel={showDrawPanel}
              onClose={() => setShowDrawPanel(false)}
            />
          )}
        </>
      )}

      {/* خطا */}
      {error && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "linear-gradient(135deg, #C2185B 0%, #AD1457 100%)",
            color: "white",
            padding: "16px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "15px",
            maxWidth: "450px",
            animation: "slideIn 0.3s ease",
          }}
        >
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <span style={{ flex: 1, fontSize: "14px" }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
              padding: "0 8px",
              lineHeight: 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.3)")}
            onMouseLeave={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.2)")}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadableMap;
