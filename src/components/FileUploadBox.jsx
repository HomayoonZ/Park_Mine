import { useCallback } from "react";
import DraggableWrapper from "./DraggableWrapper";
import "../styles.css";

function FileUploadBox({ onFileUpload, onClose }) {
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileUpload(files);
      }
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback(
    (e) => {
      const files = e.target.files;
      if (files.length > 0) {
        onFileUpload(files);
      }
    },
    [onFileUpload]
  );

  return (
    <DraggableWrapper
      title="📁 آپلود فایل"
      onClose={onClose}
      defaultPosition={{ x: 300, y: 100 }}
      minWidth="420px"
      maxWidth="520px"
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "3px dashed #1E88E5",
          borderRadius: "12px",
          padding: "50px 30px",
          textAlign: "center",
          background: "linear-gradient(135deg, #f8fbff 0%, #e3f2fd 100%)",
          transition: "all 0.3s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#26A69A";
          e.currentTarget.style.background =
            "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#1E88E5";
          e.currentTarget.style.background =
            "linear-gradient(135deg, #f8fbff 0%, #e3f2fd 100%)";
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>📂</div>
        <p
          style={{
            color: "#1E88E5",
            fontWeight: "600",
            marginBottom: "10px",
            fontSize: "16px",
          }}
        >
          فایل رو اینجا رها کنید
        </p>
        <p style={{ color: "#666", fontSize: "13px", marginBottom: "20px" }}>
          یا دکمه زیر رو کلیک کنید
        </p>
        <label
          htmlFor="file-input"
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)",
            color: "white",
            padding: "12px 32px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(30, 136, 229, 0.3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 16px rgba(30, 136, 229, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(30, 136, 229, 0.3)";
          }}
        >
          📎 انتخاب فایل
        </label>
        <input
          id="file-input"
          type="file"
          multiple
          accept=".geojson,.shp,.dbf,.shx,.kml"
          onChange={handleFileInput}
          style={{ display: "none" }}
        />
        <p style={{ color: "#999", fontSize: "11px", marginTop: "20px", lineHeight: "1.6" }}>
          <strong>فرمت‌های پشتیبانی شده:</strong>
          <br />
          GeoJSON | Shapefile (.shp, .dbf, .shx) | KML
        </p>
      </div>
    </DraggableWrapper>
  );
}

export default FileUploadBox;
