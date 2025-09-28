interface ParticleBackgroundProps {
  count?: number;
}

export default function ParticleBackground({ count = 15 }: ParticleBackgroundProps) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 6}s`,
  }));

  return (
    <div className="particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: particle.left,
            animationDelay: particle.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
