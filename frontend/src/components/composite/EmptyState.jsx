// frontend/src/components/composite/EmptyState.jsx
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-10 rounded-card border border-dashed border-border ${className || ''}`}>
      {Icon ? <Icon className="h-10 w-10 text-muted mb-3" /> : null}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? <p className="text-sm text-muted max-w-md mt-1">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
