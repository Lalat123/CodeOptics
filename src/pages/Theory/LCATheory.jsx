import React from 'react';
import { ArrowLeft, Book } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import styles from './Theory.module.css';

export default function LCATheory() {
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
          <h1>LCA (Binary Lifting) - Theory</h1>
        </div>
      </header>

      <main className={styles.content}>
        <p className={styles.introduction}>
          <Latex>{"The **Lowest Common Ancestor (LCA)** of two nodes $u$ and $v$ in a tree is the lowest (i.e. deepest) node that has both $u$ and $v$ as descendants. **Binary Lifting** is a brilliant dynamic programming technique that allows us to find the LCA in exactly $O(\\log N)$ time after an $O(N \\log N)$ preprocessing step."}</Latex>
        </p>

        <section className={styles.section}>
          <h2>1. Preprocessing: The DP Table</h2>
          <p>
            <Latex>{"Instead of just storing the immediate parent of each node, we maintain a 2D table `up[u][i]` which stores the **$2^i$-th ancestor** of node $u$."}</Latex>
          </p>
          <p>
            <Latex>{"We can compute this table recursively. The $2^i$-th ancestor of $u$ is simply the $2^{i-1}$-th ancestor of the $2^{i-1}$-th ancestor of $u$!"}</Latex>
          </p>
          <p style={{ textAlign: 'center', margin: '15px 0' }}>
            <Latex>{"$$up[u][i] = up[\\, up[u][i-1] \\,][i-1]$$"}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`const int LOG = 20;
int up[MAXN][LOG];
int depth[MAXN];

void dfs(int u, int p, int d) {
    depth[u] = d;
    up[u][0] = p; // 2^0 = 1st ancestor (parent)
    
    for (int i = 1; i < LOG; i++) {
        if (up[u][i - 1] != -1) {
            up[u][i] = up[up[u][i - 1]][i - 1];
        } else {
            up[u][i] = -1;
        }
    }
    
    for (int v : adj[u]) {
        if (v != p) dfs(v, u, d + 1);
    }
}`}
            </pre>
          </div>
        </section>

        <section className={styles.section}>
          <h2>2. Finding the LCA: Step-by-Step</h2>
          <p>
            <Latex>{"Finding the LCA is done in two distinct phases:"}</Latex>
          </p>
          <h3>Phase 1: Equate Depths</h3>
          <p>
            <Latex>{"If $u$ and $v$ are at different depths in the tree, we cannot jump them together. Assume $u$ is deeper than $v$. We want to lift $u$ up until `depth[u] == depth[v]`."}</Latex>
          </p>
          <p>
            <Latex>{"We calculate the height difference $k = depth[u] - depth[v]$. Since $k$ can be represented in binary, we can jump $u$ up in powers of 2 for every set bit in $k$."}</Latex>
          </p>
          
          <h3>Phase 2: Jump Together</h3>
          <p>
            <Latex>{"Once $u$ and $v$ are at the same depth, they might actually be the same node (meaning $v$ was an ancestor of $u$). If they are, $v$ is the LCA!"}</Latex>
          </p>
          <p>
            <Latex>{"If they are different, we iterate our powers of 2 from largest ($i = LOG-1$) down to $0$. If jumping $u$ and $v$ up by $2^i$ leads to **different** nodes, it means we haven't reached or overshot the LCA yet, so we take the jump! If they lead to the same node, it might be the LCA or an ancestor above the LCA, so we do **not** take the jump."}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`int get_lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    
    // Phase 1: Equate Depths
    int k = depth[u] - depth[v];
    for (int i = 0; i < LOG; i++) {
        if (k & (1 << i)) {
            u = up[u][i];
        }
    }
    
    if (u == v) return u;
    
    // Phase 2: Jump Together
    for (int i = LOG - 1; i >= 0; i--) {
        if (up[u][i] != -1 && up[u][i] != up[v][i]) {
            u = up[u][i];
            v = up[v][i];
        }
    }
    
    // The LCA is the immediate parent of where they stopped
    return up[u][0];
}`}
            </pre>
          </div>
          <p>
            <Latex>{"By jumping from the largest power of 2 down to the smallest, we effectively do a binary search to find the node exactly one step below the LCA. Returning `up[u][0]` gives us the LCA in $O(\\log N)$ time."}</Latex>
          </p>
        </section>
      </main>
    </div>
  );
}
