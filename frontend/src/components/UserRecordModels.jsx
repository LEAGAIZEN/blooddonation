import React, { useState } from 'react';

export default function UserRecordTable({ loading, users, deleteUser }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  return (
    <div className="dh-table-container">
      <div className="dh-table-header">
        <div>USER IDENTITY</div>
        <div>CLASSIFICATION</div>
        <div>VITAL SIGN</div>
        <div>INTEGRITY</div>
        <div className="text-right">UTILITY</div>
      </div>

      <div className="dh-table-body">
        {loading ? (
          <div className="dh-empty-state">Loading system records...</div>
        ) : users.length === 0 ? (
          <div className="dh-empty-state">No records match your filters.</div>
        ) : (
          users.map((user) => {
            const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "NA";
            const role = (user.role || 'donor').toLowerCase();
            const status = (user.status || 'inactive').toLowerCase();

            return (
              <div key={user.id} className="dh-table-row">
                <div className="dh-cell-identity">
                  <div className="dh-avatar">{initials}</div>
                  <div className="dh-identity-info">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="dh-cell-classification">
                  <span className={`badge-role ${role}`}>{user.role}</span>
                </div>

                <div className="dh-cell-vital">
                  <span className="badge-blood">{user.blood}</span>
                </div>

                <div className="dh-cell-integrity">
                  <span className={`status-dot ${status}`}></span>
                  <span className="status-text">{user.status}</span>
                </div>

                <div className="dh-cell-utility">
                  <button className="dh-menu-btn" onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}>⋮</button>
                  {openMenuId === user.id && (
                    <div className="dh-dropdown-menu">
                      <button onClick={() => window.location.href = `/admin/edit-user/${user.id}`}>Edit Profile</button>
                      <button onClick={() => deleteUser(user.id)} className="text-danger">Delete Record</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && (
        <div className="dh-table-footer">
          <span>Showing {users.length} community members</span>
          <div className="dh-pagination">
            <button>‹</button>
            <button className="active">1</button>
            <button>›</button>
          </div>
        </div>
      )}
    </div>
  );
}