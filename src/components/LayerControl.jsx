import DraggableWrapper from "./DraggableWrapper";
import "../styles.css";

function LayerControl({ layer, setLayer, layerVisibility, setLayerVisibility }) {
  return (
    <DraggableWrapper title="کنترل لایه‌ها">
      <div className="card">
        <div className="card-header">
          <i className="fas fa-layer-group me-2"></i>کنترل لایه‌ها
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">بیس‌مپ</label>
            <select className="form-select" value={layer} onChange={(e) => setLayer(e.target.value)}>
              <option value="osm">OSM</option>
            </select>
          </div>
          <div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={layerVisibility.main}
                onChange={() => setLayerVisibility({ ...layerVisibility, main: !layerVisibility.main })}
              />
              <label className="form-check-label">داده‌های اصلی</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={layerVisibility.drawings}
                onChange={() => setLayerVisibility({ ...layerVisibility, drawings: !layerVisibility.drawings })}
              />
              <label className="form-check-label">ترسیمات</label>
            </div>
          </div>
        </div>
      </div>
    </DraggableWrapper>
  );
}

export default LayerControl;