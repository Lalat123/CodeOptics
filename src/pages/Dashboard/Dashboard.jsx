import { useNavigate } from 'react-router-dom';
import { Layers, ChevronRight, LogOut } from 'lucide-react';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const topics = [
    {
      id: 'segment-tree',
      title: 'Segment Tree',
      description: 'A versatile data structure for answering range queries and updating array elements in O(log N) time.',
      icon: <Layers size={32} className={styles.topicIcon} />,
      status: 'Available'
    },
    {
      id: 'sparse-table',
      title: 'Sparse Table',
      description: 'A 2D array data structure used for answering idempotent range queries like Min, Max, and GCD in O(1) time.',
      icon: <Layers size={32} className={styles.topicIcon} />,
      status: 'Available'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('codeoptics_session');
    navigate('/');
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div>
          <h1>Algorithm Explorer</h1>
          <p>Select a topic to start learning</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.topicsGrid}>
          {topics.map((topic) => (
            <div 
              key={topic.id} 
              className={styles.topicCard}
              onClick={() => navigate(`/topic/${topic.id}`)}
            >
              <div className={styles.cardHeader}>
                {topic.icon}
                <span className={styles.statusBadge}>{topic.status}</span>
              </div>
              <div className={styles.cardBody}>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
              </div>
              <div className={styles.cardFooter}>
                <span>Explore Topic</span>
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
