import DraggableWrapper from "./DraggableWrapper";
import "../styles.css";

function FeatureTable({ filteredFeatures, zoomToFeature, onClose, isFiltered }) {
  if (!filteredFeatures || filteredFeatures.length === 0) {
    return (
      <DraggableWrapper 
        title="📊 جدول داده‌ها" 
        onClose={onClose} 
        defaultPosition={{ x: 450, y: 150 }}
      >
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <p style={{ fontSize: "14px" }}>هیچ داده‌ای برای نمایش وجود ندارد</p>
        </div>
      </DraggableWrapper>
    );
  }

  const properties = filteredFeatures[0]
    ? Object.keys(filteredFeatures[0].getProperties()).filter((k) => k !== "geometry")
    : [];

  return (
    <DraggableWrapper
      title={`📊 جدول ${isFiltered ? "(فیلتر شده)" : ""}`}
      onClose={onClose}
      defaultPosition={{ x: 450, y: 150 }}
      minWidth="600px"
      maxWidth="900px"
    >
      {/* هشدار فیلتر */}
      {isFiltered && (
        <div
          style={{
            background: "linear-gradient(135deg, #FF6F00 0%, #F57C00 100%)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
          <span style={{ fontSize: "18px" }}>🔍</span>
          <span>نمایش {filteredFeatures.length} مورد فیلتر شده از کل</span>
        </div>
      )}

      {/* جدول */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr
              style={{
                background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
              }}
            >
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  borderBottom: "2px solid #1E88E5",
                  fontWeight: "600",
                  color: "#263238",
                }}
              >
                #
              </th>
              {properties.slice(0, 5).map((prop) => (
                <th
                  key={prop}
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    borderBottom: "2px solid #1E88E5",
                    fontWeight: "600",
                    color: "#263238",
                  }}
                >
                  {prop}
                </th>
              ))}
              <th
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderBottom: "2px solid #1E88E5",
                  fontWeight: "600",
                  color: "#263238",
                }}
              >
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredFeatures.map((feature, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: "1px solid #f0f0f0",
                  background: index % 2 === 0 ? "white" : "#fafafa",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e3f2fd";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    index % 2 === 0 ? "white" : "#fafafa";
                }}
              >
                <td
                  style={{
                    padding: "12px",
                    fontWeight: "600",
                    color: "#1E88E5",
                  }}
                >
                  {index + 1}
                </td>
                {properties.slice(0, 5).map((prop) => (
                  <td
                    key={prop}
                    style={{
                      padding: "12px",
                      color: "#263238",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "150px",
                    }}
                    title={feature.get(prop)}
                  >
                    {String(feature.get(prop)).substring(0, 30)}
                  </td>
                ))}
                <td
                  style={{
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => zoomToFeature(feature)}
                    style={{
                      background: "linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)",
                      color: "white",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      boxShadow: "0 2px 6px rgba(30, 136, 229, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 4px 10px rgba(30, 136, 229, 0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 2px 6px rgba(30, 136, 229, 0.3)";
                    }}
                  >
                    🔍 نمایش
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* آمار */}
      <div
        style={{
          marginTop: "16px",
          padding: "14px",
          background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#263238",
          textAlign: "center",
          fontWeight: "600",
        }}
      >
        <strong style={{ color: "#1E88E5" }}>کل نتایج:</strong> {filteredFeatures.length}{" "}
        مورد
      </div>
    </DraggableWrapper>
  );
}

export default FeatureTable;
