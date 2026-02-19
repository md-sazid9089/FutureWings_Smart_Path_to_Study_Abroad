import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function ApplicationCard({ app }) {
  return (
    <div className="card application-card">
      <div className="card-header">
        <h3>{app.program?.name || 'Program'}</h3>
        <StatusBadge status={app.status?.name} />
      </div>
      <p><strong>Country:</strong> {app.country?.name}</p>
      <p><strong>Intake:</strong> {app.intakeApplied}</p>
      <p><strong>Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
      <div className="card-actions">
        <Link to={`/applications/${app.id}`} className="btn btn-sm">Details</Link>
        <Link to={`/applications/${app.id}/visa-outcome`} className="btn btn-sm btn-outline">Visa Status</Link>
      </div>
    </div>
  );
}
