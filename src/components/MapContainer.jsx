import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Fill, Stroke, Style as OlStyle } from "ol/style";
import { toLonLat, fromLonLat } from "ol/proj";
import "../styles.css";

function MapContainer({
  map,
  setMap,
  features,
  setFeatures,
  filteredFeatures,
  setFilteredFeatures,
  selectedFeatures,
  setSelectedFeatures,
  setAttributeKeys,
  setMouseCoord,
  setError,
  layer,
  drawType,
  isDrawing,
  layerVisibility,
  drawSource,
  savedGeojsonData,
  setSavedGeojsonData,
}) {
  const mapRef = useRef();
  const vectorLayerRef = useRef(null);
  const filteredLayerRef = useRef(null);
  const drawLayerRef = useRef(null);
  const osmLayerRef = useRef(null);
  const satelliteLayerRef = useRef(null);

  const tehranCoord = useMemo(() => fromLonLat([51.389, 35.6892]), []);

  const layers = useMemo(
    () => ({
      osm: new TileLayer({
        source: new OSM(),
        zIndex: 0,
        visible: true,
      }),
      satellite: new TileLayer({
        source: new XYZ({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          maxZoom: 19,
        }),
        zIndex: 0,
        visible: false,
      }),
    }),
    []
  );

  const defaultStyle = useMemo(
    () =>
      new OlStyle({
        stroke: new Stroke({ color: "#1E88E5", width: 2.5 }),
        fill: new Fill({ color: "rgba(30, 136, 229, 0.25)" }),
      }),
    []
  );

  const filteredStyle = useMemo(
    () =>
      new OlStyle({
        stroke: new Stroke({ color: "#FF6F00", width: 3.5 }),
        fill: new Fill({ color: "rgba(255, 111, 0, 0.4)" }),
      }),
    []
  );

  const selectedStyle = useMemo(
    () =>
      new OlStyle({
        stroke: new Stroke({ color: "#C2185B", width: 3.5 }),
        fill: new Fill({ color: "rgba(194, 24, 91, 0.45)" }),
      }),
    []
  );

  const drawStyle = useMemo(
    () =>
      new OlStyle({
        stroke: new Stroke({ color: "#FF6F00", width: 3 }),
        fill: new Fill({ color: "rgba(255, 111, 0, 0.3)" }),
      }),
    []
  );

  const loadGeoJSON = useCallback(
    (geojsonText, mapInstance = map) => {
      if (!mapInstance) return;

      try {
        const parsedFeatures = new GeoJSON().readFeatures(geojsonText, {
          featureProjection: "EPSG:3857",
        });

        const source = new VectorSource({ features: parsedFeatures });
        const vectorLayer = new VectorLayer({
          source,
          style: defaultStyle,
          zIndex: 10,
        });

        if (vectorLayerRef.current) {
          mapInstance.removeLayer(vectorLayerRef.current);
        }

        mapInstance.addLayer(vectorLayer);
        vectorLayerRef.current = vectorLayer;

        setFeatures(parsedFeatures);
        setFilteredFeatures(parsedFeatures);

        const keys = parsedFeatures.length
          ? Object.keys(parsedFeatures[0].getProperties()).filter(
              (k) => k !== "geometry"
            )
          : [];
        setAttributeKeys(keys);

        const extent = source.getExtent();
        mapInstance.getView().fit(extent, {
          padding: [100, 100, 100, 100],
          duration: 1000,
          maxZoom: 16,
        });

        setError(null);
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
        setError("فایل نامعتبر است");
      }
    },
    [defaultStyle, setFeatures, setFilteredFeatures, setAttributeKeys, setError, map]
  );

  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = new Map({
      target: mapRef.current,
      layers: [],
      view: new View({ center: tehranCoord, zoom: 11 }),
      controls: [],
    });

    osmLayerRef.current = layers.osm;
    satelliteLayerRef.current = layers.satellite;

    const drawLayer = new VectorLayer({
      source: drawSource,
      style: drawStyle,
      zIndex: 20,
    });
    drawLayerRef.current = drawLayer;

    mapInstance.addLayer(osmLayerRef.current);
    mapInstance.addLayer(satelliteLayerRef.current);
    mapInstance.addLayer(drawLayer);

    mapInstance.on("pointermove", (evt) => {
      const coord = toLonLat(evt.coordinate);
      setMouseCoord(coord);
    });

    setMap(mapInstance);

    if (savedGeojsonData) {
      setTimeout(() => loadGeoJSON(savedGeojsonData, mapInstance), 100);
    }

    return () => {
      mapInstance.setTarget(null);
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    if (filteredLayerRef.current) {
      map.removeLayer(filteredLayerRef.current);
      filteredLayerRef.current = null;
    }

    if (
      filteredFeatures &&
      filteredFeatures.length > 0 &&
      filteredFeatures.length < features.length
    ) {
      const filteredSource = new VectorSource({ features: filteredFeatures });
      const filteredLayer = new VectorLayer({
        source: filteredSource,
        style: filteredStyle,
        zIndex: 15,
      });

      map.addLayer(filteredLayer);
      filteredLayerRef.current = filteredLayer;

      const extent = filteredSource.getExtent();
      map.getView().fit(extent, {
        padding: [100, 100, 100, 100],
        duration: 1000,
        maxZoom: 16,
      });
    }
  }, [map, filteredFeatures, features, filteredStyle]);

  useEffect(() => {
    if (!map || !features.length) return;

    const source = new VectorSource({ features });
    const vectorLayer = new VectorLayer({
      source,
      style: defaultStyle,
      zIndex: 10,
    });

    if (vectorLayerRef.current) {
      map.removeLayer(vectorLayerRef.current);
    }

    map.addLayer(vectorLayer);
    vectorLayerRef.current = vectorLayer;

    const extent = source.getExtent();
    map.getView().fit(extent, {
      padding: [100, 100, 100, 100],
      duration: 1000,
      maxZoom: 16,
    });

    const keys = features.length
      ? Object.keys(features[0].getProperties()).filter((k) => k !== "geometry")
      : [];
    setAttributeKeys(keys);
  }, [map, features, defaultStyle, setAttributeKeys]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        zIndex: 1,
      }}
    />
  );
}

export default MapContainer;
