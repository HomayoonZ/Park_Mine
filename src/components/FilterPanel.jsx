import { useState, useCallback, useMemo } from "react";
import DraggableWrapper from "./DraggableWrapper";
import "../styles.css";

function FilterPanel({
  filters,
  setFilters,
  filterLogic,
  setFilterLogic,
  applyFilters,
  clearFilters,
  attributeKeys,
  onClose,
}) {
  const [newFilter, setNewFilter] = useState({
    key: "",
    operator: "eq",
    value: "",
  });

  const operatorLabels = useMemo(
    () => ({
      eq: "برابر",
      gt: "بزرگتر",
      lt: "کوچکتر",
      contains: "شامل",
    }),
    []
  );

  const addFilter = useCallback(() => {
    if (newFilter.key && newFilter.operator && newFilter.value) {
      setFilters((prev) => [...prev, { ...newFilter, id: Date.now() }]);
      setNewFilter({ key: "", operator: "eq", value: "" });
    }
  }, [newFilter, setFilters]);

  const removeFilter = useCallback(
    (filterId) => {
      const updated = filters.filter((f) => f.id !== filterId);
      setFilters(updated);
    },
    [filters, setFilters]
  );

  const inputStyle = {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
    transition: "border 0.2s",
    fontFamily: "inherit",
  };

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s",
  };

  return (
    <DraggableWrapper 
      title="🔍 فیلتر داده‌ها" 
      onClose={onClose} 
      defaultPosition={{ x: 400, y: 20 }}
      minWidth="380px"
      maxWidth="500px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* فیلترهای فعال */}
        {filters.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#263238" }}>
              ✓ فیلترهای اعمال شده ({filters.length}):
            </div>
            {filters.map((filter) => (
              <div
                key={filter.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 12px",
                  background: "#f5f5f5",
                  borderRadius: "8px",
                  fontSize: "12px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <span style={{ fontWeight: "600", color: "#1E88E5", minWidth: "60px" }}>
                  {filter.key}
                </span>
                <span style={{ color: "#999" }}>{operatorLabels[filter.operator]}</span>
                <span style={{ fontWeight: "500", color: "#263238" }}>{filter.value}</span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  style={{
                    ...buttonStyle,
                    background: "#ffebee",
                    color: "#C2185B",
                    marginLeft: "auto",
                    padding: "4px 10px",
                    fontSize: "12px",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* افزودن فیلتر جدید */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#263238" }}>
            + افزودن فیلتر جدید:
          </div>

          <select
            value={newFilter.key}
            onChange={(e) => setNewFilter((p) => ({ ...p, key: e.target.value }))}
            style={inputStyle}
          >
            <option value="">انتخاب ویژگی</option>
            {attributeKeys && attributeKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>

          <select
            value={newFilter.operator}
            onChange={(e) => setNewFilter((p) => ({ ...p, operator: e.target.value }))}
            style={inputStyle}
          >
            {Object.entries(operatorLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={newFilter.value}
            onChange={(e) => setNewFilter((p) => ({ ...p, value: e.target.value }))}
            onKeyPress={(e) => e.key === "Enter" && addFilter()}
            placeholder="مقدار فیلتر"
            style={inputStyle}
          />

          <button
            onClick={addFilter}
            style={{
              ...buttonStyle,
              background: "linear-gradient(135deg, #26A69A 0%, #00897B 100%)",
              color: "white",
              fontWeight: "600",
            }}
          >
            ➕ افزودن فیلتر
          </button>
        </div>

        {/* منطق فیلترها */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#263238" }}>
            منطق فیلترها:
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setFilterLogic("AND")}
              style={{
                ...buttonStyle,
                flex: 1,
                background: filterLogic === "AND" ? "linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)" : "#f5f5f5",
                color: filterLogic === "AND" ? "white" : "#263238",
                fontWeight: "600",
              }}
            >
              و (AND)
            </button>
            <button
              onClick={() => setFilterLogic("OR")}
              style={{
                ...buttonStyle,
                flex: 1,
                background: filterLogic === "OR" ? "linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)" : "#f5f5f5",
                color: filterLogic === "OR" ? "white" : "#263238",
                fontWeight: "600",
              }}
            >
              یا (OR)
            </button>
          </div>
        </div>

        {/* دکمه‌های عمل */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              applyFilters(filters);
            }}
            style={{
              ...buttonStyle,
              background: "linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)",
              color: "white",
              flex: 1,
              fontWeight: "600",
            }}
          >
            ✓ اعمال فیلتر
          </button>
          <button
            onClick={clearFilters}
            style={{
              ...buttonStyle,
              background: "#f5f5f5",
              color: "#263238",
              flex: 1,
              fontWeight: "600",
            }}
          >
            🗑️ پاک کردن
          </button>
        </div>
      </div>
    </DraggableWrapper>
  );
}

export default FilterPanel;
