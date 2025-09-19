import React from "react";

const Notifications: React.FC = () => {
  const items: { id: string; message: string; date: string }[] = [];
  return (
    <div className="register-container" style={{ maxWidth: 900 }}>
      <h2>Notifications</h2>
      {items.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul>
          {items.map(n => (
            <li key={n.id}>
              <strong>{n.message}</strong> <em>({new Date(n.date).toLocaleString()})</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
