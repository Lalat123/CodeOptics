import { useState, useEffect, useRef } from 'react';
import './HLDVisualizer.css';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_EDGES = "0 1\n0 2\n1 3\n1 4\n2 5\n2 6\n4 7\n4 8\n7 9\n2 10\n10 11";

export default function HLDVisualizer() {
  const navigate = useNavigate();
  const [edgesInput, setEdgesInput] = useState(DEFAULT_EDGES);
  
  const [N, setN] = useState(0);
  const [adj, setAdj] = useState([]);
  
  // HLD Arrays
  const [sz, setSz] = useState([]);
  const [depth, setDepth] = useState([]);
  const [parent, setParent] = useState([]);
  const [heavy, setHeavy] = useState([]);
  const [head, setHead] = useState([]);
  const [pos, setPos] = useState([]);
  const [nodeAtPos, setNodeAtPos] = useState([]); // reverse of pos
  
  const [uNode, setUNode] = useState(9);
  const [vNode, setVNode] = useState(11);
  
  const [activeU, setActiveU] = useState(-1);
  const [activeV, setActiveV] = useState(-1);
  const [activeNode, setActiveNode] = useState(-1); // For single node jumps
  
  const [queriedRanges, setQueriedRanges] = useState([]); // {start, end}
  const [activeEdge, setActiveEdge] = useState(null); // {u, v}
  
  const [logs, setLogs] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  
  const treeContainerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [coords, setCoords] = useState({});

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
  }, [dimensions, depth, head]);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, id: Date.now() + Math.random() }]);
  };
  const clearLog = () => setLogs([]);
  const getSpeed = () => 1000 / speedMultiplier;

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
    if (n === 0 || n > 25) {
      alert("Please provide a valid tree (Max 25 nodes 0-24).");
      return;
    }
    
    const adjacency = Array.from({length: n}, () => []);
    for (let [u, v] of edges) {
      adjacency[u].push(v);
      adjacency[v].push(u);
    }
    
    // Check if it's a valid tree from root 0
    const d = new Array(n).fill(0);
    const p = new Array(n).fill(-1);
    const s = new Array(n).fill(1);
    const h = new Array(n).fill(-1);
    const hd = new Array(n).fill(-1);
    const posArr = new Array(n).fill(-1);
    const nodeAt = new Array(n).fill(-1);
    
    const visited = new Array(n).fill(false);
    
    // DFS 1
    const dfs1 = (curr, par, dep) => {
      visited[curr] = true;
      d[curr] = dep;
      p[curr] = par;
      s[curr] = 1;
      
      let maxSub = 0;
      for (let nxt of adjacency[curr]) {
        if (nxt !== par) {
          if (visited[nxt]) return false; // Cycle
          const sub = dfs1(nxt, curr, dep + 1);
          if (sub === false) return false;
          s[curr] += sub;
          if (sub > maxSub) {
            maxSub = sub;
            h[curr] = nxt;
          }
        }
      }
      return s[curr];
    };
    
    if (dfs1(0, -1, 0) === false || visited.some(v => !v)) {
       alert("Graph is not a valid single tree rooted at 0.");
       return;
    }
    
    // DFS 2
    let timer = 0;
    const dfs2 = (curr, par, headNode) => {
      hd[curr] = headNode;
      posArr[curr] = timer;
      nodeAt[timer] = curr;
      timer++;
      
      if (h[curr] !== -1) {
        dfs2(h[curr], curr, headNode);
      }
      
      for (let nxt of adjacency[curr]) {
        if (nxt !== par && nxt !== h[curr]) {
          dfs2(nxt, curr, nxt);
        }
      }
    };
    
    dfs2(0, -1, 0);
    
    setN(n);
    setAdj(adjacency);
    setDepth(d);
    setParent(p);
    setSz(s);
    setHeavy(h);
    setHead(hd);
    setPos(posArr);
    setNodeAtPos(nodeAt);
    
    setActiveU(-1);
    setActiveV(-1);
    setActiveNode(-1);
    setQueriedRanges([]);
    setActiveEdge(null);
    clearLog();
    addLog(`<b>HLD Built!</b> Heavy edges connect to the child with the largest subtree.`, 'success');
  };

  const calculateLayout = () => {
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
      
      // Sort nodes to group chains slightly
      nodesAtDepth.sort((a, b) => head[a] - head[b]);
      
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

  const queryPath = async () => {
    if (isAnimating) return;
    if (uNode < 0 || uNode >= N || vNode < 0 || vNode >= N) {
      alert("Invalid nodes.");
      return;
    }
    
    setIsAnimating(true);
    setQueriedRanges([]);
    setActiveEdge(null);
    clearLog();
    
    let u = uNode;
    let v = vNode;
    setActiveU(u);
    setActiveV(v);
    setActiveNode(-1);
    
    addLog(`<b>Starting Path Query(${u}, ${v})</b>`, 'info');
    await sleep(getSpeed());
    
    while (head[u] !== head[v]) {
      addLog(`Nodes are on different chains: Head(U)=${head[u]}, Head(V)=${head[v]}`);
      await sleep(getSpeed());
      
      if (depth[head[u]] < depth[head[v]]) {
        addLog(`Head(${v}) is deeper than Head(${u}). Swapping U and V.`);
        const temp = u; u = v; v = temp;
        setActiveU(u);
        setActiveV(v);
        await sleep(getSpeed());
      }
      
      const currHead = head[u];
      addLog(`Querying Segment Tree for chain from ${currHead} to ${u} (Array pos: ${pos[currHead]} to ${pos[u]})`, 'warning');
      
      // Highlight range in array
      setQueriedRanges(prev => [...prev, {start: pos[currHead], end: pos[u]}]);
      setActiveNode(u);
      
      // Jump Edge Highlight
      setActiveEdge({u: u, v: parent[currHead]});
      await sleep(getSpeed() * 1.5);
      
      u = parent[currHead];
      setActiveU(u);
      setActiveEdge(null);
      addLog(`U jumped across light edge to parent of chain head: Node ${u}`);
      await sleep(getSpeed());
    }
    
    // Same chain
    addLog(`<b>Nodes are now on the SAME chain (Head=${head[u]}).</b>`, 'success');
    await sleep(getSpeed());
    
    if (depth[u] > depth[v]) {
      const temp = u; u = v; v = temp;
      setActiveU(u);
      setActiveV(v);
    }
    
    addLog(`Querying final segment from ${u} to ${v} (Array pos: ${pos[u]} to ${pos[v]})`, 'warning');
    setQueriedRanges(prev => [...prev, {start: pos[u], end: pos[v]}]);
    setActiveNode(-1);
    
    addLog(`<b>Path Query Complete!</b>`, 'success');
    setIsAnimating(false);
  };

  const renderTreeEdges = () => {
    const elements = [];
    for (let i = 1; i < N; i++) {
      const p = parent[i];
      if (p !== -1 && coords[i] && coords[p]) {
        const isHeavy = heavy[p] === i;
        const isActive = activeEdge && ((activeEdge.u === i && activeEdge.v === p) || (activeEdge.u === p && activeEdge.v === i));
        
        let className = isHeavy ? 'hld-edge-heavy' : 'hld-edge-light';
        if (isActive) className += ' hld-edge-active';
        
        elements.push(
          <line key={`e-${i}`} x1={coords[i].x} y1={coords[i].y} x2={coords[p].x} y2={coords[p].y} className={className} />
        );
      }
    }
    return elements;
  };

  const renderTreeNodes = () => {
    const nodes = [];
    for (let i = 0; i < N; i++) {
      const posC = coords[i];
      if (!posC) continue;
      
      let classNames = 'hld-node';
      if (head[i] === i) classNames += ' hld-node-head'; // Star for chain head
      if (i === activeU) classNames += ' u-node';
      else if (i === activeV) classNames += ' v-node';
      else if (i === activeNode) classNames += ' active-node';
      
      nodes.push(
        <div key={`n-${i}`} className={classNames} style={{ left: posC.x, top: posC.y }}>
          <div className="hld-node-circle">{i}</div>
          <div className="hld-node-label">sz:{sz[i]} | h:{head[i]}</div>
        </div>
      );
    }
    return nodes;
  };

  const isQueried = (index) => {
    return queriedRanges.some(r => index >= r.start && index <= r.end);
  };

  return (
    <div className="hld-container">
      <div className="hld-header">
        <button className="hld-back-btn" onClick={() => navigate('/topic/hld')}>
          <ArrowLeft size={20} />
        </button>
        <h1>Heavy-Light Decomposition Visualizer</h1>
      </div>
      
      <div className="hld-main">
        <div className="hld-sidebar">
          <div className="hld-sidebar-block">
            <label className="hld-label">Custom Tree (Edges)</label>
            <textarea 
                className="hld-input hld-textarea" 
                value={edgesInput} 
                onChange={(e) => setEdgesInput(e.target.value)}
                disabled={isAnimating}
            />
            <button className="hld-btn" style={{marginTop: '5px', background: '#475569'}} onClick={buildTree} disabled={isAnimating}>Build Tree</button>
          </div>
          
          <div className="hld-sidebar-block" style={{marginTop: '15px'}}>
            <label className="hld-label">Path Query</label>
            <div style={{display: 'flex', gap: '10px'}}>
              <div>
                <span style={{fontSize: '11px', color: '#94a3b8'}}>Node U</span>
                <input type="number" className="hld-input" value={uNode} onChange={e=>setUNode(parseInt(e.target.value))} disabled={isAnimating} />
              </div>
              <div>
                <span style={{fontSize: '11px', color: '#94a3b8'}}>Node V</span>
                <input type="number" className="hld-input" value={vNode} onChange={e=>setVNode(parseInt(e.target.value))} disabled={isAnimating} />
              </div>
            </div>
            <button className="hld-btn" style={{marginTop: '5px'}} onClick={queryPath} disabled={isAnimating}>Query Path</button>
          </div>

          <div className="hld-sidebar-block" style={{marginTop: '10px'}}>
             <label className="hld-label">Animation Speed: {speedMultiplier}x</label>
             <input type="range" min="0.5" max="3" step="0.5" value={speedMultiplier} onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))} disabled={isAnimating}/>
          </div>
          
          <div className="hld-log-container" style={{marginTop: 'auto'}}>
            {logs.length === 0 ? (
              <div style={{color: '#64748b'}}>Run a path query to see HLD jumps...</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className={`hld-log-entry ${log.type}`} dangerouslySetInnerHTML={{ __html: log.msg }} />
              ))
            )}
          </div>
        </div>

        <div className="hld-content-wrapper">
            <div className="hld-visualization-area">
                {/* Tree Canvas */}
                <div className="hld-tree-area" ref={treeContainerRef}>
                    <svg className="hld-svg">
                        {renderTreeEdges()}
                    </svg>
                    <div>
                        {renderTreeNodes()}
                    </div>
                </div>
                
                {/* Flattened Array */}
                <div className="hld-array-area">
                    <h3>Flattened 1D Array (Segment Tree Base)</h3>
                    <div className="hld-array-container">
                        {Array.from({length: N}).map((_, i) => {
                            const node = nodeAtPos[i];
                            const isHead = node !== -1 && head[node] === node;
                            const isQ = isQueried(i);
                            return (
                                <div key={`arr-${i}`} className="hld-array-cell">
                                    <div className={`hld-array-box ${isHead ? 'head' : ''} ${isQ ? 'queried' : ''}`}>
                                        {node === -1 ? '-' : node}
                                    </div>
                                    <div className="hld-array-index">{i}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
