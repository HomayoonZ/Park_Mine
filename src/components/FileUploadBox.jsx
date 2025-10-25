import { useCallback } from "react";
import "../styles.css";
import "../GeoProject.css";

function FileUploadBox({ onFileUpload }) {
  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData("text/plain", "draggable");
  }, []);

  return (
    <div className="card draggable-panel" draggable="true" onDragStart={handleDragStart}>
      <div className="card-header">آپلود فایل</div>
      <div className="card-body">
        <input type="file" className="form-control" onChange={(e) => onFileUpload(e.target.files)} multiple />
        <p className="text-muted mt-2">فایل رو بکشید و اینجا رها کنید</p>
      </div>
    </div>
  );
}

export default FileUploadBox;