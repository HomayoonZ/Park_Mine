import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mineAPI, dashboardAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [mines, setMines] = useState([]);
  const [selectedMine, setSelectedMine] = useState(null);
  const [fuelData, setFuelData] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMines();
  }, []);

  useEffect(() => {
    if (selectedMine) {
      loadDashboardData(selectedMine);
    }
  }, [selectedMine]);

  const loadMines = async () => {
    try {
      const response = await mineAPI.getAll();
      setMines(response.data.results || response.data);
      if (response.data.results?.length > 0 || response.data.length > 0) {
        setSelectedMine((response.data.results || response.data)[0].id);
      }
    } catch (error) {
      console.error('Error loading mines:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (mineId) => {
    try {
      setLoading(true);
      
      const fuelResponse = await dashboardAPI.getFuelData(mineId);
      const fuelStats = await dashboardAPI.getFuelStats(mineId);
      const reportsResponse = await dashboardAPI.getDailyReports(mineId);
      const reportSummary = await dashboardAPI.getReportSummary(mineId);
      
      setFuelData(fuelResponse.data.results || fuelResponse.data);
      setDailyReports(reportsResponse.data.results || reportsResponse.data);
      setStats({
        fuel: fuelStats.data,
        reports: reportSummary.data,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const fuelChartData = fuelData
    .slice(0, 10)
    .reverse()
    .map(item => ({
      date: new Date(item.date).toLocaleDateString('fa-IR'),
      fuel: parseFloat(item.fuel_amount),
    }));

  const extractionChartData = dailyReports
    .slice(0, 10)
    .reverse()
    .map(item => ({
      date: new Date(item.date).toLocaleDateString('fa-IR'),
      ore: parseFloat(item.ore_extracted),
      waste: parseFloat(item.waste_removed),
    }));

  if (loading && !selectedMine) {
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
        <button onClick={() => navigate('/dashboard')} style={{...styles.navBtn, ...styles.navBtnActive}}>
          📊 داشبورد
        </button>
        <button onClick={() => navigate('/mines')} style={styles.navBtn}>
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
        <div style={styles.selectorCard}>
          <label style={styles.label}>انتخاب معدن:</label>
          <select
            value={selectedMine || ''}
            onChange={(e) => setSelectedMine(e.target.value)}
            style={styles.select}
          >
            {mines.map(mine => (
              <option key={mine.id} value={mine.id}>
                {mine.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⛽</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>مجموع مصرف سوخت</div>
              <div style={styles.statValue}>
                {stats?.fuel?.total_fuel ? `${Math.round(stats.fuel.total_fuel)} لیتر` : '--'}
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📦</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>سنگ‌معدن استخراج شده</div>
              <div style={styles.statValue}>
                {stats?.reports?.total_ore ? `${Math.round(stats.reports.total_ore)} تن` : '--'}
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🗑️</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>سنگ باطله</div>
              <div style={styles.statValue}>
                {stats?.reports?.total_waste ? `${Math.round(stats.reports.total_waste)} تن` : '--'}
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📈</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>میانگین استخراج روزانه</div>
              <div style={styles.statValue}>
                {stats?.reports?.avg_ore ? `${Math.round(stats.reports.avg_ore)} تن` : '--'}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.chartsGrid}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>📊 روند مصرف سوخت (10 روز اخیر)</h3>
            {fuelChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fuelChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="fuel" stroke="#8884d8" name="مصرف سوخت (لیتر)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={styles.noData}>داده‌ای برای نمایش وجود ندارد</div>
            )}
          </div>

          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>📊 روند استخراج (10 روز اخیر)</h3>
            {extractionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={extractionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ore" fill="#82ca9d" name="سنگ‌معدن (تن)" />
                  <Bar dataKey="waste" fill="#ff7c7c" name="باطله (تن)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={styles.noData}>داده‌ای برای نمایش وجود ندارد</div>
            )}
          </div>
        </div>

        <div style={styles.tableCard}>
          <h3 style={styles.chartTitle}>📋 آخرین گزارش‌های روزانه</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>تاریخ</th>
                  <th style={styles.th}>سنگ‌معدن (تن)</th>
                  <th style={styles.th}>باطله (تن)</th>
                  <th style={styles.th}>ساعات کار</th>
                </tr>
              </thead>
              <tbody>
                {dailyReports.slice(0, 5).map((report) => (
                  <tr key={report.id}>
                    <td style={styles.td}>{new Date(report.date).toLocaleDateString('fa-IR')}</td>
                    <td style={styles.td}>{Math.round(report.ore_extracted)}</td>
                    <td style={styles.td}>{Math.round(report.waste_removed)}</td>
                    <td style={styles.td}>{report.operating_hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 40px',
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
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: '36px',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  chartCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#333',
  },
  noData: {
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
  },
  tableCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'right',
    padding: '12px',
    borderBottom: '2px solid #e0e0e0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
  },
  td: {
    textAlign: 'right',
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
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

export default DashboardPage;
