import { useState, useEffect, useCallback } from "react";
import "./styles.css";
import "./GeoProject.css";
import MapContainer from "./components/MapContainer";
import NavBar from "./components/NavBar";
import ControlButtons from "./components/ControlButtons";
import LayerControl from "./components/LayerControl";
import DrawPanel from "./components/DrawPanel";
import FileUploadBox from "./components/FileUploadBox";
import FilterPanel from "./components/FilterPanel";
import FeatureTable from "./components/FeatureTable";
import CesiumMap from "./components/CesiumMap";
import AuthModal from "./components/AuthModal";
import Footer from "./components/Footer";
import shp from "shpjs";
import { GeoJSON } from "ol/format";

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
  const [showLayerControl, setShowLayerControl] = useState(false);
  const [showDrawPanel, setShowDrawPanel] = useState(false);
  const [showCesium, setShowCesium] = useState(false);
  const [mouseCoord, setMouseCoord] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [layer, setLayer] = useState("osm");
  const [drawType, setDrawType] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState({ main: true, drawings: true });

  const applyFilters = useCallback((currentFilters) => {
    if (!currentFilters || !currentFilters.length) {
      setFilteredFeatures(features);
      return;
    }
    const newFiltered = features.filter((f) => {
      const props = f.getProperties();
      const evaluations = currentFilters.map((filt) => {
        const val = props[filt.key];
        if (val === undefined || val === null) return false;
        const filterValue = isNaN(filt.value) ? filt.value : parseFloat(filt.value);
        const propValue = isNaN(val) ? val : parseFloat(val);
        switch (filt.operator) {
          case "eq":
            return String(propValue).toLowerCase() === String(filterValue).toLowerCase();
          case "gt":
            return Number(propValue) > Number(filterValue);
          case "lt":
            return Number(propValue) < Number(filterValue);
          case "contains":
            return String(propValue).toLowerCase().includes(String(filterValue).toLowerCase());
          default:
            return false;
        }
      });
      return filterLogic === "AND" ? evaluations.every(Boolean) : evaluations.some(Boolean);
    });
    setFilteredFeatures(newFiltered);
  }, [filterLogic, features]);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setFilteredFeatures(features);
  }, [features]);

  const handleFileUpload = useCallback((files) => {
    const fileList = Array.from(files);
    const isShapefile = fileList.some((file) => file.name.endsWith(".shp") || file.name.endsWith(".dbf") || file.name.endsWith(".shx"));
    const isGeojson = fileList.some((file) => file.name.endsWith(".geojson"));

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
          localStorage.setItem("geojson", geojsonText);
          setFeatures(new GeoJSON().readFeatures(geojsonText, { featureProjection: "EPSG:3857" }));
        } catch (error) {
          setError("خطا در خواندن فایل Shapefile");
        }
      };
      reader.onerror = () => setError("خطا در خواندن فایل");
      reader.readAsArrayBuffer(shpFile);
    } else if (isGeojson) {
      const geojsonFile = fileList.find((file) => file.name.endsWith(".geojson"));
      if (!geojsonFile) {
        setError("لطفاً فایل GeoJSON یا Shapefile آپلود کنید");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        localStorage.setItem("geojson", text);
        setFeatures(new GeoJSON().readFeatures(text, { featureProjection: "EPSG:3857" }));
      };
      reader.onerror = () => setError("خطا در خواندن فایل");
      reader.readAsText(geojsonFile);
    } else {
      setError("لطفاً فایل GeoJSON یا Shapefile آپلود کنید");
    }
  }, [setError, setFeatures]);

  useEffect(() => {
    setFilteredFeatures(features);
    const keys = features.length ? Object.keys(features[0].getProperties()).filter((k) => k !== "geometry") : [];
    setAttributeKeys(keys);
  }, [features]);

  return (
    <div className="d-flex flex-column min-vh-100 GeoProject">
      <NavBar user={user} setUser={setUser} setShowLoginModal={setShowLoginModal} setShowCesium={setShowCesium} />
      <div className="container-fluid py-3 flex-grow-1">
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}
        <ControlButtons
          map={map}
          setShowFilter={setShowFilter}
          setShowTable={setShowTable}
          setShowUpload={setShowUpload}
          setShowLayerControl={setShowLayerControl}
          setShowDrawPanel={setShowDrawPanel}
          setShowCesium={setShowCesium}
        />
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
          setLayer={setLayer}
          drawType={drawType}
          setDrawType={setDrawType}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          layerVisibility={layerVisibility}
          setLayerVisibility={setLayerVisibility}
          handleFileUpload={handleFileUpload}
        />
        {showLayerControl && (
          <LayerControl layer={layer} setLayer={setLayer} layerVisibility={layerVisibility} setLayerVisibility={setLayerVisibility} />
        )}
        {showDrawPanel && (
          <DrawPanel
            map={map}
            drawType={drawType}
            setDrawType={setDrawType}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
            setError={setError}
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
          />
        )}
        {showTable && (
          <FeatureTable
            filteredFeatures={filteredFeatures}
            zoomToFeature={(feature) => map?.getView().fit(feature.getGeometry().getExtent(), { padding: [50, 50, 50, 50], maxZoom: 17, duration: 1000 })}
          />
        )}
        {showUpload && <FileUploadBox onFileUpload={handleFileUpload} />}
        {showCesium && <CesiumMap onClose={() => setShowCesium(false)} />}
        {mouseCoord && (
          <div className="text-muted small mt-2">
            <i className="fas fa-map-pin me-2"></i>طول: {mouseCoord[0].toFixed(5)}، عرض: {mouseCoord[1].toFixed(5)}
          </div>
        )}
      </div>
      <Footer />
      <AuthModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={(data) => {
          if (data.username && data.password) {
            setUser({ name: data.username });
            setShowLoginModal(false);
          } else {
            setError("نام کاربری و رمز عبور لازم است");
          }
        }}
        onRegister={(data) => {
          if (data.name && data.email && data.password) {
            setUser({ name: data.name });
            setShowLoginModal(false);
          } else {
            setError("تمام فیلدها را پر کنید");
          }
        }}
      />
    </div>
  );
}

export default UploadableMap;