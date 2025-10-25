import "../styles.css";
import { fromLonLat } from "ol/proj";

function ControlButtons({ map, setShowFilter, setShowTable, setShowUpload, setShowLayerControl, setShowDrawPanel, setShowCesium }) {
  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      <button className="btn btn-zoom-in btn-sm" onClick={() => map?.getView().setZoom(map.getView().getZoom() + 1)}>
        <i className="fas fa-plus me-2"></i>بزرگ‌نمایی
      </button>
      <button className="btn btn-zoom-out btn-sm" onClick={() => map?.getView().setZoom(map.getView().getZoom() - 1)}>
        <i className="fas fa-minus me-2"></i>کوچک‌نمایی
      </button>
      <button className="btn btn-tehran btn-sm" onClick={() => map?.getView().setCenter(fromLonLat([51.3890, 35.6892]))}>
        <i className="fas fa-map-marker-alt me-2"></i>تهران
      </button>
      <button className="btn btn-filter btn-sm" onClick={() => setShowFilter((prev) => !prev)}>
        <i className="fas fa-filter me-2"></i>فیلتر
      </button>
      <button className="btn btn-table btn-sm" onClick={() => setShowTable((prev) => !prev)}>
        <i className="fas fa-table me-2"></i>جدول
      </button>
      <button className="btn btn-upload btn-sm" onClick={() => setShowUpload((prev) => !prev)}>
        <i className="fas fa-upload me-2"></i>آپلود
      </button>
      <button className="btn btn-layers btn-sm" onClick={() => setShowLayerControl((prev) => !prev)}>
        <i className="fas fa-layer-group me-2"></i>لایه‌ها
      </button>
      <button className="btn btn-draw btn-sm" onClick={() => setShowDrawPanel((prev) => !prev)}>
        <i className="fas fa-pencil-alt me-2"></i>ترسیم
      </button>
      <button className="btn btn-3d btn-sm" onClick={() => setShowCesium(true)}>
        <i className="fas fa-cube me-2"></i>نقشه سه‌بعدی
      </button>
    </div>
  );
}

export default ControlButtons;