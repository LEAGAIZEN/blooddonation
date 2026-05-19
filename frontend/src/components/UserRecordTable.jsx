import React from 'react';

export default function UserRecordTable({
  searchTerm,
  setSearchTerm,
  bloodFilter,
  setBloodFilter,
  statusFilter,
  setStatusFilter,
  filteredUsers,
  openMenuId,
  setOpenMenuId,
  toggleStatus,
  deleteUser
}) {
  return (
    <div style={{ width: '100%' }}>
      {/* FILTER SEARCH BAR & DROPDOWNS ZONE */}
      <section style={{ display: 'flex', gap: '16px', marginBottom: '24px', width: '100%' }}>
        <div style={{ backgroundColor: '#FFF0EF', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 16px', flex: '1 1 auto' }}>
          <span style={{ color: '#9C8E8D', marginRight: '12px', fontSize: '16px' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Filter by name, email, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', height: '56px', fontSize: '15px', color: '#1A1313', padding: '0', boxShadow: 'none' }}
          />
        </div>

        <div style={{ backgroundColor: '#FFF0EF', borderRadius: '8px', padding: '8px 16px', minWidth: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <small style={{ fontSize: '10px', fontWeight: '700', color: '#A39695', letterSpacing: '0.5px', marginBottom: '2px', display: 'block', textTransform: 'uppercase' }}>BLOOD TYPE</small>
          <select 
            value={bloodFilter} 
            onChange={(e) => setBloodFilter(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#1A1313', width: '100%', cursor: 'pointer', height: 'auto', padding: '0' }}
          >
            <option>All Types</option>
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ backgroundColor: '#FFF0EF', borderRadius: '8px', padding: '8px 16px', minWidth: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <small style={{ fontSize: '10px', fontWeight: '700', color: '#A39695', letterSpacing: '0.5px', marginBottom: '2px', display: 'block', textTransform: 'uppercase' }}>STATUS</small>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#1A1313', width: '100%', cursor: 'pointer', height: 'auto', padding: '0' }}
          >
            <option>Any Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Inactive</option>
          </select>
        </div>
      </section>

      {/* STYLED DATA CARD CONTEXT CONTAINER */}
      <section style={{ background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', border: '1px solid #FDF0EE', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1fr 1.2fr 0.5fr', padding: '16px 24px', borderBottom: '1px solid #FDF0EE', background: '#FFFFFF', alignItems: 'center' }}>
          {["USER IDENTITY", "CLASSIFICATION", "VITAL SIGN", "INTEGRITY"].map(h => <span key={h} style={{ fontSize: '11px', fontWeight: '700', color: '#B5A8A6', letterSpacing: '0.8px' }}>{h}</span>)}
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#B5A8A6', letterSpacing: '0.8px', textAlign: 'right', paddingRight: '10px' }}>UTILITY</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {filteredUsers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8A7E7D', fontSize: '14px', width: '100%', background: '#FFFFFF' }}>
              No live system database records found matching active filter parameters.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const recordId = user._id || user.id;
              const labelInitials = user.name ? user.name.substring(0, 2).toUpperCase() : "U";

              // Badges colors dynamically mapped
              const roleColors = user.role === 'ADMIN' ? { bg: '#FFEBEE', text: '#E53935' } : user.role === 'SEEKER' ? { bg: '#F3E5F5', text: '#8E24AA' } : { bg: '#E3F2FD', text: '#1E88E5' };
              const statusColor = user.status === 'Inactive' ? '#9E9E9E' : user.status === 'Pending' ? '#EF6C00' : '#2E7D32';

              return (
                <div key={recordId} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1fr 1.2fr 0.5fr', padding: '16px 24px', alignItems: 'center', borderBottom: '1px solid #FDF0EE', background: '#FFFFFF' }}>
                  
                  {/* Identity Structure */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#111C24', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '14px', margin: 'auto' }}>{labelInitials}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#1A1313', lineHeight: '1.2' }}>{user.name}</span>
                      <span style={{ fontSize: '13px', color: '#8A7E7D', lineHeight: '1.2' }}>{user.email}</span>
                    </div>
                  </div>

                  {/* Classification */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', display: 'inline-block', lineHeight: '1', backgroundColor: roleColors.bg, color: roleColors.text }}>
                      {user.role || "DONOR"}
                    </span>
                  </div>

                  {/* Blood Group Accent */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', padding: '6px 12px', borderRadius: '4px', minWidth: '38px', textAlign: 'center', display: 'inline-block', lineHeight: '1', backgroundColor: '#FFEBEE', color: '#C9252C' }}>
                      {user.blood || "O+"}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', color: statusColor }}>
                      <span style={{ fontSize: '9px' }}>●</span> {user.status || "Active"}
                    </span>
                  </div>
                  
                  {/* Action Dropper Menu */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => setOpenMenuId(openMenuId === recordId ? null : recordId)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#A19290', cursor: 'pointer', padding: '4px 12px', lineHeight: '1', height: 'auto', boxShadow: 'none' }}>⋮</button>
                    {openMenuId === recordId && (
                      <div style={{ position: 'absolute', right: 0, top: '32px', background: '#FFFFFF', border: '1px solid #F0E2E0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderRadius: '8px', zIndex: 999, width: '160px', padding: '4px 0' }}>
                        <button onClick={() => window.location.href = `/admin/edit-user/${recordId}`} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', color: '#332625', cursor: 'pointer', display: 'block', height: 'auto', lineHeight: '1.2' }}>Edit Data Profile</button>
                        <hr style={{ border: 'none', borderTop: '1px solid #F5EAE8', margin: '4px 0', height: '0' }} />
                        <button onClick={() => toggleStatus(recordId, "Active")} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', color: '#332625', cursor: 'pointer', display: 'block' }}>Set Active</button>
                        <button onClick={() => toggleStatus(recordId, "Inactive")} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', color: '#332625', cursor: 'pointer', display: 'block' }}>Set Inactive</button>
                        <button onClick={() => toggleStatus(recordId, "Pending")} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', color: '#332625', cursor: 'pointer', display: 'block' }}>Set Pending</button>
                        <hr style={{ border: 'none', borderTop: '1px solid #F5EAE8', margin: '4px 0', height: '0' }} />
                        <button onClick={() => deleteUser(recordId)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', display: 'block', color: '#C9252C' }}>Delete Record</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION ZONE STRIP */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', backgroundColor: '#FFFDFD', borderTop: '1px solid #FDF0EE', width: '100%' }}>
          <span style={{ fontSize: '13px', color: '#8A7E7D' }}>Showing {filteredUsers.length} live synchronized records</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button style={{ background: '#FFFFFF', border: '1px solid #EFE4E2', borderRadius: '4px', width: '32px', height: '32px', fontSize: '13px', fontWeight: '600', color: '#4A3E3D', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <button style={{ backgroundColor: '#C9252C', color: '#FFFFFF', border: '1px solid #C9252C', borderRadius: '4px', width: '32px', height: '32px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</button>
            <button style={{ background: '#FFFFFF', border: '1px solid #EFE4E2', borderRadius: '4px', width: '32px', height: '32px', fontSize: '13px', fontWeight: '600', color: '#4A3E3D', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </div>
        </div>
      </section>
    </div>
  );
}