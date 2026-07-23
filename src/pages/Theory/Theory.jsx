import { useParams } from 'react-router-dom';
import SegmentTreeTheory from './SegmentTreeTheory';
import SparseTableTheory from './SparseTableTheory';

export default function Theory() {
  const { id } = useParams();

  if (id === 'segment-tree') {
    return <SegmentTreeTheory />;
  }
  if (id === 'sparse-table') {
    return <SparseTableTheory />;
  }

  return (
    <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>
      <h2>Theory not found for this topic</h2>
    </div>
  );
}
