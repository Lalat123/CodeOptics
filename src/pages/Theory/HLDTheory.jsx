import React from 'react';
import { ArrowLeft, Book } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import styles from './Theory.module.css';

export default function HLDTheory() {
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
          <h1>Heavy-Light Decomposition - Theory</h1>
        </div>
      </header>

      <main className={styles.content}>
        <p className={styles.introduction}>
          <Latex>{"**Heavy-Light Decomposition (HLD)** is an advanced technique that breaks down a tree into a set of disjoint paths (called **chains**). By mapping these chains to contiguous blocks in a 1D Array, we can use a **Segment Tree** to answer path queries (e.g., finding the maximum edge between node $u$ and $v$) in $O(\\log^2 N)$ time!"}</Latex>
        </p>

        <section className={styles.section}>
          <h2>1. Heavy vs Light Edges</h2>
          <p>
            <Latex>{"The core idea is to classify every edge in the tree as either **Heavy** or **Light** based on the size of the subtrees."}</Latex>
          </p>
          <ul>
            <li><Latex>{"**Heavy Edge:** The edge connecting a node to its child with the largest subtree size."}</Latex></li>
            <li><Latex>{"**Light Edge:** All other edges connecting a node to its remaining children."}</Latex></li>
          </ul>
          <p>
            <Latex>{"This guarantees a mathematical property: Any path from a node to the root will pass through at most $O(\\log N)$ Light Edges. This is because every time you traverse a light edge upwards, the subtree size at least doubles!"}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`// DFS 1: Compute Subtree Sizes & Heavy Children
int dfs1(int u, int p) {
    sz[u] = 1;
    heavy[u] = -1;
    int max_sub = 0;
    
    for (int v : adj[u]) {
        if (v != p) {
            int sub = dfs1(v, u);
            sz[u] += sub;
            if (sub > max_sub) {
                max_sub = sub;
                heavy[u] = v; // Mark as Heavy Child
            }
        }
    }
    return sz[u];
}`}
            </pre>
          </div>
        </section>

        <section className={styles.section}>
          <h2>2. Building the Chains</h2>
          <p>
            <Latex>{"We then perform a second DFS to decompose the tree into chains. A chain is simply a continuous path of Heavy edges. The crucial step is the order we traverse the children: **we always visit the heavy child first.**"}</Latex>
          </p>
          <p>
            <Latex>{"Because we visit heavy children first, the nodes in a single chain will have **continuous indices** in our DFS traversal order (`pos_in_array`). This allows us to map an entire chain to a single continuous range in a Segment Tree!"}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`// DFS 2: Build Chains and Map to 1D Array
int timer = 0;

void dfs2(int u, int p, int head) {
    head_of_chain[u] = head;
    pos_in_array[u] = timer++;
    
    if (heavy[u] != -1) {
        // Continue the current chain
        dfs2(heavy[u], u, head);
    }
    
    for (int v : adj[u]) {
        if (v != p && v != heavy[u]) {
            // Start a new chain for light children
            dfs2(v, u, v);
        }
    }
}`}
            </pre>
          </div>
        </section>

        <section className={styles.section}>
          <h2>3. Path Queries in $O(\log^2 N)$</h2>
          <p>
            <Latex>{"To query the path between $u$ and $v$, we climb the tree chain by chain, similar to finding the Lowest Common Ancestor (LCA)."}</Latex>
          </p>
          <ol>
            <li><Latex>{"Look at the heads of the chains that $u$ and $v$ are currently on."}</Latex></li>
            <li><Latex>{"Take the node whose chain head is **deeper** (lower down the tree)."}</Latex></li>
            <li><Latex>{"Query the Segment Tree for the range `[pos[head], pos[node]]`."}</Latex></li>
            <li><Latex>{"Jump the node up to the parent of its chain head."}</Latex></li>
            <li><Latex>{"Repeat until $u$ and $v$ are on the **same chain**."}</Latex></li>
            <li><Latex>{"Finally, query the remaining segment between $u$ and $v$ on that final chain."}</Latex></li>
          </ol>
          <div className={styles.codeBlock}>
            <pre>
{`int query_path(int u, int v) {
    int res = 0; // Or INF for minimum
    
    while (head_of_chain[u] != head_of_chain[v]) {
        if (depth[head_of_chain[u]] < depth[head_of_chain[v]]) {
            swap(u, v);
        }
        // Query the segment tree for this chain segment
        res = max(res, query_seg_tree(pos_in_array[head_of_chain[u]], pos_in_array[u]));
        
        // Jump to the parent of the chain head (a light edge)
        u = parent[head_of_chain[u]];
    }
    
    // Now they are on the same chain.
    if (depth[u] > depth[v]) swap(u, v);
    res = max(res, query_seg_tree(pos_in_array[u], pos_in_array[v]));
    
    return res;
}`}
            </pre>
          </div>
          <p>
            <Latex>{"Since a path to the root contains at most $O(\\log N)$ light edges, we jump chains at most $O(\\log N)$ times. Each jump requires a Segment Tree query which takes $O(\\log N)$ time. Thus, the total query time is $O(\\log^2 N)$!"}</Latex>
          </p>
        </section>
      </main>
    </div>
  );
}
