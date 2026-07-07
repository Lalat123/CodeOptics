import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import styles from './Auth.module.css';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleContinue = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'An error occurred. Please try again.');
        return;
      }

      // Success
      localStorage.setItem('codeoptics_session', data.email);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Failed to connect to server. Please try again later.');
    }
  };

  return (
    <div className={styles.splitContainer}>
      {/* Left Panel: Branding / Visuals */}
      <div className={styles.leftPanel}>
        <div className={styles.brandContent}>
          <Layers className={styles.hugeIcon} size={80} />
          <h1 className={styles.brandTitle}>CODEOPTICS</h1>
          <p className={styles.brandSubtitle}>
            Master complex data structures with interactive visualizations & deep theory.
          </p>
        </div>
      </div>

      {/* Right Panel: Authentication Form */}
      <div className={styles.rightPanel}>
        <div className={styles.authWrapper}>
          <div className={styles.authHeader}>
            <h2>{isLogin ? 'Sign in to CodeOptics' : 'Create your account'}</h2>
            <p>{isLogin ? 'Welcome back! Please sign in to continue.' : 'Welcome! Please fill in the details to get started.'}</p>
          </div>

          <form onSubmit={handleContinue} className={styles.authForm}>
            {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
            
            <div className={styles.inputGroup}>
              <label>Email address</label>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Password</label>
              <input 
                type="password" 
                placeholder={isLogin ? "Enter your password" : "Create a password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className={styles.continueBtn}>
              Continue <span className={styles.arrow}>&#9656;</span>
            </button>
          </form>

          <div className={styles.authSwitch}>
            {isLogin ? (
              <p>Don't have an account? <span onClick={() => { setIsLogin(false); setErrorMsg(''); }}>Sign up</span></p>
            ) : (
              <p>Already have an account? <span onClick={() => { setIsLogin(true); setErrorMsg(''); }}>Sign in</span></p>
            )}
          </div>

          <div className={styles.authFooter}>
            <p className={styles.securedText}>Secured by <strong>CodeOptics</strong></p>
            <p className={styles.devMode}>Development mode</p>
          </div>
        </div>
      </div>
    </div>
  );
}
