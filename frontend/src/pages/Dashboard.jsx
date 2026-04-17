import { useAuth } from '../context/AuthContext';
import { User, Shield, Briefcase, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <Shield size={48} className="icon-admin" />;
      case 'Manager': return <Briefcase size={48} className="icon-manager" />;
      default: return <User size={48} className="icon-user" />;
    }
  };

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, <strong>{user.name}</strong></p>
      </header>

      <div className="dashboard-grid">
        <div className="stat-card profile-summary">
          <div className="card-icon">{getRoleIcon(user.role)}</div>
          <div className="card-info">
            <h3>Role: {user.role}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="stat-card info-card">
          <Clock size={24} />
          <div className="card-info">
            <h3>Active Status</h3>
            <p>Your account is currently active and secure.</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content mt-8">
        <h2>System Access</h2>
        <div className="access-info">
          {user.role === 'Admin' && (
            <p className="access-granted">✓ Full Administrative Access: You can manage all users and roles.</p>
          )}
          {user.role === 'Manager' && (
            <p className="access-granted">✓ Management Access: You can view users and update non-admin details.</p>
          )}
          {user.role === 'User' && (
            <p className="access-granted">✓ Basic Access: You can view and update your own profile.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
