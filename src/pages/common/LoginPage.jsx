import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: apiError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (apiError) {
        throw apiError;
      }

      // console.log("Login successful, navigating to /profile");
      navigate("/profile"); // Redirige al perfil si el login es exitoso
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      // console.log("Login process finished, loading set to false.");
    }
  };

  return (
    <div className="pa4">
      <main className="pa4 black-80">
        <form className="measure center" onSubmit={handleLogin}>
          <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
            <legend className="f2 fw6 ph0 mh0">Iniciar Sesión</legend>
            <div className="mt3">
              <label className="db fw6 lh-copy f6" htmlFor="email-address">
                Email
              </label>
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
              <label className="db fw6 lh-copy f6" htmlFor="password">
                Contraseña
              </label>
              <input
                className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </fieldset>
          {error && <p className="f6 red">{error}</p>}
          <div className="">
            <input
              className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
              type="submit"
              value={loading ? "Ingresando..." : "Ingresar"}
              disabled={loading}
            />
          </div>
          <div className="lh-copy mt3">
            <Link to="/register" className="f3 link dim green db">
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default LoginPage;
