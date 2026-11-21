import React from 'react';
import { ArrowLeft, Book } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import styles from './Theory.module.css';

export default function KMPTheory() {
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
          <h1>Knuth-Morris-Pratt (KMP) Algorithm</h1>
        </div>
      </header>

      <main className={styles.content}>
        <p className={styles.introduction}>
          <Latex>{"The **Knuth-Morris-Pratt (KMP)** algorithm is a powerful string matching algorithm that finds all occurrences of a **Pattern** of length $M$ in a **Text** of length $N$ in **$O(N + M)$** time. It achieves this by avoiding redundant comparisons using an LPS (Longest Proper Prefix which is also a Suffix) array."}</Latex>
        </p>

        <section className={styles.section}>
          <h2>1. The LPS Array (Prefix Function)</h2>
          <p>
            <Latex>{"The core of KMP is the **LPS Array**. For a pattern $P$, `lps[i]` stores the length of the longest proper prefix of the substring $P[0..i]$ that is also a suffix of $P[0..i]$."}</Latex>
          </p>
          <ul>
            <li><Latex>{"**Proper Prefix:** A prefix that is not the entire string itself."}</Latex></li>
            <li><Latex>{"**Purpose:** When a mismatch occurs during the search, the LPS array tells us exactly how far back to shift the pattern without re-evaluating previously matched characters."}</Latex></li>
          </ul>
          <p>
            <Latex>{"For example, if the pattern is `ABABCABAB`, the LPS array is `[0, 0, 1, 2, 0, 1, 2, 3, 4]`."}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`vector<int> computeLPS(string pattern) {
    int m = pattern.length();
    vector<int> lps(m, 0);
    
    int len = 0; // Length of previous longest prefix suffix
    int i = 1;
    
    while (i < m) {
        if (pattern[i] == pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len != 0) {
                len = lps[len - 1]; // Fall back!
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
    return lps;
}`}
            </pre>
          </div>
        </section>

        <section className={styles.section}>
          <h2>2. The Matching Phase</h2>
          <p>
            <Latex>{"During the search, we maintain a pointer $i$ for the Text and a pointer $j$ for the Pattern. If `Text[i] == Pattern[j]`, we increment both. If there is a mismatch (`Text[i] != Pattern[j]`), we look at the LPS array."}</Latex>
          </p>
          <p>
            <Latex>{"Instead of resetting $i$ backward (which would take $O(N \\times M)$ time), we simply shift the pattern by updating $j = lps[j-1]$. This effectively aligns the longest matching prefix of the pattern with the suffix we just matched in the text!"}</Latex>
          </p>
          <div className={styles.codeBlock}>
            <pre>
{`void KMPSearch(string text, string pattern) {
    int n = text.length();
    int m = pattern.length();
    
    vector<int> lps = computeLPS(pattern);
    
    int i = 0; // index for text
    int j = 0; // index for pattern
    
    while ((n - i) >= (m - j)) {
        if (pattern[j] == text[i]) {
            j++;
            i++;
        }
        
        if (j == m) {
            cout << "Pattern found at index " << i - j << endl;
            j = lps[j - 1]; // Continue searching for multiple matches
        } else if (i < n && pattern[j] != text[i]) {
            if (j != 0) {
                j = lps[j - 1]; // Shift pattern using LPS
            } else {
                i++; // First character mismatch, move text pointer
            }
        }
    }
}`}
            </pre>
          </div>
        </section>

        <section className={styles.section}>
          <h2>3. Time Complexity</h2>
          <p>
            <Latex>{"- **LPS Construction:** The `len` pointer can decrease at most as many times as it increases. Thus, the inner while-loop runs at most $M$ times total across all iterations, giving $O(M)$."}</Latex>
          </p>
          <p>
            <Latex>{"- **Search Phase:** Similarly, the text pointer $i$ never steps backward, and the pattern pointer $j$ falls back at most $N$ times. This gives $O(N)$."}</Latex>
          </p>
          <p>
            <Latex>{"- **Total Time Complexity:** $O(N + M)$."}</Latex>
          </p>
        </section>
      </main>
    </div>
  );
}
