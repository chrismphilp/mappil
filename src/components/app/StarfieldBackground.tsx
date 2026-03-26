const starfieldStyle = {
  position: 'fixed' as const,
  inset: 0,
  pointerEvents: 'none' as const,
  zIndex: 0,
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

const StarfieldBackground = () => <div aria-hidden="true" style={starfieldStyle} />;

export default StarfieldBackground;
