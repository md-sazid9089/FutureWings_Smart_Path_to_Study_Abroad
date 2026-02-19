import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">FutureWings</Link>
      </div>
      <div className="navbar-links">
        {token ? (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/documents">Documents</Link>
            <Link to="/recommendations">Recommendations</Link>
            <Link to="/applications">Applications</Link>
            {user.role === 'ADMIN' && <Link to="/admin/dashboard">Admin</Link>}
            <button onClick={handleLogout} className="btn btn-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
