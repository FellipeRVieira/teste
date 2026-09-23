export default function EmptyState({ icon = "◌", title, description, action }) {
  return (
    <div className="placeholder">
      <div className="placeholder-icon">{icon}</div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
