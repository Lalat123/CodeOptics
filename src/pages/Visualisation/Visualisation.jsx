import { useParams } from 'react-router-dom';
import SegmentTreeVisualizer from './SegmentTreeVisualizer';
import SparseTableVisualizer from './SparseTableVisualizer';

export default function Visualisation() {
  const { id } = useParams();

  if (id === 'segment-tree') {
    return <SegmentTreeVisualizer />;
  }
  if (id === 'sparse-table') {
    return <SparseTableVisualizer />;
  }

  return (
    <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>
      <h2>Visualizer not found for this topic</h2>
    </div>
  );
}
