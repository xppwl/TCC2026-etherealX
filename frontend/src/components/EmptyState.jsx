import React from 'react';

export default function EmptyState({ icon = '🎬', title = 'Nada por aqui', description = '' }) {
  return (
    <div className="empty-state">
      <div className="empty-ico">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
