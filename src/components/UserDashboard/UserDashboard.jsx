import { Link } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  return (
    <div className="user-dashboard">
      <aside className="user-sidebar">
        <nav>
          <ul>
            <li><Link to="/perfil">Mi Perfil</Link></li>
            <li><Link to="/pedidos">Mis Pedidos</Link></li>
            <li><Link to="/favoritos">Favoritos</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="user-content">

      </main>
    </div>
  );
};

export default UserDashboard;