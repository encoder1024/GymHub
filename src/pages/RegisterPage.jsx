import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, ArrowRight, Clock, AlertCircle, CheckCircle } from 'lucide-react'

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 1. Registrar el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            // email: {email},
            // El rol se establecerá por defecto como 'cliente' en la tabla profiles
          },
        },
      });
      setSuccess(true)
      // if (authError) throw authError;

      // Si el registro de Auth fue exitoso, el usuario está en auth.users pero no aún en profiles.
      // Supabase automáticamente crea un registro en `profiles` si está configurado con un trigger
      // o si lo creamos manualmente. Aquí asumimos que el RLS o un trigger maneja la creación inicial.
      // Si el registro de Auth es suficiente para el primer login, podemos redirigir.
      // Si se requiere confirmación de email, el usuario deberá verificar su email antes de poder iniciar sesión.
      
      // Para esta versión, asumimos que el usuario puede proceder si el registro de Auth fue exitoso.
      // En un flujo real, podrías querer esperar a la confirmación del email.
      
      // Redirigir a la página de login o a una página de verificación de email
      // navigate('/login'); // O a una página que indique "Revisa tu email para confirmar tu cuenta"

    } catch (error) {
      setError(error.message || 'Error al registrarse. Intenta con otro email.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
      return (
          <div className="min-h-screen bg-[#f5f7f9] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta creada!</h2>
                  <p className="text-gray-500 mb-8">
                      Hemos enviado un enlace de confirmación a <strong>{email}</strong>.
                      <br />Por favor revisa tu bandeja de entrada.
                  </p>
                  <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-2 text-[#1a4d3a] font-semibold hover:underline"
                  >
                      <ArrowRight className="w-4 h-4" />
                      Ir a Iniciar Sesión
                  </Link>
              </div>
          </div>
      )
  }

  return (
    <div className="pa4">
      <main className="pa4 black-80">
        <form className="measure center" onSubmit={handleRegister}>
          <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
            <legend className="f2 fw6 ph0 mh0">Registro</legend>
            <div className="mt3">
              <label className="db fw6 lh-copy f6" htmlFor="full-name">Nombre Completo</label>
              <input
                className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                type="text"
                name="full-name"
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="mt3">
              <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
              <input
                className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                type="email"
                name="email-address"
                id="email-address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mv3">
              <label className="db fw6 lh-copy f6" htmlFor="password">Contraseña</label>
              <input
                className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6" // Mínimo de seguridad
              />
            </div>
          </fieldset>
          {error && <p className="f6 red">{error}</p>}
          <div className="">
            <input
              className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
              type="submit"
              value={loading ? 'Registrando...' : 'Registrarme'}
              disabled={loading}
            />
          </div>
          <div className="lh-copy mt3">
            <Link to="/login" className="f6 link dim black db">¿Ya tienes cuenta? Inicia Sesión</Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RegisterPage;
