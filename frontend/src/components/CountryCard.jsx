import { Link } from 'react-router-dom';

export default function CountryCard({ country }) {
  return (
    <div className="card country-card">
      <h3>{country.name}</h3>
      <span className="badge">Tier {country.tier}</span>
      <p>{country.description || 'No description available.'}</p>
      <Link to={`/countries/${country.id}`} className="btn">View Details</Link>
    </div>
  );
}
