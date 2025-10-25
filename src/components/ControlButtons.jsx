import "../styles.css";

function ControlButtons({
  map,
  setShowFilter,
  setShowTable,
  setShowUpload,
  setShowDrawPanel,
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

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
    e.currentTarget.style.boxShadow =
      "0 6px 20px rgba(30, 136, 229, 0.5)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0) scale(1)";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(30, 136, 229, 0.3)";
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
      <button
        style={buttonStyle}
        onClick={() => setShowUpload((prev) => !prev)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span style={{ fontSize: "18px" }}>📁</span>
        <span>آپلود فایل</span>
      </button>

      <button
        style={buttonStyle}
        onClick={() => setShowFilter((prev) => !prev)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span style={{ fontSize: "18px" }}>🔍</span>
        <span>فیلتر</span>
      </button>

      <button
        style={buttonStyle}
        onClick={() => setShowTable((prev) => !prev)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span style={{ fontSize: "18px" }}>📊</span>
        <span>جدول داده</span>
      </button>

      <button
        style={buttonStyle}
        onClick={() => setShowDrawPanel((prev) => !prev)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span style={{ fontSize: "18px" }}>✏️</span>
        <span>رسم روی نقشه</span>
      </button>
    </div>
  );
}

export default ControlButtons;
