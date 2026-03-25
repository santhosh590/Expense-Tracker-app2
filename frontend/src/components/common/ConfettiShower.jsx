import { useEffect, useState } from "react";

export default function ConfettiShower() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const colors = ["#6366f1", "#0ea5e9", "#22c55e", "#eab308", "#ec4899", "#a855f7"];
    const newPieces = Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 8 + 6}px`,
      height: `${Math.random() * 12 + 8}px`,
      animationDuration: `${Math.random() * 2.5 + 2.5}s`,
      animationDelay: `${Math.random() * 2}s`,
      rotate: `${Math.random() * 360}deg`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    }));
    
    setPieces(newPieces);

    // Clean up after the longest animation (about 5s)
    const timer = setTimeout(() => {
      setPieces([]);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-container" style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
      pointerEvents: "none", zIndex: 9999, overflow: "hidden"
    }}>
      <style>
        {`
          @keyframes confetti-fall {
            0% { transform: translateY(-20px) rotate(0deg) rotateX(0deg) rotateY(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg) rotateX(360deg) rotateY(360deg); opacity: 0; }
          }
        `}
      </style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          top: -20,
          left: p.left,
          width: p.width,
          height: p.height,
          backgroundColor: p.backgroundColor,
          transform: `rotate(${p.rotate})`,
          animation: `confetti-fall ${p.animationDuration} ease-in ${p.animationDelay} forwards`,
          borderRadius: p.id % 3 === 0 ? "50%" : "2px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }} />
      ))}
    </div>
  );
}
