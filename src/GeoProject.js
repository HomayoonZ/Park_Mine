import UploadableMap from "./UploadableMap";
import "@fontsource/vazir";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import "./GeoProject.css";

const GeoProject = () => {
  return (
    <div className="GeoProject">
      <UploadableMap />
    </div>
  );
};

export default GeoProject;
