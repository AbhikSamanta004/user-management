import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, Users } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo">
          UserMgmt.
        </Link>
        
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          
          {(user.role === 'Admin' || user.role === 'Manager') && (
            <Link to="/users" className="nav-link">
              <Users size={20} />
              <span>User Management</span>
            </Link>
          )}
          
          <Link to="/profile" className="nav-link">
            <User size={20} />
            <span>Profile</span>
          </Link>
          
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
