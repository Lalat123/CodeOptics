import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import styles from './Template.module.css';

export default function Template() {
  const navigate = useNavigate();
  const { id } = useParams();
  const topicName = id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const email = localStorage.getItem('codeoptics_session');

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [id]);

  const fetchTemplates = async () => {
    try {
      // In development, the proxy handles /api. 
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://codeoptics.vercel.app' 
        : 'http://localhost:3000';

      const res = await fetch(`${apiUrl}/api/template/${id}?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      
      if (data.templates && data.templates.length > 0) {
        setTemplates(data.templates);
      } else {
        // Default empty template
        setTemplates([{ title: '', code: '' }]);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      // Fallback
      setTemplates([{ title: '', code: '' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://codeoptics.vercel.app' 
        : 'http://localhost:3000';

      const res = await fetch(`${apiUrl}/api/template/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, templates })
      });
      
      const data = await res.json();
      if (data.success) {
        // Success flash or toast could go here
        alert('Templates saved successfully!');
      } else {
        alert(data.error || 'Failed to save templates.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const addTemplate = () => {
    setTemplates([...templates, { title: '', code: '' }]);
  };

  const removeTemplate = (index) => {
    const updated = templates.filter((_, i) => i !== index);
    if (updated.length === 0) {
      updated.push({ title: '', code: '' });
    }
    setTemplates(updated);
  };

  const updateTemplate = (index, field, value) => {
    const updated = [...templates];
    updated[index][field] = value;
    setTemplates(updated);
  };

  if (loading) {
    return <div className={styles.container}><p className={styles.loading}>Loading your templates...</p></div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => navigate(`/topic/${id}`)} className={styles.backBtn}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1>{topicName} Templates</h1>
        </div>
        <button 
          className={styles.saveBtn} 
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={18} />
          <span>{saving ? 'Saving...' : 'Save All'}</span>
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.infoBanner}>
          <p>Store your personalized boilerplate code here. You can add titles to organize different variations (e.g., "Iterative Version", "Recursive Version").</p>
        </div>

        {templates.map((tpl, index) => (
          <div key={index} className={styles.templateBlock}>
            <div className={styles.blockHeader}>
              <input 
                type="text" 
                placeholder="Template Title / Information (e.g., Lazy Propagation)"
                value={tpl.title}
                onChange={(e) => updateTemplate(index, 'title', e.target.value)}
                className={styles.titleInput}
              />
              <button 
                className={styles.deleteBtn}
                onClick={() => removeTemplate(index)}
                title="Remove Template"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <textarea
              className={styles.codeEditor}
              placeholder="// Write your code template here..."
              value={tpl.code}
              onChange={(e) => updateTemplate(index, 'code', e.target.value)}
              spellCheck="false"
            />
          </div>
        ))}

        <button className={styles.addBtn} onClick={addTemplate}>
          <Plus size={20} />
          <span>Add Another Template</span>
        </button>
      </main>
    </div>
  );
}
