import GeoProject from "../GeoProject";

function AnalysisStatus({ status }) {
  let message = "";
  let color = "";
  let emoji = "";

  switch (status) {
    case "processing":
      message = "در حال تحلیل...";
      color = "#ffecb3"; // زرد
      emoji = "⏳";
      break;
    case "success":
      message = "تحلیل با موفقیت انجام شد ✅";
      color = "#c8e6c9"; // سبز
      emoji = "✅";
      break;
    case "error":
      message = "خطا در تحلیل ❌";
      color = "#ffcdd2"; // قرمز
      emoji = "❌";
      break;
    default:
      message = "وضعیت نامشخص";
      color = "#eeeeee"; // خاکستری
      emoji = "❓";
      break;
  }

  return (
    <div className="GeoProject"
      style={{
        marginTop: "1rem",
        padding: "1rem",
        borderRadius: "8px",
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "start",
        fontFamily: "Tahoma",
        height: "60px", // ارتفاع یکسان برای همه
        lineHeight: "1.4",
        gap: "0.5rem",
      }}
    >
      <span style={{ fontSize: "1.5rem", textAlign:"center"}}>{emoji}</span>
      <span style={{ marginLeft: "0.5rem", fontSize: "1rem" }}>{message}</span>
    </div>
  );
}

export default AnalysisStatus;
