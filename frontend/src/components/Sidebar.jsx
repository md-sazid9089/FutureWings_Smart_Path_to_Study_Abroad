import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h3>Admin Panel</h3>
      <ul>
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/countries">Countries</Link></li>
        <li><Link to="/admin/universities">Universities</Link></li>
        <li><Link to="/admin/programs">Programs</Link></li>
        <li><Link to="/admin/scholarships">Scholarships</Link></li>
        <li><Link to="/admin/documents">Documents</Link></li>
        <li><Link to="/admin/applications">Applications</Link></li>
        <li><Link to="/admin/ratings">Ratings</Link></li>
      </ul>
    </aside>
  );
}
