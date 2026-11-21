import { useState, useEffect } from 'react';
import './KMPVisualizer.css';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function KMPVisualizer() {
  const navigate = useNavigate();
  
  const [textInput, setTextInput] = useState('ABABDABACDABABCABAB');
  const [patternInput, setPatternInput] = useState('ABABCABAB');
  
  const [text, setText] = useState('');
  const [pattern, setPattern] = useState('');
  
  // LPS State
  const [lps, setLps] = useState([]);
  const [lpsI, setLpsI] = useState(-1);
  const [lpsLen, setLpsLen] = useState(-1);
  const [lpsActive, setLpsActive] = useState(-1);
  
  // Search State
  const [textI, setTextI] = useState(-1);
  const [patJ, setPatJ] = useState(-1);
  const [patOffset, setPatOffset] = useState(0);
  
  const [matchedIndices, setMatchedIndices] = useState(new Set()); // indices in text that are fully matched
  const [currentMatchStatus, setCurrentMatchStatus] = useState(''); // 'match', 'mismatch', ''
  
  const [logs, setLogs] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, id: Date.now() + Math.random() }]);
  };
  const clearLog = () => setLogs([]);
  const getSpeed = () => 800 / speedMultiplier;

  const startAlgorithm = async () => {
    if (isAnimating) return;
    if (!textInput || !patternInput) {
      alert("Please enter both text and pattern.");
      return;
    }
    if (patternInput.length > textInput.length) {
      alert("Pattern cannot be longer than text.");
      return;
    }
    
    setIsAnimating(true);
    setText(textInput);
    setPattern(patternInput);
    setMatchedIndices(new Set());
    setPatOffset(0);
    clearLog();
    
    addLog(`<b>Phase 1: Build LPS Array</b>`, 'info');
    const computedLPS = await buildLPS(patternInput);
    
    addLog(`<b>Phase 2: Search Pattern in Text</b>`, 'info');
    await searchKMP(textInput, patternInput, computedLPS);
    
    setIsAnimating(false);
  };

  const buildLPS = async (P) => {
    const m = P.length;
    const lpsArr = new Array(m).fill(0);
    setLps(new Array(m).fill('')); // Clear UI array
    
    let len = 0;
    let i = 1;
    
    setLpsI(i);
    setLpsLen(len);
    lpsArr[0] = 0;
    setLps(prev => { const n = [...prev]; n[0] = 0; return n; });
    
    addLog(`lps[0] is always 0. Starting i=1, len=0.`);
    await sleep(getSpeed());
    
    while (i < m) {
      setLpsI(i);
      setLpsLen(len);
      addLog(`Comparing P[${i}]('${P[i]}') and P[${len}]('${P[len]}')`);
      await sleep(getSpeed());
      
      if (P[i] === P[len]) {
        addLog(`Match found! Increment len and set lps[${i}].`, 'success');
        len++;
        lpsArr[i] = len;
        setLps(prev => { const n = [...prev]; n[i] = len; return n; });
        setLpsActive(i);
        await sleep(getSpeed());
        setLpsActive(-1);
        i++;
      } else {
        addLog(`Mismatch! P[${i}] != P[${len}].`, 'error');
        if (len !== 0) {
          addLog(`Falling back. len = lps[${len - 1}] = ${lpsArr[len - 1]}`, 'warning');
          setLpsActive(len - 1);
          await sleep(getSpeed());
          setLpsActive(-1);
          len = lpsArr[len - 1];
        } else {
          addLog(`len is 0. Setting lps[${i}] = 0 and advancing i.`);
          lpsArr[i] = 0;
          setLps(prev => { const n = [...prev]; n[i] = 0; return n; });
          setLpsActive(i);
          await sleep(getSpeed());
          setLpsActive(-1);
          i++;
        }
      }
    }
    
    setLpsI(-1);
    setLpsLen(-1);
    addLog(`<b>LPS Array Built!</b> [${lpsArr.join(', ')}]`, 'success');
    await sleep(getSpeed() * 2);
    return lpsArr;
  };

  const searchKMP = async (T, P, lpsArr) => {
    const n = T.length;
    const m = P.length;
    
    let i = 0; // Text pointer
    let j = 0; // Pattern pointer
    
    setPatOffset(0);
    
    while ((n - i) >= (m - j)) {
      setTextI(i);
      setPatJ(j);
      setCurrentMatchStatus('');
      
      addLog(`Comparing Text[${i}]('${T[i]}') and Pattern[${j}]('${P[j]}')`);
      await sleep(getSpeed());
      
      if (P[j] === T[i]) {
        setCurrentMatchStatus('match');
        await sleep(getSpeed() / 2);
        j++;
        i++;
      }
      
      if (j === m) {
        addLog(`<b>Pattern found at index ${i - j}!</b>`, 'success');
        setMatchedIndices(prev => {
          const next = new Set(prev);
          for(let k = i - j; k < i; k++) next.add(k);
          return next;
        });
        
        const fallback = lpsArr[j - 1];
        addLog(`Shifting pattern using LPS. j = lps[${j - 1}] = ${fallback}`, 'warning');
        setLpsActive(j - 1);
        await sleep(getSpeed());
        
        j = fallback;
        setPatOffset(i - j); // Shift UI pattern visually
        setLpsActive(-1);
        await sleep(getSpeed());
        
      } else if (i < n && P[j] !== T[i]) {
        setCurrentMatchStatus('mismatch');
        addLog(`Mismatch at Text[${i}] and Pattern[${j}]`, 'error');
        await sleep(getSpeed());
        
        if (j !== 0) {
          const fallback = lpsArr[j - 1];
          addLog(`Shifting pattern. j = lps[${j - 1}] = ${fallback}`, 'warning');
          setLpsActive(j - 1);
          await sleep(getSpeed());
          
          j = fallback;
          setPatOffset(i - j); // Shift UI pattern visually
          setLpsActive(-1);
          await sleep(getSpeed());
        } else {
          addLog(`j is 0. Moving text pointer i to ${i + 1}`);
          i++;
          setPatOffset(i); // Shift UI pattern visually
          await sleep(getSpeed());
        }
      }
    }
    
    setTextI(-1);
    setPatJ(-1);
    setCurrentMatchStatus('');
    addLog(`<b>Search Complete!</b>`, 'success');
  };

  return (
    <div className="kmp-container">
      <div className="kmp-header">
        <button className="kmp-back-btn" onClick={() => navigate('/topic/kmp')}>
          <ArrowLeft size={20} />
        </button>
        <h1>KMP Algorithm Visualizer</h1>
      </div>
      
      <div className="kmp-main">
        <div className="kmp-sidebar">
          <div className="kmp-sidebar-block">
            <label className="kmp-label">Text (Length N)</label>
            <input 
                type="text"
                className="kmp-input" 
                value={textInput} 
                onChange={(e) => setTextInput(e.target.value.toUpperCase())}
                disabled={isAnimating}
            />
          </div>
          
          <div className="kmp-sidebar-block">
            <label className="kmp-label">Pattern (Length M)</label>
            <input 
                type="text"
                className="kmp-input" 
                value={patternInput} 
                onChange={(e) => setPatternInput(e.target.value.toUpperCase())}
                disabled={isAnimating}
            />
          </div>

          <button className="kmp-btn" onClick={startAlgorithm} disabled={isAnimating}>Start KMP Search</button>

          <div className="kmp-sidebar-block" style={{marginTop: '10px'}}>
             <label className="kmp-label">Animation Speed: {speedMultiplier}x</label>
             <input type="range" min="0.5" max="3" step="0.5" value={speedMultiplier} onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))} disabled={isAnimating}/>
          </div>
          
          <div className="kmp-log-container" style={{marginTop: 'auto'}}>
            {logs.length === 0 ? (
              <div style={{color: '#64748b'}}>Enter text and pattern to visualize KMP...</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className={`kmp-log-entry ${log.type}`} dangerouslySetInnerHTML={{ __html: log.msg }} />
              ))
            )}
          </div>
        </div>

        <div className="kmp-content-wrapper">
            <div className="kmp-visualization-area">
                
                {text && (
                  <>
                    <h2 className="kmp-phase-title">Search Phase (O(N))</h2>
                    
                    {/* Text Row */}
                    <div className="kmp-row-container">
                        <div className="kmp-row-label">TEXT (i pointer)</div>
                        <div className="kmp-cells-wrapper">
                            {text.split('').map((char, idx) => {
                                let className = 'kmp-cell';
                                if (idx === textI) className += ' active-text';
                                if (idx === textI && currentMatchStatus === 'match') className += ' matched';
                                if (idx === textI && currentMatchStatus === 'mismatch') className += ' mismatched';
                                if (matchedIndices.has(idx)) className += ' global-match';
                                
                                return (
                                    <div key={`t-${idx}`} className={className}>
                                        <div className="kmp-cell-index">{idx}</div>
                                        {char}
                                        {idx === textI && <div className="kmp-cell-pointer pointer-text">↑ i</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Pattern Row (Sliding) */}
                    <div className="kmp-row-container" style={{ marginLeft: `${patOffset * 44}px`, transition: 'margin 0.3s ease-in-out' }}>
                        <div className="kmp-row-label">PATTERN (j pointer)</div>
                        <div className="kmp-cells-wrapper">
                            {pattern.split('').map((char, idx) => {
                                let className = 'kmp-cell';
                                if (idx === patJ) className += ' active-pattern';
                                if (idx === patJ && currentMatchStatus === 'match') className += ' matched';
                                if (idx === patJ && currentMatchStatus === 'mismatch') className += ' mismatched';
                                
                                return (
                                    <div key={`p-${idx}`} className={className}>
                                        <div className="kmp-cell-index">{idx}</div>
                                        {char}
                                        {idx === patJ && <div className="kmp-cell-pointer pointer-pat">↑ j</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                  </>
                )}

                {pattern && (
                  <div className="kmp-lps-container">
                    <h2 className="kmp-phase-title">LPS Array Construction (O(M))</h2>
                    
                    <div className="kmp-row-container">
                        <div className="kmp-row-label">PATTERN (i & len pointers)</div>
                        <div className="kmp-cells-wrapper">
                            {pattern.split('').map((char, idx) => {
                                let className = 'kmp-cell';
                                if (idx === lpsI) className += ' active-pattern';
                                if (idx === lpsLen) className += ' active-text'; // Reuse color
                                
                                return (
                                    <div key={`plps-${idx}`} className={className}>
                                        <div className="kmp-cell-index">{idx}</div>
                                        {char}
                                        {idx === lpsI && idx === lpsLen && <div className="kmp-cell-pointer">↑ len, i</div>}
                                        {idx === lpsI && idx !== lpsLen && <div className="kmp-cell-pointer pointer-i">↑ i</div>}
                                        {idx === lpsLen && idx !== lpsI && <div className="kmp-cell-pointer pointer-len">↑ len</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="kmp-row-container">
                        <div className="kmp-row-label">LPS ARRAY (lps)</div>
                        <div className="kmp-lps-table">
                            {lps.map((val, idx) => {
                                let className = 'kmp-lps-val';
                                if (idx === lpsActive) className += ' active';
                                return (
                                    <div key={`lps-${idx}`} className="kmp-lps-cell">
                                        <div className={className}>{val !== '' ? val : '-'}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
