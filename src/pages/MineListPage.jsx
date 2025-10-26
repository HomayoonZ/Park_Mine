import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mineAPI } from '../services/api';

function MineListPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMine, setNewMine] = useState({
    name: '',
    mine_type: 'open_pit',
    status: 'development',
    latitude: '',
    longitude: '',
    area_hectares: '',
    description: '',
  });

  useEffect(() => {
    loadMines();
  }, []);

  const loadMines = async () => {
    try {
      const response = await mineAPI.getAll();
      setMines(response.data.results || response.data);
    } catch (error) {
      console.error('Error loading mines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMine = async (e) => {
    e.preventDefault();
    try {
      await mineAPI.create(newMine);
      setShowAddModal(false);
      setNewMine({
        name: '',
        mine_type: 'open_pit',
        status: 'development',
        latitude: '',
        longitude: '',
        area_hectares: '',
        description: '',
      });
      loadMines();
    } catch (error) {
      console.error('Error creating mine:', error);
      alert('خطا در ایجاد معدن');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getMineTypeLabel = (type) => {
    const types = {
      open_pit: 'روباز',
      underground: 'زیرزمینی',
      placer: 'رسوبی',
    };
    return types[type] || type;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      active: 'فعال',
      inactive: 'غیرفعال',
      development: 'در حال توسعه',
      closed: 'بسته شده',
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#4caf50',
      inactive: '#9e9e9e',
      development: '#ff9800',
      closed: '#f44336',
    };
    return colors[status] || '#999';
  };

  if (loading) {
    return <div style={styles.loading}>در حال بارگذاری...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>🏔️ داشبورد مدیریت معدن</h1>
          <div style={styles.userInfo}>
            <span style={styles.userName}>👤 {user?.first_name || user?.username}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>خروج</button>
          </div>
        </div>
      </header>

      <nav style={styles.nav}>
        <button onClick={() => navigate('/dashboard')} style={styles.navBtn}>
          📊 داشبورد
        </button>
        <button onClick={() => navigate('/mines')} style={{...styles.navBtn, ...styles.navBtnActive}}>
          ⛏️ معادن
        </button>
        <button onClick={() => navigate('/upload')} style={styles.navBtn}>
          📤 آپلود داده
        </button>
        <button onClick={() => navigate('/map')} style={styles.navBtn}>
          🗺️ نقشه 2D
        </button>
        <button onClick={() => navigate('/3d')} style={styles.navBtn}>
          🌍 نمایش 3D
        </button>
      </nav>

      <main style={styles.main}>
        <div style={styles.headerRow}>
          <h2 style={styles.pageTitle}>لیست معادن</h2>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
            ➕ افزودن معدن جدید
          </button>
        </div>

        <div style={styles.minesGrid}>
          {mines.map((mine) => (
            <div
              key={mine.id}
              style={styles.mineCard}
              onClick={() => navigate(`/mines/${mine.id}`)}
            >
              <div style={styles.mineHeader}>
                <h3 style={styles.mineName}>{mine.name}</h3>
                <span
                  style={{
                    ...styles.statusBadge,
                    background: getStatusColor(mine.status),
                  }}
                >
                  {getStatusLabel(mine.status)}
                </span>
              </div>
              
              <div style={styles.mineDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>نوع:</span>
                  <span style={styles.detailValue}>{getMineTypeLabel(mine.mine_type)}</span>
                </div>
                
                {mine.area_hectares && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>مساحت:</span>
                    <span style={styles.detailValue}>{mine.area_hectares} هکتار</span>
                  </div>
                )}
                
                {mine.latitude && mine.longitude && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>موقعیت:</span>
                    <span style={styles.detailValue}>
                      {parseFloat(mine.latitude).toFixed(4)}, {parseFloat(mine.longitude).toFixed(4)}
                    </span>
                  </div>
                )}
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>مالک:</span>
                  <span style={styles.detailValue}>{mine.owner_name || 'نامشخص'}</span>
                </div>
              </div>

              <div style={styles.mineFooter}>
                <span style={styles.dateText}>
                  ایجاد شده: {new Date(mine.created_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {mines.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⛏️</div>
            <p style={styles.emptyText}>هنوز معدنی ایجاد نشده است</p>
            <button onClick={() => setShowAddModal(true)} style={styles.emptyBtn}>
              ایجاد اولین معدن
            </button>
          </div>
        )}
      </main>

      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>➕ افزودن معدن جدید</h2>
            
            <form onSubmit={handleAddMine} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>نام معدن *</label>
                <input
                  type="text"
                  value={newMine.name}
                  onChange={(e) => setNewMine({...newMine, name: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>نوع معدن</label>
                  <select
                    value={newMine.mine_type}
                    onChange={(e) => setNewMine({...newMine, mine_type: e.target.value})}
                    style={styles.input}
                  >
                    <option value="open_pit">روباز</option>
                    <option value="underground">زیرزمینی</option>
                    <option value="placer">رسوبی</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>وضعیت</label>
                  <select
                    value={newMine.status}
                    onChange={(e) => setNewMine({...newMine, status: e.target.value})}
                    style={styles.input}
                  >
                    <option value="development">در حال توسعه</option>
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                    <option value="closed">بسته شده</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>عرض جغرافیایی</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={newMine.latitude}
                    onChange={(e) => setNewMine({...newMine, latitude: e.target.value})}
                    style={styles.input}
                    placeholder="35.6892"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>طول جغرافیایی</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={newMine.longitude}
                    onChange={(e) => setNewMine({...newMine, longitude: e.target.value})}
                    style={styles.input}
                    placeholder="51.3890"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>مساحت (هکتار)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newMine.area_hectares}
                  onChange={(e) => setNewMine({...newMine, area_hectares: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>توضیحات</label>
                <textarea
                  value={newMine.description}
                  onChange={(e) => setNewMine({...newMine, description: e.target.value})}
                  style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
                />
              </div>

              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>
                  لغو
                </button>
                <button type="submit" style={styles.submitBtn}>
                  ایجاد معدن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f7fa',
    fontFamily: 'Vazir, sans-serif',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px 40px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  userInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  userName: {
    fontSize: '14px',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  nav: {
    background: 'white',
    padding: '15px 40px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  navBtn: {
    background: 'transparent',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#666',
    transition: 'all 0.2s',
  },
  navBtnActive: {
    background: '#667eea',
    color: 'white',
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 40px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  addBtn: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  minesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  mineCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  mineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  mineName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    color: 'white',
    fontWeight: '600',
  },
  mineDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '15px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    color: '#333',
    fontWeight: '600',
  },
  mineFooter: {
    borderTop: '1px solid #f0f0f0',
    paddingTop: '10px',
  },
  dateText: {
    fontSize: '12px',
    color: '#999',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  emptyText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '30px',
  },
  emptyBtn: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  inputRow: {
    display: 'flex',
    gap: '15px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
  },
  submitBtn: {
    flex: 1,
    padding: '12px',
    background: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
  },
  loading: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#666',
  },
};

export default MineListPage;
