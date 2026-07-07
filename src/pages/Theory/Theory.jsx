import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Book } from 'lucide-react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import styles from './Theory.module.css';

export default function Theory() {
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
          <h1>Segment Tree - Theory</h1>
        </div>
      </header>

      <main className={styles.content}>
        <section className={styles.section}>
          <h2>1. Introduction</h2>
          <p>
            <Latex>{"A Segment Tree is a versatile data structure used in competitive programming and algorithm design. It is primarily designed to answer range queries over an array effectively, while still being flexible enough to allow quick modification of the array."}</Latex>
          </p>
          <p>
            <Latex>{"For example, finding the sum of consecutive array elements $a[l.... r]$, or finding the minimum element in a such a range in $O(log n)$ time. Between answering such queries, the Segment Tree allows modifying the array by replacing one element, or even changing the elements of a whole subsegment (e.g. assigning all elements $a[l...r]$ to any value, or adding a value to all element in the subsegment)."}</Latex>
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Simplest Form of a Segment Tree</h2>
          <p>
            <Latex>{"To understand the Segment Tree, consider an array $a$ of size $n$. The Segment Tree is a binary tree where each node represents a segment of the array $a$."}</Latex>
          </p>
          <ul>
            <li><Latex>{"The root of the tree represents the entire array $[0, n-1]$."}</Latex></li>
            <li><Latex>{"Each internal node representing segment $[l, r]$ has two children. The left child represents $[l, m]$ and the right child represents $[m+1, r]$, where $m = (l+r)/2$."}</Latex></li>
            <li><Latex>{"The leaves of the tree represent segments of length 1 (i.e., the individual elements of the array)."}</Latex></li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Construction</h2>
          <p>
            <Latex>{"Before we can answer queries, we need to build the Segment Tree. We build it from the bottom up. We can compute the value of the internal nodes based on the values of their children. If we are building a Sum Segment Tree, the value of a node is simply the sum of the values of its two children."}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`void build(int node, int start, int end) {
    if (start == end) {
        tree[node] = A[start];
    } else {
        int mid = (start + end) / 2;
        build(2 * node, start, mid);
        build(2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
}`}
            </pre>
          </div>
          <p><Latex>{"The time complexity for building the tree is $O(n)$, since there are at most $4n$ vertices, and computing each vertex takes $O(1)$ time."}</Latex></p>
        </section>

        <section className={styles.section}>
          <h2>4. Range Queries</h2>
          <p>
            <Latex>{"To answer a query for the sum in range $[l, r]$, we traverse the tree starting from the root. At each node representing segment $[tl, tr]$, there are three possibilities:"}</Latex>
          </p>
          <ol>
            <li><strong>Total Overlap:</strong> <Latex>{"The segment $[tl, tr]$ is completely inside the query range $[l, r]$. We simply return the precomputed value of the node."}</Latex></li>
            <li><strong>No Overlap:</strong> <Latex>{"The segment $[tl, tr]$ is completely outside the query range. We return $0$ (or a neutral element)."}</Latex></li>
            <li><strong>Partial Overlap:</strong> <Latex>{"The segment partially overlaps with the query range. We split the query into two parts, recursively query the left and right children, and combine their results."}</Latex></li>
          </ol>
          <p><Latex>{"This process guarantees that we visit at most $O(log n)$ nodes per query."}</Latex></p>
        </section>

        <section className={styles.section}>
          <h2>5. Point Updates</h2>
          <p>
            <Latex>{"To update an element at index $i$ to a new value $x$, we start from the root and recursively find the leaf node representing index $i$. Once the leaf is updated, we return from the recursion, recalculating the values of all ancestors of that leaf based on their children."}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`void update(int node, int start, int end, int idx, int val) {
    if (start == end) {
        tree[node] = val;
    } else {
        int mid = (start + end) / 2;
        if (start <= idx && idx <= mid) {
            update(2 * node, start, mid, idx, val);
        } else {
            update(2 * node + 1, mid + 1, end, idx, val);
        }
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
}`}
            </pre>
          </div>
          <p><Latex>{"The update also takes $O(log n)$ time, directly proportional to the height of the tree."}</Latex></p>
        </section>
        
        <section className={styles.section}>
          <h2>6. Range Updates and Lazy Propagation</h2>
          <p>
            <Latex>{"When we need to update an entire range of elements, e.g., adding a value $x$ to all elements in $[l, r]$, updating them one by one using a point update would take $O(n log n)$ time, which is too slow. To achieve $O(log n)$ time, we use a technique called Lazy Propagation."}</Latex>
          </p>
          <p>
            <Latex>{"The main idea of Lazy Propagation is that we delay updating the descendants of a node until we absolutely need their values. When an update covers a node's segment completely, we just update this node's value and store a **lazy tag** for it. We do not update its children immediately."}</Latex>
          </p>
          <p>
            <Latex>{"Whenever we visit a node (either for a query or another update), we check if it has a pending lazy tag. If it does, we apply the tag to the node, push the tag down to its immediate children, and then clear the tag from the current node."}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`void push(int node) {
    if (lazy[node] != 0) {
        tree[2 * node] += lazy[node];
        lazy[2 * node] += lazy[node];
        tree[2 * node + 1] += lazy[node];
        lazy[2 * node + 1] += lazy[node];
        lazy[node] = 0;
    }
}

void rangeUpdate(int node, int start, int end, int l, int r, int val) {
    if (l <= start && end <= r) {
        tree[node] += val;
        lazy[node] += val;
        return;
    }
    push(node);
    int mid = (start + end) / 2;
    if (l <= mid) rangeUpdate(2 * node, start, mid, l, r, val);
    if (r > mid) rangeUpdate(2 * node + 1, mid + 1, end, l, r, val);
    tree[node] = max(tree[2 * node], tree[2 * node + 1]);
}`}
            </pre>
          </div>
          <p><Latex>{"With Lazy Propagation, range updates take $O(log n)$ time because we still only visit at most $O(log n)$ nodes per query, similar to how standard range queries work!"}</Latex></p>
        </section>
      </main>
    </div>
  );
}
