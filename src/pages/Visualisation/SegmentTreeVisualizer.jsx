import { useState, useEffect, useRef } from 'react';
import './SegmentTreeVisualizer.css';
import { ArrowLeft, Maximize, RotateCcw, Download, Bug, ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function SegmentTreeVisualizer() {
  const navigate = useNavigate();
  const [N, setN] = useState(8);
  const [treeType, setTreeType] = useState('sum');
  const [arr, setArr] = useState([]);
  const [tree, setTree] = useState([]);
  const [nodeRanges, setNodeRanges] = useState({});
  const [highlights, setHighlights] = useState({ nodes: {}, edges: {}, array: {} });
  const [logs, setLogs] = useState([]);
  const [lazy, setLazy] = useState([]);
  const [opCount, setOpCount] = useState(0);
  const [currentOp, setCurrentOp] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  
  const [queryL, setQueryL] = useState(0);
  const [queryR, setQueryR] = useState(7);
  const [updateIdx, setUpdateIdx] = useState(0);
  const [updateVal, setUpdateVal] = useState(10);
  const [rangeUpdateL, setRangeUpdateL] = useState(0);
  const [rangeUpdateR, setRangeUpdateR] = useState(3);
  const [rangeUpdateVal, setRangeUpdateVal] = useState(5);
  
  const [customArrayInput, setCustomArrayInput] = useState('');
  const [activeAccordion, setActiveAccordion] = useState('rangeUpdate');
  
  const treeContainerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize
  useEffect(() => {
    generateRandomArray(N);
  }, [N]);

  useEffect(() => {
    if (arr.length > 0) {
      buildTree(1, 0, arr.length - 1, arr, treeType);
    }
  }, [arr, treeType]);
  
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
  }, [arr]);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, id: Date.now() + Math.random() }]);
  };
  const clearLog = () => setLogs([]);

  const generateRandomArray = (size) => {
    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 20) + 1);
    setArr(newArr);
    clearLog();
    setHighlights({ nodes: {}, edges: {}, array: {} });
  };

  const handleBuildCustomTree = () => {
    if(isAnimating) return;
    const parsed = customArrayInput.split(/[\s,]+/).filter(Boolean).map(Number);
    if (parsed.length > 0 && !parsed.some(isNaN)) {
      setN(parsed.length);
      setArr(parsed);
      setHighlights({ nodes: {}, edges: {}, array: {} });
    } else {
      alert("Invalid array input. Please use numbers separated by commas or spaces.");
    }
  };

  const combine = (a, b, type = treeType) => {
    if (type === 'sum') return a + b;
    if (type === 'min') return Math.min(a, b);
    if (type === 'max') return Math.max(a, b);
    return 0;
  };

  const buildTree = (node, start, end, currentArr, type) => {
    let newTree = [...tree];
    let newLazy = [...lazy];
    if (newTree.length !== 4 * currentArr.length) {
      newTree = new Array(4 * currentArr.length).fill(0);
      newLazy = new Array(4 * currentArr.length).fill(0);
    }
    let newRanges = { ...nodeRanges };
    
    const build = (n, s, e) => {
      newRanges[n] = [s, e];
      newLazy[n] = 0;
      if (s === e) {
        newTree[n] = currentArr[s];
        return;
      }
      const mid = Math.floor((s + e) / 2);
      build(2 * n, s, mid);
      build(2 * n + 1, mid + 1, e);
      newTree[n] = combine(newTree[2 * n], newTree[2 * n + 1], type);
    };
    
    build(1, 0, currentArr.length - 1);
    setTree(newTree);
    setLazy(newLazy);
    setNodeRanges(newRanges);
  };

  const applyLazy = (node, start, end, val, currentTree, currentLazy) => {
    currentLazy[node] += val;
    if (treeType === 'sum') {
      currentTree[node] += val * (end - start + 1);
    } else {
      currentTree[node] += val;
    }
  };

  const push = async (node, start, end, currentTree, currentLazy) => {
    if (currentLazy[node] !== 0 && start !== end) {
      addLog(`Pushing lazy value ${currentLazy[node]} from node ${node} to children.`);
      setNodeHighlight(node, 'highlight');
      await sleep(getAnimationSpeed());
      
      const mid = Math.floor((start + end) / 2);
      applyLazy(2 * node, start, mid, currentLazy[node], currentTree, currentLazy);
      applyLazy(2 * node + 1, mid + 1, end, currentLazy[node], currentTree, currentLazy);
      currentLazy[node] = 0;
      
      setTree([...currentTree]);
      setLazy([...currentLazy]);
      await sleep(getAnimationSpeed());
      setNodeHighlight(node, '');
    }
  };

  const getAnimationSpeed = () => 500 / speedMultiplier;

  const setNodeHighlight = (node, type) => {
    setHighlights(prev => ({ ...prev, nodes: { ...prev.nodes, [node]: type } }));
  };
  const setEdgeHighlight = (u, v, type) => {
    setHighlights(prev => ({ ...prev, edges: { ...prev.edges, [`${u}-${v}`]: type } }));
  };
  const resetHighlights = () => setHighlights({ nodes: {}, edges: {}, array: {} });

  const handleUpdate = async () => {
    if (isAnimating) return;
    if (updateIdx < 0 || updateIdx >= arr.length) return alert('Invalid update index');
    
    setIsAnimating(true);
    resetHighlights();
    const opNumber = opCount + 1;
    setOpCount(opNumber);
    setCurrentOp(`Operation ${opNumber}: Point Update (arr[${updateIdx}] = ${updateVal})`);
    clearLog();
    addLog(`<b>Starting Point Update</b>: arr[${updateIdx}] = ${updateVal}`, 'info');
    
    let currentArr = [...arr];
    currentArr[updateIdx] = updateVal;
    setArr(currentArr);
    
    let currentTree = [...tree];
    let currentLazy = [...lazy];
    
    const updateNode = async (node, start, end, idx, val) => {
      setNodeHighlight(node, 'visited');
      await push(node, start, end, currentTree, currentLazy);
      addLog(`Visiting node ${node} covering range [${start}, ${end}]`);
      await sleep(getAnimationSpeed());
      
      if (start === end) {
        addLog(`Leaf node reached! Updating node ${node} to ${val}`, 'success');
        currentTree[node] = val;
        setTree([...currentTree]);
        setNodeHighlight(node, 'result');
        await sleep(getAnimationSpeed());
        return;
      }
      
      const mid = Math.floor((start + end) / 2);
      if (start <= idx && idx <= mid) {
        addLog(`Index ${idx} is in left child [${start}, ${mid}]`);
        setEdgeHighlight(node, 2 * node, 'visited');
        await sleep(getAnimationSpeed());
        await updateNode(2 * node, start, mid, idx, val);
        setEdgeHighlight(node, 2 * node, '');
      } else {
        addLog(`Index ${idx} is in right child [${mid + 1}, ${end}]`);
        setEdgeHighlight(node, 2 * node + 1, 'visited');
        await sleep(getAnimationSpeed());
        await updateNode(2 * node + 1, mid + 1, end, idx, val);
        setEdgeHighlight(node, 2 * node + 1, '');
      }
      
      currentTree[node] = combine(currentTree[2 * node], currentTree[2 * node + 1]);
      setTree([...currentTree]);
      addLog(`Updating internal node ${node} to ${currentTree[node]}`);
      setNodeHighlight(node, 'highlight');
      await sleep(getAnimationSpeed());
    };

    await updateNode(1, 0, arr.length - 1, updateIdx, updateVal);
    
    addLog(`<b>Update Complete</b>`, 'success');
    await sleep(getAnimationSpeed());
    resetHighlights();
    setIsAnimating(false);
  };

  const handleQuery = async () => {
    if (isAnimating) return;
    if (queryL > queryR || queryL < 0 || queryR >= arr.length) return alert('Invalid query range');
    
    setIsAnimating(true);
    resetHighlights();
    const opNumber = opCount + 1;
    setOpCount(opNumber);
    setCurrentOp(`Operation ${opNumber}: Range Query [${queryL}, ${queryR}]`);
    clearLog();
    addLog(`<b>Starting Range Query</b>: [${queryL}, ${queryR}]`, 'info');
    
    let currentTree = [...tree];
    let currentLazy = [...lazy];
    
    const queryNode = async (node, start, end, l, r) => {
      setNodeHighlight(node, 'visited');
      await push(node, start, end, currentTree, currentLazy);
      addLog(`Visiting node ${node} [${start}, ${end}]`);
      await sleep(getAnimationSpeed());
      
      if (l <= start && end <= r) {
        addLog(`Node [${start}, ${end}] is completely within query [${l}, ${r}]. Returning ${currentTree[node]}.`, 'success');
        setNodeHighlight(node, 'result');
        await sleep(getAnimationSpeed());
        return currentTree[node];
      }
      
      if (end < l || start > r) {
        addLog(`Node [${start}, ${end}] is outside query. Returning neutral.`, 'warning');
        setNodeHighlight(node, 'highlight');
        await sleep(getAnimationSpeed());
        if (treeType === 'sum') return 0;
        if (treeType === 'min') return Infinity;
        if (treeType === 'max') return -Infinity;
      }
      
      addLog(`Node [${start}, ${end}] partially overlaps. Splitting query.`);
      const mid = Math.floor((start + end) / 2);
      
      setEdgeHighlight(node, 2 * node, 'visited');
      const p1 = await queryNode(2 * node, start, mid, l, r);
      setEdgeHighlight(node, 2 * node, '');
      
      setEdgeHighlight(node, 2 * node + 1, 'visited');
      const p2 = await queryNode(2 * node + 1, mid + 1, end, l, r);
      setEdgeHighlight(node, 2 * node + 1, '');
      
      const result = combine(p1, p2);
      addLog(`Combining results at node ${node}: ${p1} and ${p2} -> ${result}`);
      setNodeHighlight(node, 'result');
      await sleep(getAnimationSpeed());
      return result;
    };

    const res = await queryNode(1, 0, arr.length - 1, queryL, queryR);
    addLog(`<b>Query Result: ${res}</b>`, 'success');
    await sleep(getAnimationSpeed() * 2);
    resetHighlights();
    setIsAnimating(false);
  };

  const handleRangeUpdate = async () => {
    if (isAnimating) return;
    if (rangeUpdateL > rangeUpdateR || rangeUpdateL < 0 || rangeUpdateR >= arr.length) return alert('Invalid range');
    
    setIsAnimating(true);
    resetHighlights();
    const opNumber = opCount + 1;
    setOpCount(opNumber);
    setCurrentOp(`Operation ${opNumber}: Range Add [${rangeUpdateL}, ${rangeUpdateR}] += ${rangeUpdateVal}`);
    clearLog();
    addLog(`<b>Starting Range Update</b>: Add ${rangeUpdateVal} to [${rangeUpdateL}, ${rangeUpdateR}]`, 'info');
    
    let currentArr = [...arr];
    for (let i = rangeUpdateL; i <= rangeUpdateR; i++) currentArr[i] += rangeUpdateVal;
    setArr(currentArr);
    
    let currentTree = [...tree];
    let currentLazy = [...lazy];
    
    const rangeUpdateNode = async (node, start, end, l, r, val) => {
      setNodeHighlight(node, 'visited');
      await push(node, start, end, currentTree, currentLazy);
      
      if (start > r || end < l) {
        setNodeHighlight(node, '');
        return;
      }
      
      if (start >= l && end <= r) {
        addLog(`Node ${node} [${start}, ${end}] is completely within update range [${l}, ${r}]. Applying lazy tag ${val}.`);
        applyLazy(node, start, end, val, currentTree, currentLazy);
        setTree([...currentTree]);
        setLazy([...currentLazy]);
        setNodeHighlight(node, 'result');
        await sleep(getAnimationSpeed());
        return;
      }
      
      addLog(`Node ${node} [${start}, ${end}] partially overlaps. Splitting update.`);
      await sleep(getAnimationSpeed());
      
      const mid = Math.floor((start + end) / 2);
      setEdgeHighlight(node, 2 * node, 'visited');
      await rangeUpdateNode(2 * node, start, mid, l, r, val);
      setEdgeHighlight(node, 2 * node, '');
      
      setEdgeHighlight(node, 2 * node + 1, 'visited');
      await rangeUpdateNode(2 * node + 1, mid + 1, end, l, r, val);
      setEdgeHighlight(node, 2 * node + 1, '');
      
      currentTree[node] = combine(currentTree[2 * node], currentTree[2 * node + 1]);
      setTree([...currentTree]);
      addLog(`Updating internal node ${node} to ${currentTree[node]}`);
      setNodeHighlight(node, 'highlight');
      await sleep(getAnimationSpeed());
    };

    await rangeUpdateNode(1, 0, arr.length - 1, rangeUpdateL, rangeUpdateR, rangeUpdateVal);
    
    addLog(`<b>Range Update Complete</b>`, 'success');
    await sleep(getAnimationSpeed());
    resetHighlights();
    setIsAnimating(false);
  };

  // Rendering Math for Tree
  const coords = {};
  if (dimensions.width > 0 && Object.keys(nodeRanges).length > 0 && arr.length > 0) {
    const levels = Math.ceil(Math.log2(arr.length)) + 1;
    const levelHeight = Math.min(100, (dimensions.height - 100) / (levels - 1));
    const startY = 60;
    
    const calcPos = (node, start, end, level) => {
      const y = startY + level * levelHeight;
      const leafWidth = dimensions.width / arr.length;
      const x = (start + (end - start) / 2) * leafWidth + (leafWidth / 2);
      coords[node] = { x, y };
      
      if (start !== end) {
        const mid = Math.floor((start + end) / 2);
        calcPos(2 * node, start, mid, level + 1);
        calcPos(2 * node + 1, mid + 1, end, level + 1);
      }
    };
    calcPos(1, 0, arr.length - 1, 0);
  }

  const renderEdges = () => {
    const edges = [];
    for (let nodeStr in coords) {
      const node = parseInt(nodeStr);
      const [start, end] = nodeRanges[node];
      if (start !== end) {
        const left = 2 * node;
        const right = 2 * node + 1;
        if (coords[left]) {
          edges.push(
            <line key={'e'+node+'-'+left} x1={coords[node].x} y1={coords[node].y} x2={coords[left].x} y2={coords[left].y} className={`viz-edge ${highlights.edges[`${node}-${left}`] || ''}`} />
          );
        }
        if (coords[right]) {
          edges.push(
            <line key={'e'+node+'-'+right} x1={coords[node].x} y1={coords[node].y} x2={coords[right].x} y2={coords[right].y} className={`viz-edge ${highlights.edges[`${node}-${right}`] || ''}`} />
          );
        }
      }
    }
    return edges;
  };

  const renderNodes = () => {
    const nodes = [];
    for (let nodeStr in coords) {
      const node = parseInt(nodeStr);
      const pos = coords[node];
      const [start, end] = nodeRanges[node];
      const hClass = highlights.nodes[node] || '';
      
      nodes.push(
        <div key={'n'+node} className={`viz-node ${hClass}`} style={{ left: pos.x, top: pos.y }}>
          <div className="viz-node-range">[{start}...{end}]</div>
          <div className="viz-node-circle">
            {tree[node]}
          </div>
          {lazy[node] ? (
            <div className="viz-lazy-badge">+{lazy[node]}</div>
          ) : null}
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
        <button className="viz-back-btn" onClick={() => navigate('/topic/segment-tree')}>
          <ArrowLeft size={20} />
        </button>
        <h1>Segment Tree Visualizer</h1>
      </div>
      
      <div className="viz-main">
        <div className="viz-sidebar">
          <div className="viz-sidebar-block">
            <label className="viz-red-label">Select Segment Tree Type:-</label>
            <div className="viz-segment-controls">
              <button className={treeType === 'sum' ? 'active' : ''} onClick={() => !isAnimating && setTreeType('sum')}>SUM</button>
              <button className={treeType === 'min' ? 'active' : ''} onClick={() => !isAnimating && setTreeType('min')}>MIN</button>
              <button className={treeType === 'max' ? 'active' : ''} onClick={() => !isAnimating && setTreeType('max')}>MAX</button>
            </div>
          </div>

          <div className="viz-sidebar-block">
            <label className="viz-label">Enter Array:</label>
            <input 
              type="text" 
              className="viz-input full" 
              placeholder="Enter array (comma or space separated)" 
              value={customArrayInput}
              onChange={(e) => setCustomArrayInput(e.target.value)}
              disabled={isAnimating}
            />
            <button className="viz-green-btn full" onClick={handleBuildCustomTree} disabled={isAnimating}>Build Tree</button>
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

          {/* Accordion 1: Update Index */}
          <div className="viz-accordion">
            <button className="viz-acc-header" onClick={() => toggleAccordion('updateIdx')}>
              {activeAccordion === 'updateIdx' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              Update Index
            </button>
            {activeAccordion === 'updateIdx' && (
              <div className="viz-acc-body">
                <div className="viz-input-row">
                  <div>
                    <label>Index:</label>
                    <input type="number" className="viz-input full" value={updateIdx} onChange={e=>setUpdateIdx(parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label>Value:</label>
                    <input type="number" className="viz-input full" value={updateVal} onChange={e=>setUpdateVal(parseInt(e.target.value))} />
                  </div>
                </div>
                <button className="viz-green-btn full mt-10" onClick={handleUpdate}>Update Index</button>
              </div>
            )}
          </div>

          {/* Accordion 2: Range Query */}
          <div className="viz-accordion">
            <button className="viz-acc-header" onClick={() => toggleAccordion('rangeQuery')}>
              {activeAccordion === 'rangeQuery' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              Range Query
            </button>
            {activeAccordion === 'rangeQuery' && (
              <div className="viz-acc-body">
                <div className="viz-input-row">
                  <div>
                    <label>Start Range:</label>
                    <input type="number" className="viz-input full" value={queryL} onChange={e=>setQueryL(parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label>End Range:</label>
                    <input type="number" className="viz-input full" value={queryR} onChange={e=>setQueryR(parseInt(e.target.value))} />
                  </div>
                </div>
                <button className="viz-green-btn full mt-10" onClick={handleQuery}>Run Query</button>
              </div>
            )}
          </div>

          {/* Accordion 3: Range Update */}
          <div className="viz-accordion">
            <button className="viz-acc-header" onClick={() => toggleAccordion('rangeUpdate')}>
              {activeAccordion === 'rangeUpdate' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              Range Update
            </button>
            {activeAccordion === 'rangeUpdate' && (
              <div className="viz-acc-body">
                <div className="viz-input-row">
                  <div>
                    <label>Start Range:</label>
                    <input type="number" className="viz-input full" value={rangeUpdateL} onChange={e=>setRangeUpdateL(parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label>End Range:</label>
                    <input type="number" className="viz-input full" value={rangeUpdateR} onChange={e=>setRangeUpdateR(parseInt(e.target.value))} />
                  </div>
                </div>
                <div className="viz-input-row mt-10">
                  <div style={{width: '100%'}}>
                    <label>Enter Value:</label>
                    <input type="number" className="viz-input full" value={rangeUpdateVal} onChange={e=>setRangeUpdateVal(parseInt(e.target.value))} />
                  </div>
                </div>
                <button className="viz-green-btn full mt-10" onClick={handleRangeUpdate}>Update Range</button>
              </div>
            )}
          </div>
        </div>

        <div className="viz-canvas-wrapper">
          <div className="viz-canvas" ref={treeContainerRef}>
            <div className="viz-canvas-tools">
              <button><Maximize size={16} /></button>
              <button onClick={() => generateRandomArray(N)}><RotateCcw size={16} /></button>
              <button><Download size={16} /></button>
            </div>
            
            <svg className="viz-tree-svg">
              {renderEdges()}
            </svg>
            <div className="viz-tree-nodes">
              {renderNodes()}
            </div>
          </div>
          
          <button className="viz-report-btn">
            <Bug size={14} /> Report Bug
          </button>
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

export default SegmentTreeVisualizer;
