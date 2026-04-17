import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Save, Key } from 'lucide-react';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (authUser) {
      setFormData({ name: authUser.name, password: '' });
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = { name: formData.name };
      if (formData.password) updateData.password = formData.password;

      await api.put(`/users/${authUser.id}`, updateData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and credentials</p>
      </header>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">
               <User size={64} />
            </div>
            <div className="profile-info">
              <h2>{authUser.name}</h2>
              <div className="role-tag">
                <Shield size={16} />
                <span>{authUser.role}</span>
              </div>
              <p className="email">{authUser.email}</p>
            </div>
          </div>

          <hr />

          {message.text && (
            <div className={`alert alert-${message.type} mb-4`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={18} />
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>New Password (leave blank to keep current)</label>
              <div className="input-with-icon">
                <Key size={18} />
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Save size={18} />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
