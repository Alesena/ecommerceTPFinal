import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

 
    if (email === 'admin@admin.com') {
      if (password !== 'admins') {
        setLoading(false);
        setError('Credenciales de administrador incorrectas');
        return;
      }

      if (email !== 'admin@admin.com') {
        setLoading(false);
        setError('No puedes acceder como administrador desde este correo');
        return;
      }
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); 
    } catch (error) {
      console.error('Error en login:', error);
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getAuthErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Email no válido';
      case 'auth/user-disabled':
        return 'Cuenta deshabilitada';
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde';
      default:
        return 'Error al iniciar sesión';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Iniciar Sesión</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu email"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
              minLength="6"
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
          <console className="log"></console>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">
            ¿Olvidaste tu contraseña?
          </Link>
          <span className="auth-divider">|</span>
          <Link to="/register" className="auth-link">
            Crear una cuenta
          </Link>
        </div>


        {process.env.NODE_ENV === 'development' && (
          <div className="admin-hint">
            <p>Acceso admin: admin@admin.com / admins</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;