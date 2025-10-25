import { useState, useRef, useEffect } from "react";

function DraggableWrapper({ 
  children, 
  title, 
  onClose, 
  defaultPosition = { x: 20, y: 20 },
  width = "auto",
  minWidth = "320px",
  maxWidth = "600px"
}) {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef(null);

  const handleMouseDown = (e) => {
    // جلوگیری از drag وقتی روی button کلیک میشه
    if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT" || e.target.tagName === "SELECT") {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = wrapperRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      e.preventDefault();
      
      // محاسبه موقعیت جدید
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;

      // محدود کردن به مرزهای صفحه
      const wrapper = wrapperRef.current;
      if (wrapper) {
        const maxX = window.innerWidth - wrapper.offsetWidth;
        const maxY = window.innerHeight - wrapper.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
      }

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, dragStart]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        background: "white",
        borderRadius: "16px",
        boxShadow: isDragging 
          ? "0 20px 60px rgba(0, 0, 0, 0.5)" 
          : "0 12px 40px rgba(0, 0, 0, 0.3)",
        minWidth: minWidth,
        maxWidth: maxWidth,
        width: width,
        maxHeight: "85vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: isDragging ? "none" : "all 0.3s ease",
        border: "1px solid rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 50%, #26A69A 100%)",
          color: "white",
          padding: "16px 20px",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)",
            pointerEvents: "none",
          }}
        />
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 1 }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
          }}>
            {title.split(" ")[0]}
          </div>
          <span style={{ fontWeight: "600", fontSize: "15px", letterSpacing: "0.3px" }}>
            {title.split(" ").slice(1).join(" ")}
          </span>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.3)";
              e.target.style.transform = "scale(1.1) rotate(90deg)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.transform = "scale(1) rotate(0deg)";
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "3px solid rgba(30, 136, 229, 0.1)" }} />
      
      {/* Content */}
      <div
        style={{
          padding: "20px",
          overflowY: "auto",
          overflowX: "hidden",
          flex: 1,
          background: "linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default DraggableWrapper;
