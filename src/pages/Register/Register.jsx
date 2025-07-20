import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './Register.css';
import { signOut } from 'firebase/auth';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: `${formData.nombre} ${formData.apellido}`
      });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        createdAt: new Date()
      });

      await signOut(auth);

      navigate('/login');
      
    } catch (error) {
      console.error('Error en registro:', error);
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getAuthErrorMessage = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'El email ya está registrado';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'auth/invalid-email':
        return 'Email no válido';
      case 'auth/operation-not-allowed':
        return 'Operación no permitida';
      default:
        return 'Error en el registro. Intenta nuevamente';
    }
  };

  return (
    <div className="auth-container">
      <h2>Crear una cuenta</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingresa tu nombre"
            required
            autoComplete="given-name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="apellido">Apellido</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Ingresa tu apellido"
            required
            autoComplete="family-name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tucorreo@ejemplo.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            minLength="6"
            required
            autoComplete="new-password"
          />
          <small className="password-hint">Mínimo 6 caracteres</small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            minLength="6"
            required
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          className={`submit-button ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <div className="auth-footer">
        <span>¿Ya tienes una cuenta?</span>
        <Link to="/login" className="auth-link">Inicia sesión</Link>
      </div>
    </div>
  );
};

export default Register;