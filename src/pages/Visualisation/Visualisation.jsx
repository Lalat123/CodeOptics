import { useParams } from 'react-router-dom';
import SegmentTreeVisualizer from './SegmentTreeVisualizer';
import SparseTableVisualizer from './SparseTableVisualizer';
import DisjointSetUnionVisualizer from './DisjointSetUnionVisualizer';
import FenwickTreeVisualizer from './FenwickTreeVisualizer';
import LCAVisualizer from './LCAVisualizer';
import HLDVisualizer from './HLDVisualizer';
import KMPVisualizer from './KMPVisualizer';

export default function Visualisation() {
  const { id } = useParams();

  if (id === 'segment-tree') {
    return <SegmentTreeVisualizer />;
  }
  if (id === 'sparse-table') {
    return <SparseTableVisualizer />;
  }
  if (id === 'dsu' || id === 'disjoint-set-union') {
    return <DisjointSetUnionVisualizer />;
  }
  if (id === 'fenwick-tree') {
    return <FenwickTreeVisualizer />;
  }
  if (id === 'lca') {
    return <LCAVisualizer />;
  }
  if (id === 'hld') {
    return <HLDVisualizer />;
  }
  if (id === 'kmp') {
    return <KMPVisualizer />;
  }

  return (
    <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>
      <h2>Visualizer not found for this topic</h2>
    </div>
  );
}
