import React, { useMemo, useState, useEffect } from 'react';

function LoadingScreen({ message = 'Loading your dashboard experience...' }) {
  const [loadingText, setLoadingText] = useState('Initializing');

  useEffect(() => {
    const texts = ['Initializing', 'Loading Assets', 'Preparing Interface', 'Almost Ready'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 25 }).map(() => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${8 + Math.random() * 4}s`,
      })),
    [],
  );

  return (
    <div className="loading-container">
      <div className="particles">
        {particles.map((particle, index) => (
          <div
            key={index}
            className="particle"
            style={{
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      <div className="loading-content">
        <div className="coin-loader">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="loading-coin"
              style={{
                animationDelay: `${index * 0.15}s`,
              }}
            >
              <div className="coin-face">
                <div className="coin-star">G</div>
              </div>
            </div>
          ))}
        </div>

        <div className="loading-status">
          <h2 className="loading-title">{loadingText}</h2>
          <div className="loading-dots">
            <span style={{ animationDelay: '0s' }}>.</span>
            <span style={{ animationDelay: '0.2s' }}>.</span>
            <span style={{ animationDelay: '0.4s' }}>.</span>
          </div>
          <p className="loading-subtext">{message}</p>
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .loading-container {
          position: fixed;
          inset: 0;
          z-index: 99;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #FFD700;
          border-radius: 50%;
          opacity: 0;
          animation: float-particle linear infinite;
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
        }

        @keyframes float-particle {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0;
          }
        }

        .loading-content {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .coin-loader {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 60px;
          height: 140px;
        }

        .loading-coin {
          width: 120px;
          height: 120px;
          animation: bounce-coin 1.2s ease-in-out infinite;
          filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.5));
        }

        @keyframes bounce-coin {
          0%, 100% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-30px);
          }
          50% {
            transform: translateY(0);
          }
          75% {
            transform: translateY(-15px);
          }
        }

        .coin-face {
          width: 100%;
          height: 100%;
          background:
            radial-gradient(ellipse at 28% 28%, rgba(255, 255, 255, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 30% 30%, #FFED4E 0%, #FFD700 40%, #FFC800 70%, #FFBF00 100%);
          border-radius: 50%;
          border: 5px solid #DAA520;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow:
            0 2px 0 #CC8800,
            0 3px 0 #B8860B,
            0 4px 0 #AA7700,
            0 8px 15px rgba(0, 0, 0, 0.4),
            inset 0 1px 1px rgba(255, 255, 255, 0.5),
            inset 0 -1px 1px rgba(0, 0, 0, 0.15);
          animation: glow-pulse 2s ease-in-out infinite;
        }

        .coin-face::before {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          background: repeating-conic-gradient(
            from 0deg,
            #DAA520 0deg 3deg,
            #B8860B 3deg 6deg
          );
          z-index: -1;
          pointer-events: none;
        }

        .coin-face::after {
          content: '';
          position: absolute;
          inset: 10px;
          border-radius: 50%;
          border: 2px solid rgba(184, 134, 11, 0.5);
          box-shadow:
            inset 0 0 0 1px rgba(218, 165, 32, 0.3);
          pointer-events: none;
        }

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow:
              0 2px 0 #CC8800,
              0 3px 0 #B8860B,
              0 4px 0 #AA7700,
              0 8px 15px rgba(0, 0, 0, 0.4),
              inset 0 1px 1px rgba(255, 255, 255, 0.5),
              inset 0 -1px 1px rgba(0, 0, 0, 0.15),
              0 0 20px rgba(255, 215, 0, 0.4);
          }
          50% {
            box-shadow:
              0 2px 0 #CC8800,
              0 3px 0 #B8860B,
              0 4px 0 #AA7700,
              0 8px 15px rgba(0, 0, 0, 0.4),
              inset 0 1px 1px rgba(255, 255, 255, 0.5),
              inset 0 -1px 1px rgba(0, 0, 0, 0.15),
              0 0 35px rgba(255, 215, 0, 0.7);
          }
        }

        .coin-star {
          font-size: 48px;
          font-weight: 900;
          font-family: 'Orbitron', 'Arial Black', sans-serif;
          color: #B8860B;
          text-shadow:
            1px 1px 0 rgba(255, 255, 255, 0.4),
            -1px -1px 0 rgba(0, 0, 0, 0.3),
            0 2px 3px rgba(0, 0, 0, 0.4);
        }

        .loading-status {
          margin-bottom: 32px;
        }

        .loading-title {
          font-family: 'Orbitron', 'Rajdhani', sans-serif;
          font-size: 28px;
          color: #FFFFFF;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
          letter-spacing: 2px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .loading-dots {
          font-size: 32px;
          color: #FFD700;
          letter-spacing: 4px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loading-dots span {
          animation: dot-bounce 1.4s ease-in-out infinite;
          display: inline-block;
        }

        .loading-subtext {
          margin-top: 12px;
          color: #cbd5e1;
          font-size: 14px;
          letter-spacing: 0.3px;
        }

        @keyframes dot-bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          40% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .progress-section {
          display: flex;
          align-items: center;
          gap: 20px;
          justify-content: center;
          margin-bottom: 40px;
        }

        .progress-bar-container {
          width: 400px;
          max-width: 80vw;
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid rgba(255, 215, 0, 0.3);
          box-shadow:
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(255, 215, 0, 0.2);
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
          background-size: 200% 100%;
          transition: width 0.3s ease-out;
          position: relative;
          animation: shimmer 2s linear infinite;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .progress-shine {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%);
          animation: shine 1.5s ease-in-out infinite;
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .progress-percentage {
          font-family: 'Orbitron', monospace;
          font-size: 18px;
          color: #FFD700;
          font-weight: 600;
          min-width: 50px;
          text-align: left;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }

        @media (max-width: 768px) {
          .coin-loader {
            gap: 12px;
          }

          .loading-coin {
            width: 90px;
            height: 90px;
          }

          .loading-title {
            font-size: 22px;
          }

          .progress-bar-container {
            width: 280px;
          }
        }

        @keyframes ambient-glow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .loading-container::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
          animation: ambient-glow 4s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;
