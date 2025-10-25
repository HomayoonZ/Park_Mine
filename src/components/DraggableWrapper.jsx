import { useRef, useEffect } from "react";
import "../styles.css";

function DraggableWrapper({ title, children }) {
  const dragRef = useRef(null);

  useEffect(() => {
    const element = dragRef.current;
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    const onMouseDown = (e) => {
      initialX = e.clientX - currentX;
      initialY = e.clientY - currentY;
      isDragging = true;
    };

    const onMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        element.style.left = `${currentX}px`;
        element.style.top = `${currentY}px`;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseLeave = () => {
      isDragging = false;
    };

    if (element) {
      element.style.position = "absolute";
      element.style.left = "10px";
      element.style.top = "10px";
      currentX = 10;
      currentY = 10;

      element.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mouseleave", onMouseLeave);

      return () => {
        element.removeEventListener("mousedown", onMouseDown);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("mouseleave", onMouseLeave);
      };
    }
  }, []);

  return (
    <div ref={dragRef} className="draggable-panel">
      {children}
    </div>
  );
}

export default DraggableWrapper;