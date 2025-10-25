import { useState } from "react";

function CounterBox() {
  const [count, setCount] = useState(0);

  const increase = () => setCount(count + 1);
  const decrease = () => setCount(count - 1);

  return (
    <div style={{
      padding: "1rem",
      border: "1px solid #ccc",
      marginTop: "1rem",
      borderRadius: "8px"
    }}>
      <h3>شمارنده: {count}</h3>
      <button onClick={increase} style={{ marginLeft: "1rem" }}>افزایش ➕</button>
      <button onClick={decrease} >کاهش ➖</button>
    </div>
  );
}

export default CounterBox;
