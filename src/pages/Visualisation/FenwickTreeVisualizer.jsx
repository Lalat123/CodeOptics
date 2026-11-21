import { useState, useEffect, useRef } from 'react';
import './FenwickTreeVisualizer.css';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function FenwickTreeVisualizer() {
  const navigate = useNavigate();
  const [N, setN] = useState(8); // Max 16
  const [mode, setMode] = useState('PURQ'); // PURQ or RUPQ
  const [arr, setArr] = useState([]);
  const [bit, setBit] = useState([]);
  
  const [logs, setLogs] = useState([]);
  const [highlights, setHighlights] = useState({ nodes: {}, edges: {} });
  const [isAnimating, setIsAnimating] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  
  // Inputs
  const [updateIdx, setUpdateIdx] = useState(3);
  const [updateVal, setUpdateVal] = useState(5);
  
  const [updateL, setUpdateL] = useState(2);
  const [updateR, setUpdateR] = useState(5);
  
  const [queryIdx, setQueryIdx] = useState(6);
  const [queryL, setQueryL] = useState(2);
  const [queryR, setQueryR] = useState(5);

  const treeContainerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    initBIT(N);
  }, [N, mode]);
  
  useEffect(() => {
    const updateDims = () => {
      if (treeContainerRef.current) {
        setDimensions({
          width: treeContainerRef.current.clientWidth,
          height: treeContainerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateDims);
    setTimeout(updateDims, 100);
    return () => window.removeEventListener('resize', updateDims);
  }, [bit]);

  const initBIT = (size) => {
    const validSize = Math.min(Math.max(size, 4), 16);
    setN(validSize);
    setArr(new Array(validSize + 1).fill(0));
    setBit(new Array(validSize + 1).fill(0));
    setHighlights({ nodes: {}, edges: {} });
    clearLog();
  };

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, id: Date.now() + Math.random() }]);
  };
  const clearLog = () => setLogs([]);
  
  const getSpeed = () => 500 / speedMultiplier;

  const setNodeHighlight = (idx, type) => {
    setHighlights(prev => ({ ...prev, nodes: { ...prev.nodes, [idx]: type } }));
  };
  
  const setEdgeHighlight = (u, v, type) => {
    setHighlights(prev => ({ ...prev, edges: { ...prev.edges, [`${u}-${v}`]: type } }));
  };
  
  const resetHighlights = () => setHighlights({ nodes: {}, edges: {} });

  const LSB = (i) => i & -i;

  const animateAdd = async (idx, delta, currentBit, currentArr) => {
    addLog(`<b>add(${idx}, ${delta})</b>: Updating BIT array starting at index ${idx}`, 'info');
    
    // In PURQ, we also update the visual original array (for RUPQ, arr represents difference array visually or we just ignore it)
    if (mode === 'PURQ') {
      currentArr[idx] += delta;
      setArr([...currentArr]);
    }
    
    let i = idx;
    while (i <= N) {
      setNodeHighlight(i, 'computing');
      addLog(`Visiting BIT[${i}]. Adding ${delta}.`);
      
      await sleep(getSpeed());
      currentBit[i] += delta;
      setBit([...currentBit]);
      
      setNodeHighlight(i, 'visited');
      await sleep(getSpeed() / 2);
      
      const nextI = i + LSB(i);
      if (nextI <= N) {
        addLog(`Next index: i + LSB(i) = ${i} + ${LSB(i)} = ${nextI}`);
        setEdgeHighlight(i, nextI, 'visited');
        await sleep(getSpeed());
      } else {
        addLog(`Next index: ${i} + ${LSB(i)} = ${nextI} (Out of bounds)`);
      }
      i = nextI;
    }
    
    addLog(`<b>Add completed</b>`, 'success');
  };

  const animateQuery = async (idx, currentBit) => {
    addLog(`<b>query(${idx})</b>: Summing BIT array going down from index ${idx}`, 'info');
    let sum = 0;
    let i = idx;
    
    if (i === 0) {
       addLog(`Query index is 0, sum is 0.`, 'success');
       return 0;
    }

    while (i > 0) {
      setNodeHighlight(i, 'computing');
      addLog(`Visiting BIT[${i}]. Adding ${currentBit[i]} to sum.`);
      
      await sleep(getSpeed());
      sum += currentBit[i];
      addLog(`Current sum = ${sum}`);
      
      setNodeHighlight(i, 'result');
      await sleep(getSpeed() / 2);
      
      const nextI = i - LSB(i);
      if (nextI > 0) {
        addLog(`Next index: i - LSB(i) = ${i} - ${LSB(i)} = ${nextI}`);
        // Reverse edge highlight for query
        setEdgeHighlight(nextI, i, 'visited'); 
        await sleep(getSpeed());
      } else {
         addLog(`Next index: ${i} - ${LSB(i)} = 0. Finished.`);
      }
      i = nextI;
    }
    
    addLog(`<b>Total sum = ${sum}</b>`, 'success');
    return sum;
  };

  // --- Handlers ---
  
  const handlePointUpdate = async () => {
    if (isAnimating) return;
    if (updateIdx < 1 || updateIdx > N) return alert('Index out of bounds');
    setIsAnimating(true);
    resetHighlights();
    clearLog();
    
    let currentBit = [...bit];
    let currentArr = [...arr];
    await animateAdd(updateIdx, updateVal, currentBit, currentArr);
    
    resetHighlights();
    setIsAnimating(false);
  };
  
  const handleRangeQuery = async () => {
    if (isAnimating) return;
    if (queryL < 1 || queryR > N || queryL > queryR) return alert('Invalid range');
    setIsAnimating(true);
    resetHighlights();
    clearLog();
    
    let currentBit = [...bit];
    addLog(`Range Query [${queryL}, ${queryR}] = query(${queryR}) - query(${queryL - 1})`, 'info');
    
    await sleep(getSpeed());
    const sumR = await animateQuery(queryR, currentBit);
    
    resetHighlights();
    await sleep(getSpeed());
    
    const sumL = await animateQuery(queryL - 1, currentBit);
    
    addLog(`<b>Final Range Sum: ${sumR} - ${sumL} = ${sumR - sumL}</b>`, 'success');
    
    await sleep(getSpeed());
    resetHighlights();
    setIsAnimating(false);
  };
  
  const handleRangeUpdate = async () => {
    if (isAnimating) return;
    if (updateL < 1 || updateR > N || updateL > updateR) return alert('Invalid range');
    setIsAnimating(true);
    resetHighlights();
    clearLog();
    
    addLog(`<b>Range Update [${updateL}, ${updateR}] by ${updateVal}</b>`, 'info');
    addLog(`Using Difference Array logic: add(${updateL}, ${updateVal}) and add(${updateR + 1}, ${-updateVal})`);
    await sleep(getSpeed());
    
    let currentBit = [...bit];
    let currentArr = [...arr]; // we can use it to store diff
    
    await animateAdd(updateL, updateVal, currentBit, currentArr);
    
    resetHighlights();
    await sleep(getSpeed());
    
    if (updateR + 1 <= N) {
      await animateAdd(updateR + 1, -updateVal, currentBit, currentArr);
    } else {
      addLog(`${updateR + 1} is out of bounds, no need for second update.`, 'warning');
    }
    
    resetHighlights();
    setIsAnimating(false);
  };
  
  const handlePointQuery = async () => {
    if (isAnimating) return;
    if (queryIdx < 1 || queryIdx > N) return alert('Invalid index');
    setIsAnimating(true);
    resetHighlights();
    clearLog();
    
    addLog(`<b>Point Query at ${queryIdx}</b> using Difference Array prefix sum`, 'info');
    await sleep(getSpeed());
    
    let currentBit = [...bit];
    await animateQuery(queryIdx, currentBit);
    
    await sleep(getSpeed());
    resetHighlights();
    setIsAnimating(false);
  };

  // --- Rendering ---
  
  // Calculate Tree Coordinates
  const coords = {};
  if (dimensions.width > 0) {
    const spacingX = dimensions.width / (N + 1);
    
    // Find max height
    const maxLog = Math.floor(Math.log2(N)) + 1;
    const spacingY = (dimensions.height - 80) / maxLog;
    
    for (let i = 1; i <= N; i++) {
      const lsb = LSB(i);
      const level = Math.log2(lsb); // 0-based level
      coords[i] = {
        x: i * spacingX,
        y: dimensions.height - 40 - (level * spacingY)
      };
    }
  }

  const renderEdges = () => {
    const edges = [];
    for (let i = 1; i <= N; i++) {
      const parentIdx = i + LSB(i);
      if (parentIdx <= N && coords[i] && coords[parentIdx]) {
        const edgeId = `${i}-${parentIdx}`;
        edges.push(
          <line 
              key={`e-${i}`} 
              x1={coords[i].x} 
              y1={coords[i].y} 
              x2={coords[parentIdx].x} 
              y2={coords[parentIdx].y} 
              className={`fenwick-edge ${highlights.edges[edgeId] || ''}`} 
          />
        );
      }
    }
    return edges;
  };

  const renderNodes = () => {
    const nodes = [];
    for (let i = 1; i <= N; i++) {
      const pos = coords[i];
      if (!pos) break;
      const hClass = highlights.nodes[i] || '';
      
      nodes.push(
        <div key={`n-${i}`} className={`fenwick-tree-node ${hClass}`} style={{ left: pos.x, top: pos.y }}>
          <div className="fenwick-node-circle">{i}</div>
          <div className="fenwick-node-info">BIT[{i}] = {bit[i]}</div>
        </div>
      );
    }
    return nodes;
  };

  return (
    <div className="fenwick-container">
      <div className="fenwick-header">
        <button className="fenwick-back-btn" onClick={() => navigate('/topic/fenwick-tree')}>
          <ArrowLeft size={20} />
        </button>
        <h1>Fenwick Tree Visualizer</h1>
      </div>
      
      <div className="fenwick-main">
        <div className="fenwick-sidebar">
          
          <div className="fenwick-sidebar-block">
            <label className="fenwick-label">Tree Size (N)</label>
            <input type="number" min="4" max="16" className="fenwick-input" value={N} onChange={(e) => !isAnimating && setN(parseInt(e.target.value) || 8)} />
            <button className="fenwick-btn" style={{marginTop: '5px', background: '#475569'}} onClick={() => !isAnimating && initBIT(N)}>Reset Tree</button>
          </div>
          
          <div className="fenwick-sidebar-block" style={{marginTop: '10px'}}>
            <label className="fenwick-label">Mode</label>
            <div className="fenwick-controls">
              <button className={mode === 'PURQ' ? 'active' : ''} onClick={() => !isAnimating && setMode('PURQ')}>PURQ</button>
              <button className={mode === 'RUPQ' ? 'active' : ''} onClick={() => !isAnimating && setMode('RUPQ')}>RUPQ</button>
            </div>
            <p style={{fontSize: '11px', color: '#64748b', marginTop: '2px'}}>
              {mode === 'PURQ' ? 'Point Update, Range Query' : 'Range Update, Point Query (Diff Array)'}
            </p>
          </div>
          
          <div className="fenwick-sidebar-block" style={{marginTop: '10px'}}>
             <label className="fenwick-label">Animation Speed: {speedMultiplier}x</label>
             <input type="range" min="0.5" max="3" step="0.5" value={speedMultiplier} onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))} />
          </div>
          
          <hr style={{border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '15px 0'}} />

          {/* PURQ Controls */}
          {mode === 'PURQ' && (
            <>
              <div className="fenwick-sidebar-block">
                <label className="fenwick-label">Point Update</label>
                <div style={{display: 'flex', gap: '10px'}}>
                  <div>
                    <span style={{fontSize: '11px', color: '#94a3b8'}}>Index (1-N)</span>
                    <input type="number" className="fenwick-input" value={updateIdx} onChange={e=>setUpdateIdx(parseInt(e.target.value))} disabled={isAnimating} />
                  </div>
                  <div>
                    <span style={{fontSize: '11px', color: '#94a3b8'}}>Value</span>
                    <input type="number" className="fenwick-input" value={updateVal} onChange={e=>setUpdateVal(parseInt(e.target.value))} disabled={isAnimating} />
                  </div>
                </div>
                <button className="fenwick-btn" style={{marginTop: '5px', background: '#ea580c'}} onClick={handlePointUpdate} disabled={isAnimating}>Execute Update</button>
              </div>
              
              <div className="fenwick-sidebar-block" style={{marginTop: '15px'}}>
                <label className="fenwick-label">Range Query</label>
                <div style={{display: 'flex', gap: '10px'}}>
                  <div>
                    <span style={{fontSize: '11px', color: '#94a3b8'}}>Start (L)</span>
                    <input type="number" className="fenwick-input" value={queryL} onChange={e=>setQueryL(parseInt(e.target.value))} disabled={isAnimating} />
                  </div>
                  <div>
                    <span style={{fontSize: '11px', color: '#94a3b8'}}>End (R)</span>
                    <input type="number" className="fenwick-input" value={queryR} onChange={e=>setQueryR(parseInt(e.target.value))} disabled={isAnimating} />
                  </div>
                </div>
                <button className="fenwick-btn" style={{marginTop: '5px', background: '#22c55e'}} onClick={handleRangeQuery} disabled={isAnimating}>Execute Query</button>
              </div>
            </>
          )}

          {/* RUPQ Controls */}
          {mode === 'RUPQ' && (
            <>
              <div className="fenwick-sidebar-block">
                <label className="fenwick-label">Range Update</label>
                <div style={{display: 'flex', gap: '10px'}}>
                  <div>
                    <span style={{fontSize: '11px', color: '#94a3b8'}}>Start (L)</span>
                    <input type="number" className="fenwick-input" value={updateL} onChange={e=>setUpdateL(parseInt(e.target.value))} disabled={isAnimating} />
                  </div>
                  <div>
                    <span style={{fontSize: '11px', color: '#94a3b8'}}>End (R)</span>
                    <input type="number" className="fenwick-input" value={updateR} onChange={e=>setUpdateR(parseInt(e.target.value))} disabled={isAnimating} />
                  </div>
                </div>
                <div style={{marginTop: '5px'}}>
                    <span style={{fontSize: '11px', color: '#94a3b8'}}>Value</span>
                    <input type="number" className="fenwick-input" value={updateVal} onChange={e=>setUpdateVal(parseInt(e.target.value))} disabled={isAnimating} />
                </div>
                <button className="fenwick-btn" style={{marginTop: '5px', background: '#ea580c'}} onClick={handleRangeUpdate} disabled={isAnimating}>Execute Update</button>
              </div>
              
              <div className="fenwick-sidebar-block" style={{marginTop: '15px'}}>
                <label className="fenwick-label">Point Query</label>
                <div style={{display: 'flex', gap: '10px'}}>
                  <div style={{width: '100%'}}>
                    <span style={{fontSize: '11px', color: '#94a3b8'}}>Index (1-N)</span>
                    <input type="number" className="fenwick-input" value={queryIdx} onChange={e=>setQueryIdx(parseInt(e.target.value))} disabled={isAnimating} />
                  </div>
                </div>
                <button className="fenwick-btn" style={{marginTop: '5px', background: '#22c55e'}} onClick={handlePointQuery} disabled={isAnimating}>Execute Query</button>
              </div>
            </>
          )}
          
        </div>

        <div className="fenwick-canvas">
          
          <div className="fenwick-arrays">
            <div className="fenwick-array-row">
              <div className="fenwick-array-label">BIT[]</div>
              <div className="fenwick-array-cells">
                <div className="fenwick-cell-wrapper">
                  <span className="fenwick-index">0</span>
                  <div className="fenwick-cell dummy">0</div>
                  <span className="fenwick-binary">0000</span>
                </div>
                {bit.slice(1).map((val, i) => {
                  const idx = i + 1;
                  const bin = idx.toString(2).padStart(4, '0');
                  const hClass = highlights.nodes[idx] || '';
                  return (
                    <div key={`bit-${idx}`} className="fenwick-cell-wrapper">
                      <span className="fenwick-index">{idx}</span>
                      <div className={`fenwick-cell ${hClass}`}>{val}</div>
                      <span className="fenwick-binary">{bin}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {mode === 'PURQ' && (
              <div className="fenwick-array-row">
                <div className="fenwick-array-label">ARR[]</div>
                <div className="fenwick-array-cells">
                  <div className="fenwick-cell-wrapper">
                    <span className="fenwick-index">0</span>
                    <div className="fenwick-cell dummy">0</div>
                  </div>
                  {arr.slice(1).map((val, i) => {
                    const idx = i + 1;
                    return (
                      <div key={`arr-${idx}`} className="fenwick-cell-wrapper">
                        <span className="fenwick-index">{idx}</span>
                        <div className="fenwick-cell">{val}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {mode === 'RUPQ' && (
              <div className="fenwick-array-row">
                <div className="fenwick-array-label" style={{fontSize: '11px'}}>DIFF[]</div>
                <div className="fenwick-array-cells">
                  <div className="fenwick-cell-wrapper">
                    <span className="fenwick-index">0</span>
                    <div className="fenwick-cell dummy">0</div>
                  </div>
                  {arr.slice(1).map((val, i) => {
                    const idx = i + 1;
                    return (
                      <div key={`arr-${idx}`} className="fenwick-cell-wrapper">
                        <span className="fenwick-index">{idx}</span>
                        <div className="fenwick-cell">{val}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div className="fenwick-tree-svg-container" ref={treeContainerRef}>
            <svg className="fenwick-tree-svg">
              {renderEdges()}
            </svg>
            <div className="fenwick-tree-nodes">
              {renderNodes()}
            </div>
          </div>
          
        </div>
      </div>
      
      <div className="fenwick-log-container">
        {logs.length === 0 ? (
          <div style={{color: '#64748b'}}>Run an operation to see the step-by-step bitwise execution logic here...</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className={`fenwick-log-entry ${log.type}`} dangerouslySetInnerHTML={{ __html: log.msg }} />
          ))
        )}
      </div>
      
    </div>
  );
}
