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
  attributeKeys 
}) {
  const [newFilter, setNewFilter] = useState({ 
    key: "", 
    operator: "eq", 
    value: "" 
  });

  const operatorLabels = useMemo(() => ({
    eq: "برابر",
    gt: "بزرگتر",
    lt: "کوچکتر",
    contains: "شامل"
  }), []);

  const addFilter = useCallback(() => {
    if (newFilter.key && newFilter.operator && newFilter.value) {
      setFilters(prev => [...prev, { ...newFilter, id: Date.now() }]);
      setNewFilter({ key: "", operator: "eq", value: "" });
    }
  }, [newFilter, setFilters]);

  const removeFilter = useCallback((filterId) => {
    setFilters(prev => prev.filter(filter => filter.id !== filterId));
  }, [setFilters]);

  return (
    <DraggableWrapper title="فیلتر">
      <div className="filter-panel">
        {/* Current filters */}
        <div className="filter-list">
          {filters.map((filter) => (
            <div key={filter.id || `${filter.key}-${filter.value}`} className="filter-item">
              <span className="filter-key">{filter.key}</span>
              <span className="filter-operator">
                {operatorLabels[filter.operator] || filter.operator}
              </span>
              <span className="filter-value">{filter.value}</span>
              <button 
                onClick={() => removeFilter(filter.id)}
                className="remove-btn"
                aria-label="حذف فیلتر"
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Add new filter */}
        <div className="add-filter">
          <select
            value={newFilter.key}
            onChange={(e) => setNewFilter(prev => ({ ...prev, key: e.target.value }))}
            className="filter-select"
          >
            <option value="">انتخاب ویژگی</option>
            {attributeKeys.map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>

          <select
            value={newFilter.operator}
            onChange={(e) => setNewFilter(prev => ({ ...prev, operator: e.target.value }))}
            className="filter-select"
          >
            {Object.entries(operatorLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <input
            type="text"
            value={newFilter.value}
            onChange={(e) => setNewFilter(prev => ({ ...prev, value: e.target.value }))}
            placeholder="مقدار"
            className="filter-input"
          />

          <button 
            onClick={addFilter} 
            className="add-btn"
            type="button"
          >
            افزودن
          </button>
        </div>

        {/* Logic and actions */}
        <div className="filter-controls">
          <div className="logic-control">
            <label>منطق:</label>
            <select 
              value={filterLogic} 
              onChange={(e) => setFilterLogic(e.target.value)}
              className="logic-select"
            >
              <option value="AND">و</option>
              <option value="OR">یا</option>
            </select>
          </div>

          <div className="action-buttons">
            <button 
              onClick={() => applyFilters(filters)} 
              className="apply-btn"
              type="button"
            >
              اعمال
            </button>
            <button 
              onClick={clearFilters} 
              className="clear-btn"
              type="button"
            >
              پاک کردن
            </button>
          </div>
        </div>
      </div>
    </DraggableWrapper>
  );
}

export default FilterPanel;
