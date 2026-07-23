import { useState, useEffect } from 'react';
import './SparseTableVisualizer.css';
import { ArrowLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
};

export default function SparseTableVisualizer() {
  const navigate = useNavigate();
  const [N, setN] = useState(8);
  const [opType, setOpType] = useState('min');
  const [arr, setArr] = useState([]);
  const [st, setSt] = useState([]);
  const [logs, setLogs] = useState([]);
  const [highlights, setHighlights] = useState({ cells: {} });
  const [isAnimating, setIsAnimating] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState('build');
  
  const [customArrayInput, setCustomArrayInput] = useState('');
  const [queryL, setQueryL] = useState(0);
  const [queryR, setQueryR] = useState(7);
  const [queryResult, setQueryResult] = useState(null);

  useEffect(() => {
    generateRandomArray(N);
  }, [N]);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, id: Date.now() + Math.random() }]);
  };
  const clearLog = () => setLogs([]);

  const generateRandomArray = (size) => {
    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 50) + 1);
    setArr(newArr);
    setSt([]);
    setQueryResult(null);
    clearLog();
    setHighlights({ cells: {} });
  };

  const handleApplyCustomArray = () => {
    if(isAnimating) return;
    const parsed = customArrayInput.split(/[\s,]+/).filter(Boolean).map(Number);
    if (parsed.length > 0 && !parsed.some(isNaN)) {
      setN(parsed.length);
      setArr(parsed);
      setSt([]);
      setQueryResult(null);
      setHighlights({ cells: {} });
    } else {
      alert("Invalid array input.");
    }
  };

  const combine = (a, b) => {
    if (opType === 'min') return Math.min(a, b);
    if (opType === 'max') return Math.max(a, b);
    if (opType === 'gcd') return gcd(a, b);
    return 0;
  };

  const getAnimationSpeed = () => 500 / speedMultiplier;

  const setCellHighlight = (i, j, type) => {
    setHighlights(prev => ({ ...prev, cells: { ...prev.cells, [`${i}-${j}`]: type } }));
  };
  const resetHighlights = () => setHighlights({ cells: {} });

  const buildSparseTable = async () => {
    if (isAnimating) return;
    if (arr.length === 0) return;
    
    setIsAnimating(true);
    resetHighlights();
    clearLog();
    setQueryResult(null);
    addLog(`<b>Starting Sparse Table Construction (${opType.toUpperCase()})</b>`, 'info');

    const K = Math.floor(Math.log2(arr.length)) + 1;
    let table = Array.from({ length: arr.length }, () => new Array(K).fill(null));
    
    // Level 0
    addLog('Building Level 0 (Intervals of length 1)');
    for (let i = 0; i < arr.length; i++) {
      table[i][0] = arr[i];
      setCellHighlight(i, 0, 'computing');
      setSt([...table.map(row => [...row])]);
      await sleep(getAnimationSpeed() / 2);
      setCellHighlight(i, 0, 'result');
    }
    await sleep(getAnimationSpeed());
    resetHighlights();

    // Levels 1 to K
    for (let j = 1; (1 << j) <= arr.length; j++) {
      addLog(`<b>Building Level ${j} (Intervals of length ${1 << j})</b>`, 'info');
      for (let i = 0; i + (1 << j) - 1 < arr.length; i++) {
        const leftIdx = i;
        const rightIdx = i + (1 << (j - 1));
        
        setCellHighlight(leftIdx, j - 1, 'source');
        setCellHighlight(rightIdx, j - 1, 'source');
        setCellHighlight(i, j, 'computing');
        
        addLog(`Computing ST[${i}][${j}] from ST[${leftIdx}][${j-1}] and ST[${rightIdx}][${j-1}]`);
        await sleep(getAnimationSpeed());
        
        table[i][j] = combine(table[leftIdx][j - 1], table[rightIdx][j - 1]);
        setSt([...table.map(row => [...row])]);
        
        setCellHighlight(leftIdx, j - 1, '');
        setCellHighlight(rightIdx, j - 1, '');
        setCellHighlight(i, j, 'result');
        await sleep(getAnimationSpeed() / 2);
        setCellHighlight(i, j, '');
      }
    }

    addLog('<b>Sparse Table Built Successfully!</b>', 'success');
    setIsAnimating(false);
  };

  const handleQuery = async () => {
    if (isAnimating) return;
    if (st.length === 0) {
      alert("Please build the Sparse Table first!");
      return;
    }
    if (queryL > queryR || queryL < 0 || queryR >= arr.length) return alert('Invalid query range');
    
    setIsAnimating(true);
    resetHighlights();
    setQueryResult(null);
    clearLog();
    addLog(`<b>Starting O(1) Range Query</b>: [${queryL}, ${queryR}]`, 'info');
    
    const len = queryR - queryL + 1;
    const k = Math.floor(Math.log2(len));
    addLog(`Length = ${len}. Largest power of 2 fitting in length is 2^${k} = ${1 << k}`);
    await sleep(getAnimationSpeed());
    
    const leftIdx = queryL;
    const rightIdx = queryR - (1 << k) + 1;
    
    addLog(`Taking overlapping intervals of length ${1 << k}:`);
    addLog(`- Left Interval starting at ${leftIdx}: ST[${leftIdx}][${k}]`);
    addLog(`- Right Interval starting at ${rightIdx}: ST[${rightIdx}][${k}]`);
    
    setCellHighlight(leftIdx, k, 'source'); // Left block highlight
    await sleep(getAnimationSpeed());
    setCellHighlight(rightIdx, k, 'computing'); // Right block highlight
    await sleep(getAnimationSpeed() * 1.5);
    
    const val1 = st[leftIdx][k];
    const val2 = st[rightIdx][k];
    const res = combine(val1, val2);
    
    setQueryResult({ val1, val2, res });
    addLog(`<b>Query Result: ${res}</b>`, 'success');
    
    await sleep(getAnimationSpeed());
    setCellHighlight(leftIdx, k, '');
    setCellHighlight(rightIdx, k, '');
    setIsAnimating(false);
  };

  const toggleAccordion = (name) => {
    setActiveAccordion(activeAccordion === name ? '' : name);
  };

  const maxJ = st.length > 0 ? st[0].length : 0;

  return (
    <div className="st-container">
      <div className="st-header">
        <button className="st-back-btn" onClick={() => navigate('/topic/sparse-table')}>
          <ArrowLeft size={20} />
        </button>
        <h1>Sparse Table Visualizer</h1>
      </div>
      
      <div className="st-main">
        <div className="st-sidebar">
          <div className="st-sidebar-block">
            <label className="st-label">Select Operation</label>
            <div className="st-controls">
              <button className={opType === 'min' ? 'active' : ''} onClick={() => !isAnimating && setOpType('min')}>MIN</button>
              <button className={opType === 'max' ? 'active' : ''} onClick={() => !isAnimating && setOpType('max')}>MAX</button>
              <button className={opType === 'gcd' ? 'active' : ''} onClick={() => !isAnimating && setOpType('gcd')}>GCD</button>
            </div>
            <p style={{fontSize: '12px', color: '#64748b', marginTop: 0}}>Sparse Tables require idempotent functions for O(1) queries.</p>
          </div>

          <div className="st-sidebar-block">
            <label className="st-label">Array Setup</label>
            <input 
              type="text" 
              className="st-input" 
              placeholder="Custom array (comma separated)" 
              value={customArrayInput}
              onChange={(e) => setCustomArrayInput(e.target.value)}
              disabled={isAnimating}
            />
            <div style={{display: 'flex', gap: '10px'}}>
              <button className="st-btn" style={{background: '#3b82f6'}} onClick={handleApplyCustomArray} disabled={isAnimating}>Apply</button>
              <button className="st-btn" style={{background: '#64748b'}} onClick={() => generateRandomArray(N)} disabled={isAnimating}>Randomize</button>
            </div>
          </div>

          <div className="st-sidebar-block">
            <label className="st-label">Speed: {speedMultiplier}x</label>
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.5" 
              value={speedMultiplier} 
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              style={{width: '100%'}}
            />
          </div>

          <div className="st-sidebar-block">
            <label className="st-label">1. Build Table</label>
            <button className="st-btn" onClick={buildSparseTable} disabled={isAnimating} style={{background: '#8b5cf6'}}>
              Start Build Animation
            </button>
          </div>

          <div className="st-sidebar-block">
            <label className="st-label">2. Range Query O(1)</label>
            <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
              <div>
                <label style={{fontSize: '12px', color: '#94a3b8'}}>Start L</label>
                <input type="number" className="st-input" value={queryL} onChange={e=>setQueryL(parseInt(e.target.value))} disabled={isAnimating} />
              </div>
              <div>
                <label style={{fontSize: '12px', color: '#94a3b8'}}>End R</label>
                <input type="number" className="st-input" value={queryR} onChange={e=>setQueryR(parseInt(e.target.value))} disabled={isAnimating} />
              </div>
            </div>
            <button className="st-btn" onClick={handleQuery} disabled={isAnimating} style={{background: '#f59e0b'}}>
              Execute Query
            </button>
          </div>
        </div>

        <div className="st-canvas">
          <div className="st-matrix">
            {st.length > 0 && (
              <div className="st-row">
                <div className="st-row-label"></div>
                {st.map((_, i) => (
                  <div key={`header-${i}`} className="st-cell-wrapper" style={{width: '50px'}}>
                    <span className="st-col-label">i={i}</span>
                  </div>
                ))}
              </div>
            )}
            
            {st.length > 0 ? Array.from({length: maxJ}).map((_, j) => (
              <div key={`row-j-${j}`} className="st-row">
                <div className="st-row-label" style={{flexDirection: 'column', gap: '2px', alignItems: 'flex-end', justifyContent: 'center'}}>
                  <span>j={j}</span>
                  <span style={{fontSize: '10px'}}>len={1<<j}</span>
                </div>
                {st.map((row, i) => {
                  const val = row[j];
                  const isValid = i + (1 << j) - 1 < arr.length;
                  return (
                    <div 
                      key={`cell-${i}-${j}`} 
                      className={`st-cell ${isValid ? '' : 'empty'} ${highlights.cells[`${i}-${j}`] || ''}`}
                    >
                      {val !== null ? val : ''}
                    </div>
                  );
                })}
              </div>
            )) : (
              <div style={{color: '#64748b', marginTop: '100px', fontSize: '18px'}}>
                Click "Start Build Animation" to construct the Sparse Table
              </div>
            )}
          </div>
          
          {queryResult && (
            <div className="query-overlay">
              <div className="query-title">Query overlapping intervals</div>
              <div className="query-blocks">
                <div className="query-block block-left">{queryResult.val1}</div>
                <div className="query-op">{opType.toUpperCase()}</div>
                <div className="query-block block-right">{queryResult.val2}</div>
                <div className="query-op">=</div>
                <div className="query-block" style={{borderColor: '#22c55e', color: '#4ade80'}}>{queryResult.res}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="st-log-container">
        {logs.length === 0 ? (
          <div style={{color: '#475569'}}>Execution logs will appear here...</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className={`st-log-entry ${log.type}`} dangerouslySetInnerHTML={{ __html: log.msg }} />
          ))
        )}
      </div>
    </div>
  );
}
