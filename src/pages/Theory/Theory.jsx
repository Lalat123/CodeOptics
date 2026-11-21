import { useParams } from 'react-router-dom';
import SegmentTreeTheory from './SegmentTreeTheory';
import SparseTableTheory from './SparseTableTheory';
import DisjointSetUnionTheory from './DisjointSetUnionTheory';
import FenwickTreeTheory from './FenwickTreeTheory';
import LCATheory from './LCATheory';
import HLDTheory from './HLDTheory';
import KMPTheory from './KMPTheory';

export default function Theory() {
  const { id } = useParams();

  if (id === 'segment-tree') {
    return <SegmentTreeTheory />;
  }
  if (id === 'sparse-table') {
    return <SparseTableTheory />;
  }
  if (id === 'dsu' || id === 'disjoint-set-union') {
    return <DisjointSetUnionTheory />;
  }
  if (id === 'fenwick-tree') {
    return <FenwickTreeTheory />;
  }
  if (id === 'lca') {
    return <LCATheory />;
  }
  if (id === 'hld') {
    return <HLDTheory />;
  }
  if (id === 'kmp') {
    return <KMPTheory />;
  }

  return (
    <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>
      <h2>Theory not found for this topic</h2>
    </div>
  );
}
