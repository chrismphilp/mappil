import type { CSSProperties } from 'react';

interface TwinkleStar {
  top: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
  minOpacity: number;
  maxOpacity: number;
}

const containerStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: 0,
};

const baseLayerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: '#020617',
  backgroundImage: `
    radial-gradient(1px 1px at 25px 50px, rgba(255, 255, 255, 0.92), transparent),
    radial-gradient(1px 1px at 75px 120px, rgba(255, 255, 255, 0.74), transparent),
    radial-gradient(2px 2px at 150px 30px, rgba(255, 255, 255, 0.54), transparent),
    radial-gradient(1px 1px at 220px 180px, rgba(255, 255, 255, 0.82), transparent),
    radial-gradient(2px 2px at 280px 90px, rgba(255, 255, 255, 0.64), transparent),
    radial-gradient(1px 1px at 350px 220px, rgba(255, 255, 255, 1), transparent),
    radial-gradient(1px 1px at 410px 40px, rgba(255, 255, 255, 0.92), transparent),
    radial-gradient(2px 2px at 460px 150px, rgba(255, 255, 255, 0.46), transparent)
  `,
  backgroundSize: '500px 500px',
};

const nebulaPrimaryStyle: CSSProperties = {
  position: 'absolute',
  width: '76vmax',
  height: '76vmax',
  top: '-28vmax',
  left: '-22vmax',
  borderRadius: '9999px',
  opacity: 0.9,
  background: `
    radial-gradient(
      circle at 50% 50%,
      rgba(56, 189, 248, 0.14) 0%,
      rgba(14, 165, 233, 0.08) 28%,
      rgba(2, 6, 23, 0) 70%
    )
  `,
};

const nebulaSecondaryStyle: CSSProperties = {
  position: 'absolute',
  width: '64vmax',
  height: '64vmax',
  right: '-14vmax',
  bottom: '-18vmax',
  borderRadius: '9999px',
  opacity: 0.8,
  background: `
    radial-gradient(
      circle at 50% 50%,
      rgba(74, 222, 128, 0.1) 0%,
      rgba(59, 130, 246, 0.06) 32%,
      rgba(2, 6, 23, 0) 72%
    )
  `,
};

const dustStyle: CSSProperties = {
  position: 'absolute',
  inset: '-12%',
  opacity: 0.07,
  backgroundImage: `
    radial-gradient(1px 1px at 20px 30px, rgba(255, 255, 255, 0.4), transparent),
    radial-gradient(1px 1px at 120px 90px, rgba(148, 163, 184, 0.32), transparent),
    radial-gradient(1px 1px at 220px 180px, rgba(255, 255, 255, 0.2), transparent),
    radial-gradient(1px 1px at 300px 40px, rgba(226, 232, 240, 0.26), transparent)
  `,
  backgroundSize: '320px 320px',
  backgroundPosition: '0 0, 60px 140px, 180px 80px, 240px 200px',
};

const twinkleStars: TwinkleStar[] = [
  { top: '10%', left: '17%', size: 2.5, duration: '8.2s', delay: '-1.5s', minOpacity: 0.2, maxOpacity: 0.85 },
  { top: '18%', left: '74%', size: 2, duration: '6.7s', delay: '-3.1s', minOpacity: 0.24, maxOpacity: 0.78 },
  { top: '26%', left: '58%', size: 3, duration: '9.4s', delay: '-4.2s', minOpacity: 0.18, maxOpacity: 0.95 },
  { top: '34%', left: '11%', size: 2, duration: '7.1s', delay: '-2.4s', minOpacity: 0.22, maxOpacity: 0.72 },
  { top: '43%', left: '83%', size: 2.5, duration: '8.8s', delay: '-5.5s', minOpacity: 0.2, maxOpacity: 0.88 },
  { top: '58%', left: '29%', size: 2, duration: '6.2s', delay: '-1.9s', minOpacity: 0.16, maxOpacity: 0.7 },
  { top: '69%', left: '67%', size: 3, duration: '10.3s', delay: '-6.4s', minOpacity: 0.2, maxOpacity: 0.9 },
  { top: '79%', left: '14%', size: 2.5, duration: '7.8s', delay: '-0.8s', minOpacity: 0.24, maxOpacity: 0.82 },
];

const getTwinkleStyle = (star: TwinkleStar): CSSProperties =>
  ({
    position: 'absolute',
    top: star.top,
    left: star.left,
    width: `${star.size}px`,
    height: `${star.size}px`,
    animationDuration: star.duration,
    animationDelay: star.delay,
    ['--twinkle-min' as string]: star.minOpacity.toString(),
    ['--twinkle-max' as string]: star.maxOpacity.toString(),
  }) as CSSProperties;

const StarfieldBackground = () => (
  <div aria-hidden="true" style={containerStyle}>
    <div style={baseLayerStyle} />
    <div className="starfield-background__nebula starfield-background__nebula--primary" style={nebulaPrimaryStyle} />
    <div
      className="starfield-background__nebula starfield-background__nebula--secondary"
      style={nebulaSecondaryStyle}
    />
    <div className="starfield-background__dust" style={dustStyle} />
    {twinkleStars.map((star, index) => (
      <div key={`${star.top}-${star.left}-${index}`} className="starfield-background__twinkle" style={getTwinkleStyle(star)} />
    ))}
  </div>
);

export default StarfieldBackground;
