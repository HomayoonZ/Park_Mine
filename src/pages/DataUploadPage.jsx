import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mineAPI, spatialAPI } from '../services/api';

function DataUploadPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [mines, setMines] = useState([]);
  const [selectedMine, setSelectedMine] = useState('');
  const [uploadType, setUploadType] = useState('dem');
  const [uploading, setUploading] = useState(false);
  
  const [demData, setDemData] = useState({
    survey_date: '',
    resolution: '',
    notes: '',
    dem_file: null,
  });
  
  const [layerData, setLayerData] = useState({
    name: '',
    layer_type: 'geology',
    geojson_file: null,
  });

  useEffect(() => {
    loadMines();
  }, []);

  const loadMines = async () => {
    try {
      const response = await mineAPI.getAll();
      const minesList = response.data.results || response.data;
      setMines(minesList);
      if (minesList.length > 0) {
        setSelectedMine(minesList[0].id);
      }
    } catch (error) {
      console.error('Error loading mines:', error);
    }
  };

  const handleDEMUpload = async (e) => {
    e.preventDefault();
    if (!selectedMine || !demData.dem_file) {
      alert('لطفا معدن و فایل DEM را انتخاب کنید');
      return;
    }

    setUploading(true);
    try {
      const formData = {
        mine: selectedMine,
        survey_date: demData.survey_date,
        resolution: demData.resolution,
        notes: demData.notes,
        dem_file: demData.dem_file,
      };

      await spatialAPI.uploadDEM(formData);
      alert('✅ فایل DEM با موفقیت آپلود شد');
      
      setDemData({
        survey_date: '',
        resolution: '',
        notes: '',
        dem_file: null,
      });
      document.getElementById('dem-file-input').value = '';
    } catch (error) {
      console.error('Error uploading DEM:', error);
      alert('❌ خطا در آپلود فایل: ' + (error.response?.data?.dem_file?.[0] || 'خطای ناشناخته'));
    } finally {
      setUploading(false);
    }
  };

  const handleLayerUpload = async (e) => {
    e.preventDefault();
    if (!selectedMine || !layerData.geojson_file) {
      alert('لطفا معدن و فایل را انتخاب کنید');
      return;
    }

    setUploading(true);
    try {
      const formData = {
        mine: selectedMine,
        name: layerData.name,
        layer_type: layerData.layer_type,
        geojson_file: layerData.geojson_file,
      };

      await spatialAPI.uploadLayer(formData);
      alert('✅ لایه مکانی با موفقیت آپلود شد');
      
      setLayerData({
        name: '',
        layer_type: 'geology',
        geojson_file: null,
      });
      document.getElementById('layer-file-input').value = '';
    } catch (error) {
      console.error('Error uploading layer:', error);
      alert('❌ خطا در آپلود فایل: ' + (error.response?.data?.geojson_file?.[0] || 'خطای ناشناخته'));
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
        <button onClick={() => navigate('/mines')} style={styles.navBtn}>
          ⛏️ معادن
        </button>
        <button onClick={() => navigate('/upload')} style={{...styles.navBtn, ...styles.navBtnActive}}>
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
        <h2 style={styles.pageTitle}>📤 آپلود داده‌های مکانی</h2>

        <div style={styles.selectorCard}>
          <label style={styles.label}>انتخاب معدن:</label>
          <select
            value={selectedMine}
            onChange={(e) => setSelectedMine(e.target.value)}
            style={styles.select}
          >
            <option value="">-- انتخاب کنید --</option>
            {mines.map(mine => (
              <option key={mine.id} value={mine.id}>
                {mine.name}
              </option>
            ))}
          </select>
        </div>

        {!selectedMine ? (
          <div style={styles.warningBox}>
            ⚠️ لطفا ابتدا یک معدن انتخاب کنید
          </div>
        ) : (
          <>
            <div style={styles.tabs}>
              <button
                onClick={() => setUploadType('dem')}
                style={{
                  ...styles.tab,
                  ...(uploadType === 'dem' ? styles.tabActive : {}),
                }}
              >
                🗻 آپلود DEM
              </button>
              <button
                onClick={() => setUploadType('layer')}
                style={{
                  ...styles.tab,
                  ...(uploadType === 'layer' ? styles.tabActive : {}),
                }}
              >
                🗺️ آپلود لایه مکانی
              </button>
            </div>

            {uploadType === 'dem' && (
              <div style={styles.uploadCard}>
                <h3 style={styles.cardTitle}>📁 آپلود فایل DEM</h3>
                <p style={styles.cardSubtitle}>
                  فرمت‌های پشتیبانی شده: .tif, .tiff, .asc, .dem (حداکثر 100 مگابایت)
                </p>

                <form onSubmit={handleDEMUpload} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>تاریخ برداشت *</label>
                    <input
                      type="date"
                      value={demData.survey_date}
                      onChange={(e) => setDemData({...demData, survey_date: e.target.value})}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>وضوح مکانی (متر) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={demData.resolution}
                      onChange={(e) => setDemData({...demData, resolution: e.target.value})}
                      style={styles.input}
                      placeholder="مثال: 0.5"
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>یادداشت</label>
                    <textarea
                      value={demData.notes}
                      onChange={(e) => setDemData({...demData, notes: e.target.value})}
                      style={{...styles.input, minHeight: '80px'}}
                      placeholder="توضیحات اختیاری..."
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>فایل DEM *</label>
                    <div style={styles.fileInputWrapper}>
                      <input
                        id="dem-file-input"
                        type="file"
                        accept=".tif,.tiff,.asc,.dem"
                        onChange={(e) => setDemData({...demData, dem_file: e.target.files[0]})}
                        style={styles.fileInput}
                        required
                      />
                      <label htmlFor="dem-file-input" style={styles.fileLabel}>
                        {demData.dem_file ? `✅ ${demData.dem_file.name}` : '📁 انتخاب فایل'}
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      ...styles.submitBtn,
                      opacity: uploading ? 0.6 : 1,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {uploading ? '⏳ در حال آپلود...' : '📤 آپلود فایل DEM'}
                  </button>
                </form>
              </div>
            )}

            {uploadType === 'layer' && (
              <div style={styles.uploadCard}>
                <h3 style={styles.cardTitle}>🗺️ آپلود لایه مکانی</h3>
                <p style={styles.cardSubtitle}>
                  فرمت‌های پشتیبانی شده: .geojson, .json, .kml (حداکثر 50 مگابایت)
                </p>

                <form onSubmit={handleLayerUpload} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>نام لایه *</label>
                    <input
                      type="text"
                      value={layerData.name}
                      onChange={(e) => setLayerData({...layerData, name: e.target.value})}
                      style={styles.input}
                      placeholder="مثال: گسل‌های اصلی"
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>نوع لایه *</label>
                    <select
                      value={layerData.layer_type}
                      onChange={(e) => setLayerData({...layerData, layer_type: e.target.value})}
                      style={styles.input}
                    >
                      <option value="geology">زمین‌شناسی</option>
                      <option value="fault">گسل</option>
                      <option value="geophysics">ژئوفیزیک</option>
                      <option value="geochemistry">ژئوشیمی</option>
                      <option value="boundary">محدوده معدن</option>
                      <option value="other">سایر</option>
                    </select>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>فایل لایه *</label>
                    <div style={styles.fileInputWrapper}>
                      <input
                        id="layer-file-input"
                        type="file"
                        accept=".geojson,.json,.kml"
                        onChange={(e) => setLayerData({...layerData, geojson_file: e.target.files[0]})}
                        style={styles.fileInput}
                        required
                      />
                      <label htmlFor="layer-file-input" style={styles.fileLabel}>
                        {layerData.geojson_file ? `✅ ${layerData.geojson_file.name}` : '📁 انتخاب فایل'}
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      ...styles.submitBtn,
                      opacity: uploading ? 0.6 : 1,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {uploading ? '⏳ در حال آپلود...' : '📤 آپلود لایه مکانی'}
                  </button>
                </form>
              </div>
            )}

            <div style={styles.infoBox}>
              <h4 style={styles.infoTitle}>💡 راهنما</h4>
              <ul style={styles.infoList}>
                <li>فایل‌های DEM برای تحلیل توپوگرافی و محاسبه حجم استفاده می‌شوند</li>
                <li>لایه‌های مکانی شامل داده‌های زمین‌شناسی، گسل‌ها و سایر اطلاعات جغرافیایی هستند</li>
                <li>فایل‌ها باید در سیستم مختصات WGS84 باشند</li>
                <li>برای فایل‌های بزرگ، صبور باشید تا آپلود کامل شود</li>
              </ul>
            </div>
          </>
        )}
      </main>
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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '30px 40px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '30px',
  },
  selectorCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'block',
    color: '#333',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  warningBox: {
    background: '#fff3cd',
    color: '#856404',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    fontSize: '16px',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  tab: {
    flex: 1,
    padding: '12px',
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea',
  },
  uploadCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '25px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  fileInputWrapper: {
    position: 'relative',
  },
  fileInput: {
    opacity: 0,
    position: 'absolute',
    zIndex: -1,
  },
  fileLabel: {
    display: 'block',
    padding: '12px',
    border: '2px dashed #667eea',
    borderRadius: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#667eea',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  submitBtn: {
    padding: '14px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  infoBox: {
    background: '#e3f2fd',
    padding: '20px',
    borderRadius: '12px',
    borderLeft: '4px solid #2196f3',
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: '12px',
  },
  infoList: {
    margin: 0,
    paddingRight: '20px',
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.8',
  },
};

export default DataUploadPage;
