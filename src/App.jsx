import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Auth from './pages/Auth/Auth';
import Dashboard from './pages/Dashboard/Dashboard';
import TopicDetails from './pages/TopicDetails/TopicDetails';
import Theory from './pages/Theory/Theory';
import Template from './pages/Template/Template';
import Visualisation from './pages/Visualisation/Visualisation';
import './index.css';

// eslint-disable-next-line react/prop-types
function PrivateRoute({ children }) {
  const session = localStorage.getItem('codeoptics_session');
  return session ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <div className="app-container" style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/topic/:id" element={<PrivateRoute><TopicDetails /></PrivateRoute>} />
          <Route path="/topic/:id/theory" element={<PrivateRoute><Theory /></PrivateRoute>} />
          <Route path="/topic/:id/template" element={<PrivateRoute><Template /></PrivateRoute>} />
          <Route path="/topic/:id/visualisation" element={<PrivateRoute><Visualisation /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
