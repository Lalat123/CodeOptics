import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Book } from 'lucide-react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import styles from './Theory.module.css';

export default function SparseTableTheory() {
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
          <h1>Sparse Table - Theory</h1>
        </div>
      </header>

      <main className={styles.content}>
        <section className={styles.section}>
          <h2>1. Introduction</h2>
          <p>
            <Latex>{"A **Sparse Table** is an elegant and highly optimized data structure used primarily to answer static range queries. It allows for answering idempotent range queries (like Minimum, Maximum, or GCD) in $O(1)$ time, after an $O(N \\log N)$ preprocessing step."}</Latex>
          </p>
          <p>
            <Latex>{"Unlike a Segment Tree, a Sparse Table does not support fast updates. Once the table is built, the array is considered static. If the array changes, the entire table must be rebuilt."}</Latex>
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. The Intuition (Powers of 2)</h2>
          <p>
            <Latex>{"The core idea behind the Sparse Table is that any non-negative integer can be represented as a sum of powers of two (binary representation). Because of this, any range of length $L$ can be broken down into a union of smaller ranges whose lengths are powers of two."}</Latex>
          </p>
          <p>
            <Latex>{"For idempotent functions where $f(x, x) = x$ (like Min and Max), we don't even need to disjointly partition the range. We can just take two overlapping intervals of length $2^k$ that perfectly cover the entire query range!"}</Latex>
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. Construction (Preprocessing)</h2>
          <p>
            <Latex>{"We define a 2D array $ST[i][j]$ which stores the answer for the query on the range of length $2^j$ starting at index $i$. Specifically, it covers the range $[i, i + 2^j - 1]$."}</Latex>
          </p>
          <p>
            <Latex>{"To compute $ST[i][j]$, we can recursively combine two smaller intervals of length $2^{j-1}$:"}</Latex>
          </p>
          <ul>
            <li><Latex>{"The first interval starts at $i$: $[i, i + 2^{j-1} - 1]$"}</Latex></li>
            <li><Latex>{"The second interval starts at $i + 2^{j-1}$: $[i + 2^{j-1}, i + 2^j - 1]$"}</Latex></li>
          </ul>
          <div className={styles.codeBlock}>
            <pre>
{`const int MAXN = 100005;
const int K = 20; // log2(MAXN)
int st[MAXN][K];

void build(int arr[], int N) {
    // Base Case: intervals of length 1 (2^0)
    for (int i = 0; i < N; i++) {
        st[i][0] = arr[i];
    }
    
    // Compute for lengths 2^1, 2^2, ..., 2^K
    for (int j = 1; (1 << j) <= N; j++) {
        for (int i = 0; (i + (1 << j) - 1) < N; i++) {
            st[i][j] = min(
                st[i][j - 1], 
                st[i + (1 << (j - 1))][j - 1]
            );
        }
    }
}`}
            </pre>
          </div>
          <p><Latex>{"Because we compute $N$ values for each of the $\\log N$ levels, the time and space complexity for building the table is $O(N \\log N)$."}</Latex></p>
        </section>

        <section className={styles.section}>
          <h2>4. O(1) Range Minimum Queries (RMQ)</h2>
          <p>
            <Latex>{"To query the minimum in the range $[L, R]$, we calculate the length of the range $len = R - L + 1$. We then find the largest power of two that fits inside this length, let's call it $2^k$. In code, $k = \\lfloor \\log_2(len) \\rfloor$."}</Latex>
          </p>
          <p>
            <Latex>{"We can perfectly cover the range $[L, R]$ with exactly two overlapping intervals of length $2^k$:"}</Latex>
          </p>
          <ol>
            <li><Latex>{"The interval starting at $L$: $ST[L][k]$"}</Latex></li>
            <li><Latex>{"The interval ending at $R$: $ST[R - 2^k + 1][k]$"}</Latex></li>
          </ol>
          <p>
            <Latex>{"Because the `min` operation is idempotent, it is perfectly fine that these two intervals overlap. The overlapping elements are simply checked twice, which doesn't affect the final minimum value."}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`int query(int L, int R) {
    int len = R - L + 1;
    
    // Fast way to compute log2(len) in C++
    int k = 31 - __builtin_clz(len); 
    
    return min(
        st[L][k], 
        st[R - (1 << k) + 1][k]
    );
}`}
            </pre>
          </div>
          <p><Latex>{"This lookup takes exactly two array accesses, making the query time highly optimized at $O(1)$!"}</Latex></p>
        </section>
      </main>
    </div>
  );
}
