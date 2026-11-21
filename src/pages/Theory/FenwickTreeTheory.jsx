import React from 'react';
import { ArrowLeft, Book } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import styles from './Theory.module.css';

export default function FenwickTreeTheory() {
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
          <h1>Fenwick Tree (BIT) - Theory</h1>
        </div>
      </header>

      <main className={styles.content}>
        <p className={styles.introduction}>
          <Latex>{"A **Fenwick Tree** or **Binary Indexed Tree (BIT)** is a highly elegant data structure that can efficiently update elements and calculate prefix sums in a table of numbers. It achieves $O(\\log N)$ time for both operations while requiring extremely minimal code and exactly $O(N)$ space."}</Latex>
        </p>

        <section className={styles.section}>
          <h2>1. The Core Idea: Binary Representation</h2>
          <p>
            <Latex>{"The magic of the Fenwick Tree relies on the fact that any integer can be represented as a sum of powers of 2. In the same way, we can compute the sum of an arbitrary range by combining the sums of non-overlapping sub-ranges whose lengths are powers of 2."}</Latex>
          </p>
          <p>
            <Latex>{"In a BIT, the array is 1-indexed. Each index $i$ is responsible for a segment of the original array. Specifically, the node at index $i$ stores the sum of the elements in the range:"}</Latex>
          </p>
          <p style={{ textAlign: 'center', margin: '15px 0' }}>
            <Latex>{"$$[i - (i \\ \\& \\ -i) + 1, i]$$"}</Latex>
          </p>
          <p>
            <Latex>{"Where $i \\ \\& \\ -i$ extracts the **lowest set bit** (LSB) of $i$. For example, if $i = 12$ (binary `1100`), the lowest set bit is `100` (which is 4). So, $BIT[12]$ stores the sum of the last 4 elements ending at 12: $[9, 12]$."}</Latex>
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Isolating the Lowest Set Bit (LSB)</h2>
          <p>
            <Latex>{"In two's complement arithmetic, the negative of a number $-i$ is obtained by inverting all bits of $i$ and adding 1. When you perform a bitwise AND between $i$ and $-i$, all bits above the lowest set bit cancel out, and the lowest set bit itself is preserved."}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`int LSB(int i) {
    return i & -i;
}`}
            </pre>
          </div>
        </section>

        <section className={styles.section}>
          <h2>3. Point Update</h2>
          <p>
            <Latex>{"When we update an element at index $i$, we need to update all segments in the BIT that contain $i$. To find the next segment that contains $i$, we add the LSB to $i$."}</Latex>
          </p>
          <p style={{ textAlign: 'center', margin: '15px 0' }}>
            <Latex>{"$$i_{next} = i + (i \\ \\& \\ -i)$$"}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`void add(int i, int delta) {
    for (; i <= n; i += i & -i) {
        BIT[i] += delta;
    }
}`}
            </pre>
          </div>
          <p>
            <Latex>{"This sequence jumps up the tree, updating exactly the nodes that are responsible for ranges encompassing the original index. Because we are stripping/adding bits, this loop runs at most $O(\\log N)$ times."}</Latex>
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Prefix Sum Query</h2>
          <p>
            <Latex>{"To compute the sum of the prefix $[1, i]$, we sum the value at $BIT[i]$ and then move to the preceding segment. We find the preceding segment by subtracting the LSB from $i$."}</Latex>
          </p>
          <p style={{ textAlign: 'center', margin: '15px 0' }}>
            <Latex>{"$$i_{next} = i - (i \\ \\& \\ -i)$$"}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`int query(int i) {
    int sum = 0;
    for (; i > 0; i -= i & -i) {
        sum += BIT[i];
    }
    return sum;
}`}
            </pre>
          </div>
          <p>
            <Latex>{"To answer a general range query $[L, R]$, we simply compute:"}</Latex>
          </p>
          <p style={{ textAlign: 'center', margin: '15px 0' }}>
            <Latex>{"$$\\text{Sum}(L, R) = \\text{query}(R) - \\text{query}(L - 1)$$"}</Latex>
          </p>
        </section>
        
        <section className={styles.section}>
          <h2>5. Range Update & Point Query (Difference Array)</h2>
          <p>
            <Latex>{"While a standard Fenwick Tree is perfect for Point Updates and Range Queries (PURQ), it can easily be adapted for Range Updates and Point Queries (RUPQ) using a **Difference Array** trick."}</Latex>
          </p>
          <p>
            <Latex>{"Instead of storing the actual array values, we store the differences between adjacent elements: $D[i] = A[i] - A[i-1]$. Now, when we want to add $V$ to the range $[L, R]$, we only need two point updates on the difference array:"}</Latex>
          </p>
          <ul>
            <li><Latex>{"Add $V$ at index $L$: `add(L, V)`"}</Latex></li>
            <li><Latex>{"Subtract $V$ at index $R + 1$: `add(R + 1, -V)`"}</Latex></li>
          </ul>
          <p>
            <Latex>{"To query the value at a specific point $i$, we just compute the prefix sum up to $i$ on the difference array!"}</Latex>
          </p>
        </section>
      </main>
    </div>
  );
}
