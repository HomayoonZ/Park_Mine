import "../styles.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="social-icons mb-3">
          <a href="https://facebook.com"><i className="fab fa-facebook-f"></i></a>
          <a href="https://twitter.com"><i className="fab fa-twitter"></i></a>
          <a href="https://instagram.com"><i className="fab fa-instagram"></i></a>
          <a href="https://linkedin.com"><i className="fab fa-linkedin-in"></i></a>
        </div>
        <div>
          <a href="#">خانه</a>
          <a href="#">درباره ما</a>
          <a href="#">تماس</a>
          <a href="#">پشتیبانی</a>
        </div>
        <p className="mt-3">© 2025 مدیریت معادن. تمامی حقوق محفوظ است.</p>
      </div>
    </footer>
  );
}

export default Footer;