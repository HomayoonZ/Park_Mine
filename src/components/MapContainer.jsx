import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Fill, Stroke, Style as OlStyle } from "ol/style";
import { toLonLat, fromLonLat } from "ol/proj";
import "../styles.css";

function MapContainer({ map, setMap, features, setFeatures, filteredFeatures, setFilteredFeatures, selectedFeatures, setSelectedFeatures, setAttributeKeys, setMouseCoord, setError, layer, setLayer, drawType, setDrawType, isDrawing, setIsDrawing, layerVisibility, setLayerVisibility, handleFileUpload }) {
  const mapRef = useRef();
  const vectorLayerRef = useRef(null);
  const drawLayerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [drawSource] = useState(() => new VectorSource());
  const tehranCoord = useMemo(() => fromLonLat([51.3890, 35.6892]), []);

  const layers = useMemo(() => ({
    osm: new TileLayer({ source: new OSM(), zIndex: 0 }),
  }), []);

  const defaultStyle = useMemo(() => new OlStyle({
    stroke: new Stroke({ color: "#1E88E5", width: 2 }), // فیروزه‌ای
    fill: new Fill({ color: "rgba(30, 136, 229, 0.3)" }),
  }), []);

  const selectedStyle = useMemo(() => new OlStyle({
    stroke: new Stroke({ color: "#C2185B", width: 3 }), // یاقوتی
    fill: new Fill({ color: "rgba(194, 24, 91, 0.4)" }),
  }), []);

  const drawStyle = useMemo(() => new OlStyle({
    stroke: new Stroke({ color: "#FF6F00", width: 2 }), // کهربایی
    fill: new Fill({ color: "rgba(255, 111, 0, 0.3)" }),
  }), []);

  const loadGeoJSON = useCallback((geojsonText, mapInstance = map) => {
    try {
      const parsedFeatures = new GeoJSON().readFeatures(geojsonText, { featureProjection: "EPSG:3857" });
      const source = new VectorSource({ features: parsedFeatures });
      const vectorLayer = new VectorLayer({ source, style: defaultStyle });
      if (vectorLayerRef.current && mapInstance) mapInstance.removeLayer(vectorLayerRef.current);
      mapInstance.addLayer(vectorLayer);
      vectorLayerRef.current = vectorLayer;
      setFeatures(parsedFeatures);
      setFilteredFeatures(parsedFeatures || []);
      const keys = parsedFeatures.length ? Object.keys(parsedFeatures[0].getProperties()).filter((k) => k !== "geometry") : [];
      setAttributeKeys(keys);
      const extent = source.getExtent();
      mapInstance.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
      setError(null);
    } catch (error) {
      setError("فایل GeoJSON، Shapefile یا MDB نامعتبر است");
    }
  }, [defaultStyle, setFeatures, setFilteredFeatures, setAttributeKeys, setError]);

  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = new Map({
      target: mapRef.current,
      layers: [],
      view: new View({ center: tehranCoord, zoom: 11 }),
      controls: [], // حذف کنترل‌های پیش‌فرض
    });

    tileLayerRef.current = layers.osm;
    const drawLayer = new VectorLayer({ source: drawSource, style: drawStyle });
    drawLayerRef.current = drawLayer;

    mapInstance.addLayer(tileLayerRef.current);
    mapInstance.addLayer(drawLayer);

    mapInstance.on("pointermove", (evt) => {
      const coord = toLonLat(evt.coordinate);
      setMouseCoord(coord);
    });

    setMap(mapInstance);

    const savedGeojson = localStorage.getItem("geojson");
    if (savedGeojson) loadGeoJSON(savedGeojson);

    const savedDrawings = localStorage.getItem("drawings");
    if (savedDrawings) {
      const drawFeatures = new GeoJSON().readFeatures(savedDrawings, { featureProjection: "EPSG:3857" });
      drawSource.addFeatures(drawFeatures);
    }

    return () => mapInstance.setTarget(null);
  }, [drawSource, drawStyle, loadGeoJSON, setMap, setMouseCoord, tehranCoord]);

  useEffect(() => {
    if (!map) return;
    map.getLayers().clear();
    map.addLayer(tileLayerRef.current);
    if (vectorLayerRef.current && layerVisibility.main) map.addLayer(vectorLayerRef.current);
    if (drawLayerRef.current && layerVisibility.drawings) map.addLayer(drawLayerRef.current);
  }, [map, layerVisibility]);

  useEffect(() => {
    if (!map || !features.length) return;
    const source = new VectorSource({ features });
    const vectorLayer = new VectorLayer({ source, style: defaultStyle });
    if (vectorLayerRef.current) map.removeLayer(vectorLayerRef.current);
    map.addLayer(vectorLayer);
    vectorLayerRef.current = vectorLayer;
    const extent = source.getExtent();
    map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
    const keys = features.length ? Object.keys(features[0].getProperties()).filter((k) => k !== "geometry") : [];
    setAttributeKeys(keys);
  }, [map, features, defaultStyle, setAttributeKeys]);

  useEffect(() => {
    if (!vectorLayerRef.current) return;
    const source = vectorLayerRef.current.getSource();
    source.forEachFeature((feature) => {
      feature.setStyle(selectedFeatures.includes(feature) ? selectedStyle : defaultStyle);
    });
  }, [selectedFeatures, defaultStyle, selectedStyle]);

  return <div className="map-container" ref={mapRef} />;
}

export default MapContainer;