import { useState, useEffect, useRef } from 'react';
import './LCAVisualizer.css';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_EDGES = "0 1\n0 2\n1 3\n1 4\n2 5\n2 6\n4 7\n4 8\n7 9";

export default function LCAVisualizer() {
  const navigate = useNavigate();
  const [edgesInput, setEdgesInput] = useState(DEFAULT_EDGES);
  
  const [N, setN] = useState(0);
  const [depth, setDepth] = useState([]);
  const [up, setUp] = useState([]);
  const LOG = 4; // Max nodes 16, so log is 4
  
  const [uNode, setUNode] = useState(9);
  const [vNode, setVNode] = useState(5);
  
  const [activeU, setActiveU] = useState(-1);
  const [activeV, setActiveV] = useState(-1);
  const [lcaResult, setLcaResult] = useState(-1);
  
  const [jumpEdges, setJumpEdges] = useState([]); // {u, v, color}
  const [activeCell, setActiveCell] = useState({u: -1, i: -1, type: ''});
  
  const [logs, setLogs] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  
  const treeContainerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [coords, setCoords] = useState({});
  const [adj, setAdj] = useState([]);

  useEffect(() => {
    buildTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
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
  }, [N]);

  useEffect(() => {
    if (dimensions.width > 0 && N > 0) {
      calculateLayout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, depth]);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, id: Date.now() + Math.random() }]);
  };
  const clearLog = () => setLogs([]);
  const getSpeed = () => 800 / speedMultiplier;

  const buildTree = () => {
    const lines = edgesInput.trim().split('\n');
    let maxNode = -1;
    const edges = [];
    
    for (let line of lines) {
      const parts = line.match(/\d+/g);
      if (parts && parts.length >= 2) {
        const u = parseInt(parts[0]);
        const v = parseInt(parts[1]);
        edges.push([u, v]);
        maxNode = Math.max(maxNode, u, v);
      }
    }
    
    const n = maxNode + 1;
    if (n === 0 || n > 20) {
      alert("Please provide a valid tree (Max 20 nodes 0-19).");
      return;
    }
    
    const adjacency = Array.from({length: n}, () => []);
    for (let [u, v] of edges) {
      adjacency[u].push(v);
      adjacency[v].push(u);
    }
    
    // Check if it's a valid tree from root 0
    const d = new Array(n).fill(0);
    const uTable = Array.from({length: n}, () => new Array(LOG).fill(-1));
    const visited = new Array(n).fill(false);
    
    const dfs = (curr, p, dep) => {
      visited[curr] = true;
      d[curr] = dep;
      uTable[curr][0] = p;
      
      for (let i = 1; i < LOG; i++) {
        if (uTable[curr][i-1] !== -1) {
          uTable[curr][i] = uTable[uTable[curr][i-1]][i-1];
        } else {
          uTable[curr][i] = -1;
        }
      }
      
      for (let nxt of adjacency[curr]) {
        if (nxt !== p) {
          if (visited[nxt]) {
            return false; // Cycle detected
          }
          dfs(nxt, curr, dep + 1);
        }
      }
      return true;
    };
    
    const isValid = dfs(0, -1, 0);
    
    if (!isValid || visited.some(v => !v)) {
       alert("Graph is not a valid single tree rooted at 0.");
       return;
    }
    
    setN(n);
    setAdj(adjacency);
    setDepth(d);
    setUp(uTable);
    setActiveU(-1);
    setActiveV(-1);
    setLcaResult(-1);
    setJumpEdges([]);
    setActiveCell({u: -1, i: -1, type: ''});
    clearLog();
    addLog(`Tree built with ${n} nodes. DP table computed.`, 'success');
  };

  const calculateLayout = () => {
    // Group by depth
    const byDepth = [];
    let maxDepth = 0;
    for (let i = 0; i < N; i++) {
      if (!byDepth[depth[i]]) byDepth[depth[i]] = [];
      byDepth[depth[i]].push(i);
      maxDepth = Math.max(maxDepth, depth[i]);
    }
    
    const newCoords = {};
    const marginY = 40;
    const spacingY = maxDepth > 0 ? (dimensions.height - 2 * marginY) / maxDepth : 0;
    
    for (let d = 0; d <= maxDepth; d++) {
      const nodesAtDepth = byDepth[d] || [];
      const marginX = 20;
      const spacingX = (dimensions.width - 2 * marginX) / (nodesAtDepth.length + 1);
      
      // Sort nodes to avoid edge crossings (simple heuristic: sort by parent)
      nodesAtDepth.sort((a, b) => up[a][0] - up[b][0]);
      
      for (let i = 0; i < nodesAtDepth.length; i++) {
        const node = nodesAtDepth[i];
        newCoords[node] = {
          x: marginX + (i + 1) * spacingX,
          y: marginY + d * spacingY
        };
      }
    }
    setCoords(newCoords);
  };

  const findLCA = async () => {
    if (isAnimating) return;
    if (uNode < 0 || uNode >= N || vNode < 0 || vNode >= N) {
      alert("Invalid nodes.");
      return;
    }
    
    setIsAnimating(true);
    setJumpEdges([]);
    setLcaResult(-1);
    clearLog();
    
    let u = uNode;
    let v = vNode;
    setActiveU(u);
    setActiveV(v);
    
    addLog(`<b>Finding LCA(${u}, ${v})</b>`, 'info');
    await sleep(getSpeed());
    
    if (depth[u] < depth[v]) {
      addLog(`depth[${u}] (${depth[u]}) < depth[${v}] (${depth[v]}). Swapping nodes.`);
      const temp = u;
      u = v;
      v = temp;
      setActiveU(u);
      setActiveV(v);
      await sleep(getSpeed());
    }
    
    // Phase 1
    addLog(`<b>Phase 1: Equating Depths</b>`, 'info');
    const diff = depth[u] - depth[v];
    addLog(`Height difference k = ${diff}`);
    await sleep(getSpeed());
    
    for (let i = 0; i < LOG; i++) {
      if (diff & (1 << i)) {
        addLog(`k has bit ${i} set (2^${i} = ${1<<i}). Jumping U by 2^${i}.`);
        setActiveCell({u, i, type: 'u'});
        await sleep(getSpeed());
        
        const nxtU = up[u][i];
        setJumpEdges(prev => [...prev, {from: u, to: nxtU, color: '#3b82f6'}]);
        u = nxtU;
        setActiveU(u);
        setActiveCell({u: -1, i: -1, type: ''});
        
        addLog(`U is now at node ${u} (depth ${depth[u]}).`);
        await sleep(getSpeed());
      }
    }
    
    if (u === v) {
      addLog(`<b>Nodes matched! LCA is ${u}</b>`, 'success');
      setLcaResult(u);
      setIsAnimating(false);
      return;
    }
    
    addLog(`<b>Phase 2: Jump Together</b>`, 'info');
    await sleep(getSpeed());
    
    for (let i = LOG - 1; i >= 0; i--) {
      setActiveCell({u, v, i, type: 'both'}); // Highlight both cells in table
      addLog(`Checking jump 2^${i} = ${1<<i}...`);
      await sleep(getSpeed());
      
      if (up[u][i] !== -1 && up[u][i] !== up[v][i]) {
        addLog(`up[${u}][${i}] (${up[u][i]}) != up[${v}][${i}] (${up[v][i]}). Take jump!`);
        
        const nxtU = up[u][i];
        const nxtV = up[v][i];
        
        setJumpEdges(prev => [
            ...prev, 
            {from: u, to: nxtU, color: '#3b82f6'},
            {from: v, to: nxtV, color: '#ea580c'}
        ]);
        
        u = nxtU;
        v = nxtV;
        setActiveU(u);
        setActiveV(v);
      } else {
        if (up[u][i] === -1) {
            addLog(`up[${u}][${i}] is Out of Bounds. Don't jump.`);
        } else {
            addLog(`up[${u}][${i}] == up[${v}][${i}] == ${up[u][i]}. Don't jump (might overshoot).`, 'warning');
        }
      }
      setActiveCell({u: -1, i: -1, type: ''});
      await sleep(getSpeed());
    }
    
    const lca = up[u][0];
    addLog(`Nodes are now children of the LCA.`, 'info');
    addLog(`<b>LCA is up[${u}][0] = ${lca}</b>`, 'success');
    
    setJumpEdges(prev => [
        ...prev, 
        {from: u, to: lca, color: '#16a34a'},
        {from: v, to: lca, color: '#16a34a'}
    ]);
    setActiveU(lca);
    setActiveV(lca);
    setLcaResult(lca);
    
    setIsAnimating(false);
  };

  const renderTreeEdges = () => {
    const elements = [];
    // Normal Edges
    for (let i = 1; i < N; i++) {
      const p = up[i][0];
      if (p !== -1 && coords[i] && coords[p]) {
        elements.push(
          <line key={`tree-e-${i}`} x1={coords[i].x} y1={coords[i].y} x2={coords[p].x} y2={coords[p].y} className="lca-edge" />
        );
      }
    }
    
    // Jump Edges
    jumpEdges.forEach((je, idx) => {
        if (coords[je.from] && coords[je.to]) {
            // Draw slightly curved line for jumps
            const mx = (coords[je.from].x + coords[je.to].x) / 2 + 30;
            const my = (coords[je.from].y + coords[je.to].y) / 2;
            elements.push(
                <path 
                    key={`je-${idx}`} 
                    d={`M ${coords[je.from].x} ${coords[je.from].y} Q ${mx} ${my} ${coords[je.to].x} ${coords[je.to].y}`}
                    className="lca-jump-edge"
                    style={{stroke: je.color}}
                />
            );
        }
    });
    
    return elements;
  };

  const renderTreeNodes = () => {
    const nodes = [];
    for (let i = 0; i < N; i++) {
      const pos = coords[i];
      if (!pos) continue;
      
      let classNames = 'lca-node';
      if (i === lcaResult) classNames += ' lca-result';
      else if (i === activeU) classNames += ' u-node';
      else if (i === activeV) classNames += ' v-node';
      
      nodes.push(
        <div key={`tree-n-${i}`} className={classNames} style={{ left: pos.x, top: pos.y }}>
          <div className="lca-node-circle">{i}</div>
        </div>
      );
    }
    return nodes;
  };

  return (
    <div className="lca-container">
      <div className="lca-header">
        <button className="lca-back-btn" onClick={() => navigate('/topic/lca')}>
          <ArrowLeft size={20} />
        </button>
        <h1>LCA (Binary Lifting) Visualizer</h1>
      </div>
      
      <div className="lca-main">
        <div className="lca-sidebar">
          <div className="lca-sidebar-block">
            <label className="lca-label">Custom Tree (Edges)</label>
            <textarea 
                className="lca-input lca-textarea" 
                value={edgesInput} 
                onChange={(e) => setEdgesInput(e.target.value)}
                disabled={isAnimating}
            />
            <button className="lca-btn" style={{marginTop: '5px', background: '#475569'}} onClick={buildTree} disabled={isAnimating}>Build Tree</button>
          </div>
          
          <div className="lca-sidebar-block" style={{marginTop: '15px'}}>
            <label className="lca-label">LCA Query</label>
            <div style={{display: 'flex', gap: '10px'}}>
              <div>
                <span style={{fontSize: '11px', color: '#94a3b8'}}>Node U</span>
                <input type="number" className="lca-input" value={uNode} onChange={e=>setUNode(parseInt(e.target.value))} disabled={isAnimating} />
              </div>
              <div>
                <span style={{fontSize: '11px', color: '#94a3b8'}}>Node V</span>
                <input type="number" className="lca-input" value={vNode} onChange={e=>setVNode(parseInt(e.target.value))} disabled={isAnimating} />
              </div>
            </div>
            <button className="lca-btn" style={{marginTop: '5px', background: '#ea580c'}} onClick={findLCA} disabled={isAnimating}>Find LCA</button>
          </div>

          <div className="lca-sidebar-block" style={{marginTop: '10px'}}>
             <label className="lca-label">Animation Speed: {speedMultiplier}x</label>
             <input type="range" min="0.5" max="3" step="0.5" value={speedMultiplier} onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))} disabled={isAnimating}/>
          </div>
          
          <div className="lca-log-container" style={{marginTop: 'auto'}}>
            {logs.length === 0 ? (
              <div style={{color: '#64748b'}}>Run an LCA query to see step-by-step binary lifting...</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className={`lca-log-entry ${log.type}`} dangerouslySetInnerHTML={{ __html: log.msg }} />
              ))
            )}
          </div>
        </div>

        <div className="lca-content-wrapper">
            <div className="lca-visualization-area">
                {/* Tree Canvas */}
                <div className="lca-canvas" ref={treeContainerRef}>
                    <svg className="lca-svg">
                        {renderTreeEdges()}
                    </svg>
                    <div>
                        {renderTreeNodes()}
                    </div>
                </div>
                
                {/* DP Table */}
                <div className="lca-table-container">
                    <h3>up[node][i] Table</h3>
                    <table className="lca-table">
                        <thead>
                            <tr>
                                <th>Node</th>
                                <th>Depth</th>
                                {Array.from({length: LOG}).map((_, i) => (
                                    <th key={`th-${i}`}>i={i} (2^{i})</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {up.map((row, node) => (
                                <tr key={`tr-${node}`}>
                                    <td style={{fontWeight: 'bold', color: '#818cf8'}}>{node}</td>
                                    <td>{depth[node]}</td>
                                    {row.map((val, i) => {
                                        let className = '';
                                        if (activeCell.type === 'u' && activeCell.u === node && activeCell.i === i) className = 'highlight-u';
                                        if (activeCell.type === 'both' && activeCell.i === i) {
                                            if (node === activeCell.u) className = 'highlight-u';
                                            if (node === activeCell.v) className = 'highlight-v';
                                        }
                                        return <td key={`td-${node}-${i}`} className={className}>{val === -1 ? '-' : val}</td>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
