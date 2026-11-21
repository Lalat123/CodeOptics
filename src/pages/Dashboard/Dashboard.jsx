import { useNavigate } from 'react-router-dom';
import { Layers, ChevronRight, LogOut, Network, Type } from 'lucide-react';
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
    },
    {
      id: 'dsu',
      title: 'Disjoint Set Union',
      description: 'A data structure that tracks a set of elements partitioned into a number of disjoint (non-overlapping) subsets, supporting near O(1) union and find operations.',
      icon: <Network size={32} className={styles.topicIcon} />,
      status: 'Available'
    },
    {
      id: 'fenwick-tree',
      title: 'Fenwick Tree (BIT)',
      description: 'A data structure that can efficiently update elements and calculate prefix sums in a table of numbers in O(log N) time using bitwise operations.',
      icon: <Layers size={32} className={styles.topicIcon} />,
      status: 'Available'
    },
    {
      id: 'lca',
      title: 'LCA (Binary Lifting)',
      description: 'An advanced technique to find the Lowest Common Ancestor of two nodes in a tree in O(log N) time by jumping up in powers of 2.',
      icon: <Network size={32} className={styles.topicIcon} />,
      status: 'Available'
    },
    {
      id: 'hld',
      title: 'Heavy-Light Decomposition',
      description: 'A powerful technique that flattens a tree into disjoint paths to answer complex path queries in O(log² N) time using a Segment Tree.',
      icon: <Network size={32} className={styles.topicIcon} />,
      status: 'Available'
    },
    {
      id: 'kmp',
      title: 'Knuth-Morris-Pratt (KMP)',
      description: 'An advanced string matching algorithm that searches for a pattern in a text in O(N + M) time using an LPS array.',
      icon: <Type size={32} className={styles.topicIcon} />,
      status: 'Available'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('codeoptics_session');
    localStorage.removeItem('codeoptics_token');
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
