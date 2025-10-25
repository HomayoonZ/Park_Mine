import "../styles.css";

function Navbar({ user, setUser, setShowLoginModal, setShowCesium }) {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <i className="fas fa-globe me-2"></i>مدیریت معادن
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <i className="fas fa-bars"></i>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link" href="#">خانه</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">درباره</a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                ابزارها
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                <li><a className="dropdown-item" href="#" onClick={() => setShowCesium(true)}>نقشه سه‌بعدی</a></li>
                <li><a className="dropdown-item" href="#">تحلیل داده</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item" href="#">تنظیمات</a></li>
              </ul>
            </li>
          </ul>
          <div>
            {user ? (
              <>
                <span className="navbar-text me-3">
                  <i className="fas fa-user me-2"></i>{user.name}
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={() => setUser(null)}>
                  <i className="fas fa-sign-out-alt me-2"></i>خروج
                </button>
              </>
            ) : (
              <button className="btn btn-outline-light btn-sm" onClick={() => setShowLoginModal(true)}>
                <i className="fas fa-sign-in-alt me-2"></i>ورود
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;