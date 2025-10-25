
import { useState } from "react";

const AnalysisProgress=()=>{
    const [percent, setPercent] = useState(0);

const increase10 = () => setPercent((percent + 10) > 100 ? 0 : percent + 10);
  const reset = () => setPercent(0);

    return(
        <div>
            <h3>نمایش میزان پیشرفت پروژه {percent}</h3>
            <button onClick={increase10} style={{ marginLeft: "1rem" }}>افزایش 10%</button>
            <button onClick={reset} >ریست 🔄</button>
        </div>
    )
}

export default AnalysisProgress;