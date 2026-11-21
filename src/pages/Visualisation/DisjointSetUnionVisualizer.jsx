import { useState, useEffect, useRef } from 'react';
import './SegmentTreeVisualizer.css'; // Reusing existing visualizer styles
import { ArrowLeft, RotateCcw, ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function DisjointSetUnionVisualizer() {
  const navigate = useNavigate();
  const [N, setN] = useState(8);
  const [parent, setParent] = useState([]);
  const [rank, setRank] = useState([]);
  const [highlights, setHighlights] = useState({ nodes: {}, edges: {} });
  const [logs, setLogs] = useState([]);
  const [opCount, setOpCount] = useState(0);
  const [currentOp, setCurrentOp] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  
  const [findNode, setFindNode] = useState(0);
  const [unionU, setUnionU] = useState(0);
  const [unionV, setUnionV] = useState(1);
  
  const [activeAccordion, setActiveAccordion] = useState('edges');
  
  const [edgesInput, setEdgesInput] = useState('');
  
  const treeContainerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    initDSU(N);
  }, [N]);
  
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
  }, [parent]);

  const initDSU = (size) => {
    setParent(Array.from({ length: size }, (_, i) => i));
    setRank(Array.from({ length: size }, () => 0));
    setHighlights({ nodes: {}, edges: {} });
    clearLog();
  };

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, id: Date.now() + Math.random() }]);
  };
  const clearLog = () => setLogs([]);
  
  const getAnimationSpeed = () => 500 / speedMultiplier;

  const setNodeHighlight = (node, type) => {
    setHighlights(prev => ({ ...prev, nodes: { ...prev.nodes, [node]: type } }));
  };
  
  const setEdgeHighlight = (u, v, type) => {
    setHighlights(prev => ({ ...prev, edges: { ...prev.edges, [`${u}-${v}`]: type } }));
  };
  
  const resetHighlights = () => setHighlights({ nodes: {}, edges: {} });

  const innerFind = async (u, currentParent) => {
    setNodeHighlight(u, 'visited');
    addLog(`Finding root of node ${u}`);
    await sleep(getAnimationSpeed());
    
    if (currentParent[u] === u) {
      addLog(`Node ${u} is its own parent (Root found)`, 'success');
      setNodeHighlight(u, 'result');
      await sleep(getAnimationSpeed());
      return u;
    }
    
    setEdgeHighlight(u, currentParent[u], 'visited');
    await sleep(getAnimationSpeed());
    
    const root = await innerFind(currentParent[u], currentParent);
    
    if (currentParent[u] !== root) {
      addLog(`Path Compression: Setting parent of node ${u} directly to root ${root}`);
      currentParent[u] = root;
      setParent([...currentParent]);
      await sleep(getAnimationSpeed());
    }
    
    setNodeHighlight(u, 'result');
    return root;
  };

  const handleFind = async () => {
    if (isAnimating) return;
    if (findNode < 0 || findNode >= N) return alert('Invalid node index');
    
    setIsAnimating(true);
    resetHighlights();
    const opNumber = opCount + 1;
    setOpCount(opNumber);
    setCurrentOp(`Operation ${opNumber}: Find root of node ${findNode}`);
    clearLog();
    addLog(`<b>Starting Find Operation</b> for node ${findNode}`, 'info');
    
    let currentParent = [...parent];
    const root = await innerFind(findNode, currentParent);
    
    addLog(`<b>Find Complete</b>: Root of node ${findNode} is ${root}`, 'success');
    await sleep(getAnimationSpeed());
    resetHighlights();
    setIsAnimating(false);
  };

  const handleUnion = async () => {
    if (isAnimating) return;
    if (unionU < 0 || unionU >= N || unionV < 0 || unionV >= N) return alert('Invalid node indices');
    
    setIsAnimating(true);
    resetHighlights();
    const opNumber = opCount + 1;
    setOpCount(opNumber);
    setCurrentOp(`Operation ${opNumber}: Union(${unionU}, ${unionV})`);
    clearLog();
    addLog(`<b>Starting Union Operation</b> for ${unionU} and ${unionV}`, 'info');
    
    let currentParent = [...parent];
    let currentRank = [...rank];
    
    addLog(`Finding root of ${unionU}...`);
    const rootU = await innerFind(unionU, currentParent);
    resetHighlights();
    
    addLog(`Finding root of ${unionV}...`);
    const rootV = await innerFind(unionV, currentParent);
    resetHighlights();
    
    if (rootU === rootV) {
      addLog(`Nodes ${unionU} and ${unionV} are already in the same set (root ${rootU})`, 'warning');
    } else {
      setNodeHighlight(rootU, 'highlight');
      setNodeHighlight(rootV, 'highlight');
      await sleep(getAnimationSpeed());
      
      if (currentRank[rootU] < currentRank[rootV]) {
        addLog(`Rank of root ${rootU} (${currentRank[rootU]}) < Rank of root ${rootV} (${currentRank[rootV]})`);
        addLog(`Attaching root ${rootU} under root ${rootV}`);
        currentParent[rootU] = rootV;
      } else if (currentRank[rootU] > currentRank[rootV]) {
        addLog(`Rank of root ${rootU} (${currentRank[rootU]}) > Rank of root ${rootV} (${currentRank[rootV]})`);
        addLog(`Attaching root ${rootV} under root ${rootU}`);
        currentParent[rootV] = rootU;
      } else {
        addLog(`Ranks are equal (${currentRank[rootU]}). Attaching ${rootV} under ${rootU} and increasing rank of ${rootU}.`);
        currentParent[rootV] = rootU;
        currentRank[rootU]++;
      }
      
      setParent([...currentParent]);
      setRank([...currentRank]);
      addLog(`<b>Union Complete</b>`, 'success');
      await sleep(getAnimationSpeed());
    }
    
    resetHighlights();
    setIsAnimating(false);
  };

  const handleProcessEdges = async () => {
    if (isAnimating) return;
    
    // Parse edges: e.g. "1,2; 2,3" or "1 2, 2 3" or "(1,2) (2,3)"
    const rawPairs = edgesInput.match(/\d+[\s,]+\d+/g);
    if (!rawPairs) {
      alert("Invalid edge format. Try: '0,1; 1,2'");
      return;
    }
    
    const edges = rawPairs.map(str => {
      const nums = str.match(/\d+/g);
      return [parseInt(nums[0]), parseInt(nums[1])];
    });
    
    // check bounds
    for (let [u, v] of edges) {
      if (u >= N || v >= N || u < 0 || v < 0) {
        alert(`Node out of bounds in edge (${u}, ${v})`);
        return;
      }
    }
    
    setIsAnimating(true);
    resetHighlights();
    clearLog();
    addLog(`<b>Processing ${edges.length} edges...</b>`, 'info');
    
    let currentParent = [...parent];
    let currentRank = [...rank];
    
    for (let i = 0; i < edges.length; i++) {
      const [u, v] = edges[i];
      const opNumber = opCount + i + 1;
      setCurrentOp(`Operation ${opNumber}: Union(${u}, ${v})`);
      addLog(`<b>--- Processing Edge (${u}, ${v}) ---</b>`, 'info');
      
      addLog(`Finding root of ${u}...`);
      const rootU = await innerFind(u, currentParent);
      resetHighlights();
      
      addLog(`Finding root of ${v}...`);
      const rootV = await innerFind(v, currentParent);
      resetHighlights();
      
      if (rootU === rootV) {
        addLog(`Nodes ${u} and ${v} are already in the same set (root ${rootU})`, 'warning');
      } else {
        setNodeHighlight(rootU, 'highlight');
        setNodeHighlight(rootV, 'highlight');
        await sleep(getAnimationSpeed());
        
        if (currentRank[rootU] < currentRank[rootV]) {
          addLog(`Rank of root ${rootU} (${currentRank[rootU]}) < Rank of root ${rootV} (${currentRank[rootV]})`);
          addLog(`Attaching root ${rootU} under root ${rootV}`);
          currentParent[rootU] = rootV;
        } else if (currentRank[rootU] > currentRank[rootV]) {
          addLog(`Rank of root ${rootU} (${currentRank[rootU]}) > Rank of root ${rootV} (${currentRank[rootV]})`);
          addLog(`Attaching root ${rootV} under root ${rootU}`);
          currentParent[rootV] = rootU;
        } else {
          addLog(`Ranks are equal (${currentRank[rootU]}). Attaching ${rootV} under ${rootU} and increasing rank of ${rootU}.`);
          currentParent[rootV] = rootU;
          currentRank[rootU]++;
        }
        
        setParent([...currentParent]);
        setRank([...currentRank]);
        await sleep(getAnimationSpeed());
      }
      resetHighlights();
      await sleep(getAnimationSpeed());
    }
    
    setOpCount(opCount + edges.length);
    addLog(`<b>Edge Processing Complete</b>`, 'success');
    setCurrentOp('');
    setIsAnimating(false);
  };

  // Rendering Math for Tree using a circle layout to arrange disconnected DSU sets gracefully
  const coords = {};
  if (dimensions.width > 0 && parent.length > 0) {
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    
    const r = Math.min(cx, cy) - 60;
    
    for (let i = 0; i < N; i++) {
        const theta = (i * 2 * Math.PI) / N;
        coords[i] = {
            x: cx + r * Math.sin(theta),
            y: cy - r * Math.cos(theta)
        };
    }
  }

  const renderEdges = () => {
    const edges = [];
    for (let i = 0; i < N; i++) {
      if (parent[i] !== i) {
        const p = parent[i];
        if (coords[i] && coords[p]) {
          const edgeId = `${i}-${p}`;
          // Add arrows or some visual difference
          edges.push(
            <line 
                key={'e'+i} 
                x1={coords[i].x} 
                y1={coords[i].y} 
                x2={coords[p].x} 
                y2={coords[p].y} 
                className={`viz-edge ${highlights.edges[edgeId] || ''}`} 
                markerEnd="url(#arrowhead)" // Using a marker for directed edges
            />
          );
        }
      }
    }
    return edges;
  };

  const renderNodes = () => {
    const nodes = [];
    for (let i = 0; i < N; i++) {
      const pos = coords[i];
      if (!pos) break;
      const hClass = highlights.nodes[i] || '';
      const isRoot = parent[i] === i;
      
      nodes.push(
        <div key={'n'+i} className={`viz-node ${hClass} ${isRoot ? 'viz-root-node' : ''}`} style={{ left: pos.x, top: pos.y }}>
          <div className="viz-node-circle">
            {i}
          </div>
          <div className="viz-node-range">Rank: {rank[i]}</div>
        </div>
      );
    }
    return nodes;
  };

  const toggleAccordion = (name) => {
    setActiveAccordion(activeAccordion === name ? '' : name);
  };

  return (
    <div className="viz-container">
      <div className="viz-header">
        <button className="viz-back-btn" onClick={() => navigate('/topic/disjoint-set-union')}>
          <ArrowLeft size={20} />
        </button>
        <h1>DSU Visualizer</h1>
      </div>
      
      <div className="viz-main">
        <div className="viz-sidebar">
          <div className="viz-sidebar-block">
             <label className="viz-label">Number of Elements:</label>
             <input type="number" min="2" max="24" className="viz-input full" value={N} onChange={(e) => !isAnimating && setN(parseInt(e.target.value) || 8)} />
             <button className="viz-green-btn full mt-10" onClick={() => !isAnimating && initDSU(N)}>Re-initialize</button>
          </div>

          <div className="viz-sidebar-block viz-speed-block">
            <label className="viz-label inline">Speed:</label>
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.5" 
              value={speedMultiplier} 
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              className="viz-slider"
            />
            <span className="viz-speed-val">{speedMultiplier}x</span>
          </div>

          <div className="viz-accordion">
            <button className="viz-acc-header" onClick={() => toggleAccordion('edges')}>
              {activeAccordion === 'edges' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              Process Graph Edges
            </button>
            {activeAccordion === 'edges' && (
              <div className="viz-acc-body">
                <div className="viz-input-row mt-10">
                  <div style={{width: '100%'}}>
                    <label>Edges (e.g. 0,1; 1,2):</label>
                    <input type="text" className="viz-input full" placeholder="0,1; 1,2; 2,3" value={edgesInput} onChange={e=>setEdgesInput(e.target.value)} disabled={isAnimating} />
                  </div>
                </div>
                <button className="viz-green-btn full mt-10" onClick={handleProcessEdges} disabled={isAnimating}>Process Edges</button>
              </div>
            )}
          </div>

          <div className="viz-accordion">
            <button className="viz-acc-header" onClick={() => toggleAccordion('find')}>
              {activeAccordion === 'find' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              Find
            </button>
            {activeAccordion === 'find' && (
              <div className="viz-acc-body">
                <div className="viz-input-row mt-10">
                  <div style={{width: '100%'}}>
                    <label>Node Index:</label>
                    <input type="number" className="viz-input full" value={findNode} onChange={e=>setFindNode(parseInt(e.target.value))} />
                  </div>
                </div>
                <button className="viz-green-btn full mt-10" onClick={handleFind}>Run Find</button>
              </div>
            )}
          </div>

          <div className="viz-accordion">
            <button className="viz-acc-header" onClick={() => toggleAccordion('union')}>
              {activeAccordion === 'union' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              Union
            </button>
            {activeAccordion === 'union' && (
              <div className="viz-acc-body">
                <div className="viz-input-row">
                  <div>
                    <label>Node U:</label>
                    <input type="number" className="viz-input full" value={unionU} onChange={e=>setUnionU(parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label>Node V:</label>
                    <input type="number" className="viz-input full" value={unionV} onChange={e=>setUnionV(parseInt(e.target.value))} />
                  </div>
                </div>
                <button className="viz-green-btn full mt-10" onClick={handleUnion}>Run Union</button>
              </div>
            )}
          </div>
        </div>

        <div className="viz-canvas-wrapper">
          <div className="viz-canvas" ref={treeContainerRef}>
            <div className="viz-canvas-tools">
              <button onClick={() => !isAnimating && initDSU(N)}><RotateCcw size={16} /></button>
            </div>
            
            <svg className="viz-tree-svg">
               <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#8892b0" />
                </marker>
              </defs>
              {renderEdges()}
            </svg>
            <div className="viz-tree-nodes">
              {renderNodes()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="viz-log-container">
        {currentOp && (
          <div className="viz-current-op">
            {currentOp}
          </div>
        )}
        {logs.length === 0 ? (
          <div className="viz-log-placeholder">Run an operation to see step-by-step execution details here.</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className={`viz-log-entry ${log.type}`} dangerouslySetInnerHTML={{ __html: log.msg }} />
          ))
        )}
      </div>
    </div>
  );
}

export default DisjointSetUnionVisualizer;
