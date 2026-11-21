import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Book } from 'lucide-react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import styles from './Theory.module.css';

export default function DisjointSetUnionTheory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleBack = () => {
    navigate(`/topic/${id}`);
  };

  return (
    <div className={styles.theoryContainer}>
      <header className={styles.header}>
        <button onClick={handleBack} className={styles.backBtn}>
          <ArrowLeft size={20} />
          <span>Back to Options</span>
        </button>
        <div className={styles.titleWrapper}>
          <Book className={styles.titleIcon} size={28} />
          <h1>Disjoint Set Union (DSU) - Theory</h1>
        </div>
      </header>

      <main className={styles.content}>
        <section className={styles.section}>
          <h2>1. Introduction</h2>
          <p>
            <Latex>{"A **Disjoint Set Union** (DSU), also known as Union-Find, is a data structure that tracks a set of elements partitioned into a number of disjoint (non-overlapping) subsets."}</Latex>
          </p>
          <p>
            <Latex>{"It provides near-constant-time operations (specifically $O(\\alpha(N))$ time, where $\\alpha$ is the inverse Ackermann function) to add new sets, to merge existing sets, and to determine whether elements are in the same set."}</Latex>
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Core Operations</h2>
          <ul>
            <li>
              <strong>Find:</strong> Determine which subset a particular element is in. This can be used for determining if two elements are in the same subset.
            </li>
            <li>
              <strong>Union:</strong> Join two subsets into a single subset.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Path Compression</h2>
          <p>
            <Latex>{"Path compression is an optimization to the `find` operation. When `find(x)` is called, the structure updates the parent of `x` (and all other nodes on the path to the root) to point directly to the root. This flattens the tree, vastly speeding up future operations."}</Latex>
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Union by Size / Rank</h2>
          <p>
            <Latex>{"To ensure the trees do not become too deep, we can attach the smaller tree to the root of the larger tree during the `union` operation. This keeps the maximum depth of any tree extremely small."}</Latex>
          </p>
          <p>
            <Latex>{"With both Path Compression and Union by Size, the operations are bounded by $O(\\alpha(N))$, making it practically constant time $O(1)$ for almost any plausible input size."}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`class DSU {
private:
    vector<int> parent, size;
public:
    DSU(int n) {
        parent.resize(n);
        size.resize(n, 1);
        for(int i = 0; i < n; i++) parent[i] = i;
    }
    
    int find(int i) {
        if (parent[i] == i)
            return i;
        // Path compression
        return parent[i] = find(parent[i]); 
    }
    
    void unite(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);
        
        if (root_i != root_j) {
            // Union by size
            if (size[root_i] < size[root_j])
                swap(root_i, root_j);
            
            parent[root_j] = root_i;
            size[root_i] += size[root_j];
        }
    }
};`}
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}
