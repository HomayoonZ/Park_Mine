import "../styles.css";

function ControlButtons({
  map,
  setShowFilter,
  setShowTable,
  setShowUpload,
  setShowDrawPanel,
  setShow3D,
}) {
  const buttonStyle = {
    background: "linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    boxShadow: "0 4px 12px rgba(30, 136, 229, 0.3)",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "150px",
    justifyContent: "center",
  };

  const buttonStyle3D = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 100%)",
    boxShadow: "0 4px 12px rgba(123, 31, 162, 0.3)",
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
    e.currentTarget.style.boxShadow = e.currentTarget.style.background.includes("7B1FA2")
      ? "0 6px 20px rgba(123, 31, 162, 0.5)"
      : "0 6px 20px rgba(30, 136, 229, 0.5)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0) scale(1)";
    e.currentTarget.style.boxShadow = e.currentTarget.style.background.includes("7B1FA2")
      ? "0 4px 12px rgba(123, 31, 162, 0.3)"
      : "0 4px 12px rgba(30, 136, 229, 0.3)";
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 9000,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* آپلود فایل */}
      <button
        style={buttonStyle}
        onClick={() => setShowUpload((prev) => !prev)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="آپلود فایل GeoJSON، Shapefile یا KML"
      >
        <span style={{ fontSize: "18px" }}>📁</span>
        <span>آپلود فایل</span>
      </button>

      {/* فیلتر */}
      <button
        style={buttonStyle}
        onClick={() => setShowFilter((prev) => !prev)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="فیلتر کردن داده‌ها"
      >
        <span style={{ fontSize: "18px" }}>🔍</span>
        <span>فیلتر</span>
      </button>

      {/* جدول داده */}
      <button
        style={buttonStyle}
        onClick={() => setShowTable((prev) => !prev)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="نمایش جدول داده‌های فیلتر شده"
      >
        <span style={{ fontSize: "18px" }}>📊</span>
        <span>جدول داده</span>
      </button>

      {/* رسم روی نقشه */}
      <button
        style={buttonStyle}
        onClick={() => setShowDrawPanel((prev) => !prev)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="رسم نقطه، خط، چندضلعی یا دایره"
      >
        <span style={{ fontSize: "18px" }}>✏️</span>
        <span>رسم روی نقشه</span>
      </button>

      {/* نمایش 3D */}
      <button
        style={buttonStyle3D}
        onClick={() => setShow3D((prev) => !prev)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="نمایش نقشه سه بعدی با Cesium"
      >
        <span style={{ fontSize: "18px" }}>🌐</span>
        <span>نمایش 3D</span>
      </button>

      
    </div>
  );
}

export default ControlButtons;
