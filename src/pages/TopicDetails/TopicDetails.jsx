import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Activity, ArrowLeft, FileCode } from 'lucide-react';
import styles from './TopicDetails.module.css';

export default function TopicDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // In a real app, fetch topic details based on ID
  const topicName = id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate('/dashboard')} className={styles.backBtn}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <h1>{topicName}</h1>
        <p>Choose how you want to learn</p>
      </header>

      <main className={styles.optionsGrid}>
        <div 
          className={styles.optionCard}
          onClick={() => navigate(`/topic/${id}/theory`)}
        >
          <div className={`${styles.iconWrapper} ${styles.theoryIcon}`}>
            <BookOpen size={40} />
          </div>
          <h2>Theory</h2>
          <p>Read the comprehensive guide on {topicName}, understand the math, and review the algorithmic approach.</p>
        </div>

        <div 
          className={styles.optionCard}
          onClick={() => navigate(`/topic/${id}/template`)}
        >
          <div className={`${styles.iconWrapper} ${styles.templateIcon}`}>
            <FileCode size={40} />
          </div>
          <h2>Templates</h2>
          <p>Write and store your personalized code templates for {topicName} to use in your future coding sessions.</p>
        </div>

        <div 
          className={styles.optionCard}
          onClick={() => navigate(`/topic/${id}/visualisation`)}
        >
          <div className={`${styles.iconWrapper} ${styles.visualIcon}`}>
            <Activity size={40} />
          </div>
          <h2>Visualisation</h2>
          <p>Launch the interactive playground. Test range queries, update nodes, and see the tree dynamically update.</p>
        </div>
      </main>
    </div>
  );
}
