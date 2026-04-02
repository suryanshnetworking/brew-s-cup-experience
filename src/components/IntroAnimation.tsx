import { useState, useEffect } from "react";
import kettleImg from "@/assets/kettle.png";
import cupImg from "@/assets/cup.png";

export default function IntroAnimation() {
  const [phase, setPhase] = useState(0); // 0=enter, 1=tilt+pour, 2=rotate+text, 3=zoomout, 4=done
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1200),   // After kettle+cup enter
      setTimeout(() => setPhase(2), 3000),    // After pour
      setTimeout(() => setPhase(3), 4300),    // After text appears
      setTimeout(() => { setPhase(4); setVisible(false); }, 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!visible) return null;

  return (
    <>
      <div className={`intro-overlay ${phase >= 3 ? "scene-container zoom-out" : ""}`}>
        {/* Kettle */}
        <img
          src={kettleImg}
          alt="Coffee kettle"
          className={`intro-kettle ${phase >= 1 ? "tilt" : ""}`}
        />

        {/* Pour stream */}
        {phase >= 1 && phase < 3 && <div className="pour-stream" />}

        {/* Cup */}
        <img
          src={cupImg}
          alt="Coffee cup"
          className={`intro-cup ${phase >= 2 ? "rotate" : ""}`}
        />

        {/* Brew's Cup text */}
        {phase >= 2 && (
          <div className={`brew-text ${phase >= 2 ? "show" : ""}`}>
            Brew's Cup
          </div>
        )}
      </div>

      {/* White flash */}
      {phase >= 3 && <div className={`flash-overlay ${phase >= 3 ? "flash" : ""}`} />}
    </>
  );
}
