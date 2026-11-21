import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import styles from './Template.module.css';

// Helper to get the auth token
function getAuthHeaders() {
  const token = localStorage.getItem('codeoptics_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Map topic IDs to Monaco language identifiers
const TOPIC_LANGUAGE_MAP = {
  'segment-tree': 'cpp',
  'sparse-table': 'cpp',
  'dsu': 'cpp',
  'fenwick-tree': 'cpp',
  'lca': 'cpp',
  'hld': 'cpp',
  'kmp': 'cpp',
};

// Starter boilerplate per topic
const TOPIC_STARTERS = {
  'segment-tree': `// Segment Tree Template
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
int tree[4 * MAXN], arr[MAXN];
int n;

void build(int node, int start, int end) {
    if (start == end) {
        tree[node] = arr[start];
    } else {
        int mid = (start + end) / 2;
        build(2*node, start, mid);
        build(2*node+1, mid+1, end);
        tree[node] = tree[2*node] + tree[2*node+1]; // merge operation
    }
}

void update(int node, int start, int end, int idx, int val) {
    if (start == end) {
        arr[idx] = val;
        tree[node] = val;
    } else {
        int mid = (start + end) / 2;
        if (idx <= mid) update(2*node, start, mid, idx, val);
        else             update(2*node+1, mid+1, end, idx, val);
        tree[node] = tree[2*node] + tree[2*node+1];
    }
}

int query(int node, int start, int end, int l, int r) {
    if (r < start || end < l) return 0; // identity for sum
    if (l <= start && end <= r) return tree[node];
    int mid = (start + end) / 2;
    return query(2*node, start, mid, l, r)
         + query(2*node+1, mid+1, end, l, r);
}

int main() {
    // TODO: read input, build, query
    return 0;
}`,
  'kmp': `// KMP String Matching Template
#include <bits/stdc++.h>
using namespace std;

vector<int> buildLPS(const string& pattern) {
    int m = pattern.size();
    vector<int> lps(m, 0);
    int len = 0, i = 1;
    while (i < m) {
        if (pattern[i] == pattern[len]) {
            lps[i++] = ++len;
        } else if (len) {
            len = lps[len - 1];
        } else {
            lps[i++] = 0;
        }
    }
    return lps;
}

vector<int> kmpSearch(const string& text, const string& pattern) {
    vector<int> matches;
    vector<int> lps = buildLPS(pattern);
    int i = 0, j = 0;
    while (i < (int)text.size()) {
        if (text[i] == pattern[j]) { i++; j++; }
        if (j == (int)pattern.size()) {
            matches.push_back(i - j);
            j = lps[j - 1];
        } else if (i < (int)text.size() && text[i] != pattern[j]) {
            if (j) j = lps[j - 1];
            else   i++;
        }
    }
    return matches;
}

int main() {
    string text, pattern;
    cin >> text >> pattern;
    auto res = kmpSearch(text, pattern);
    for (int idx : res) cout << idx << " ";
    return 0;
}`,
  'default': `// Write your code template here
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Your solution here
    
    return 0;
}`
};

function getStarter(topicId) {
  return TOPIC_STARTERS[topicId] || TOPIC_STARTERS['default'];
}

// Toast notification component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.toast} ${styles[`toast_${type}`]}`}>
      {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span>{message}</span>
    </div>
  );
}

export default function Template() {
  const navigate = useNavigate();
  const { id } = useParams();
  const topicName = id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const language = TOPIC_LANGUAGE_MAP[id] || 'cpp';

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    fetchTemplates();
  }, [id]);

  const fetchTemplates = async () => {
    try {
      const apiUrl = import.meta.env.PROD
        ? 'https://codeoptics.vercel.app'
        : 'http://localhost:3000';

      const res = await fetch(`${apiUrl}/api/template/${id}`, {
        headers: getAuthHeaders()
      });

      if (res.status === 401 || res.status === 403) {
        // Token invalid / expired — redirect to login
        localStorage.removeItem('codeoptics_token');
        localStorage.removeItem('codeoptics_session');
        navigate('/login');
        return;
      }

      const data = await res.json();

      if (data.templates && data.templates.length > 0) {
        setTemplates(data.templates);
      } else {
        setTemplates([{ title: '', code: getStarter(id) }]);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([{ title: '', code: getStarter(id) }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = import.meta.env.PROD
        ? 'https://codeoptics.vercel.app'
        : 'http://localhost:3000';

      const res = await fetch(`${apiUrl}/api/template/${id}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ templates })
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('codeoptics_token');
        localStorage.removeItem('codeoptics_session');
        navigate('/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        showToast('Templates saved successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to save templates.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while saving.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addTemplate = () => {
    const newTemplates = [...templates, { title: '', code: getStarter(id) }];
    setTemplates(newTemplates);
    setActiveTab(newTemplates.length - 1);
  };

  const removeTemplate = (index) => {
    const updated = templates.filter((_, i) => i !== index);
    if (updated.length === 0) {
      updated.push({ title: '', code: getStarter(id) });
    }
    setTemplates(updated);
    setActiveTab(Math.max(0, index - 1));
  };

  const updateTitle = (index, value) => {
    const updated = [...templates];
    updated[index].title = value;
    setTemplates(updated);
  };

  const updateCode = (index, value) => {
    const updated = [...templates];
    updated[index].code = value || '';
    setTemplates(updated);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loading}>Loading your templates...</p>
        </div>
      </div>
    );
  }

  const activeTpl = templates[activeTab] || templates[0];

  return (
    <div className={styles.container}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => navigate(`/topic/${id}`)} className={styles.backBtn}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h1>{topicName} Templates</h1>
            <p className={styles.headerSubtitle}>Your personal code snippets — saved to the cloud</p>
          </div>
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

      {/* Tab Bar */}
      <div className={styles.tabBar}>
        <div className={styles.tabs}>
          {templates.map((tpl, index) => (
            <button
              key={index}
              className={`${styles.tab} ${activeTab === index ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(index)}
            >
              <span className={styles.tabLabel}>
                {tpl.title || `Template ${index + 1}`}
              </span>
              {templates.length > 1 && (
                <span
                  className={styles.tabClose}
                  onClick={(e) => { e.stopPropagation(); removeTemplate(index); }}
                  title="Remove"
                >
                  ×
                </span>
              )}
            </button>
          ))}
        </div>
        <button className={styles.addTabBtn} onClick={addTemplate} title="Add new template">
          <Plus size={16} />
        </button>
      </div>

      {/* Editor Area */}
      {activeTpl && (
        <div className={styles.editorArea}>
          {/* Template title input */}
          <div className={styles.titleRow}>
            <input
              type="text"
              placeholder="Template title (e.g. Lazy Propagation, Iterative Version…)"
              value={activeTpl.title}
              onChange={(e) => updateTitle(activeTab, e.target.value)}
              className={styles.titleInput}
            />
            <div className={styles.langBadge}>{language.toUpperCase()}</div>
          </div>

          {/* Monaco Editor */}
          <div className={styles.monacoWrapper}>
            <Editor
              height="calc(100vh - 260px)"
              language={language}
              value={activeTpl.code}
              onChange={(val) => updateCode(activeTab, val)}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                fontLigatures: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'off',
                bracketPairColorization: { enabled: true },
                renderLineHighlight: 'all',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                padding: { top: 16, bottom: 16 },
              }}
              loading={
                <div className={styles.editorLoading}>
                  <div className={styles.loadingSpinner} />
                  <span>Loading editor...</span>
                </div>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
