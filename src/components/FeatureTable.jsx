import "../styles.css";
import "../GeoProject.css";

function FeatureTable({ filteredFeatures, zoomToFeature }) {
  return (
    <div className="card draggable-panel" draggable="true">
      <div className="card-header">جدول ویژگی‌ها</div>
      <div className="card-body">
        <table className="table table-striped">
          <thead>
            <tr>
              {filteredFeatures.length > 0 && Object.keys(filteredFeatures[0].getProperties())
                .filter((key) => key !== "geometry")
                .map((key) => (
                  <th key={key}>{key}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredFeatures.map((feature, index) => (
              <tr key={index} onClick={() => zoomToFeature(feature)}>
                {Object.entries(feature.getProperties())
                  .filter(([key]) => key !== "geometry")
                  .map(([key, value]) => (
                    <td key={key}>{value}</td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FeatureTable;