export default function ProgressBar({ percent }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="progress">
      <i style={{ width: `${clamped}%` }} />
    </div>
  );
}
