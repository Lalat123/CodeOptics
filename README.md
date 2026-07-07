# Segment Tree – Interactive Algorithm Visualization Platform
React NodeJS Express.js Vite JavaScript

Segment Tree is a dynamic, web-based visualization web application built with React and Node.js. It allows users to seamlessly simulate Segment Tree construction and range sum queries in real-time. Basically, it helps developers and students visualize complex Data Structures and Algorithms (DSA) concepts, test logic, and analyze tree operations in a fast, distraction-free environment.

## Features
- **Multiple Tree Types** – Instantly switch between Sum, Min, and Max Segment Trees to visualize different mathematical operations.
- **Dynamic Array Sizes** – Scale the visualization between 4, 8, and 16 nodes to understand how the tree depth and structure adapt.
- **Visual Range Queries** – Execute $O(\log N)$ range queries and watch as the algorithm intelligently splits and combines partial overlaps in real-time.
- **Point Updates** – Modify array values on the fly and trace the $O(\log N)$ path up to the root as internal nodes are recalculated.
- **Step-by-Step Logging** – Provides instant feedback and precise execution trace logs for every node visited during operations.
- **Dark Mode Aesthetic** – Offers a beautiful, visually appealing dark theme with glassmorphism UI for comfortable use.
- **Interactive UI** – Built with a beautifully structured split-pane interface and fluid micro-animations that highlight tree paths.

## Directory Structure
```text
Segment_Tree/
├── src/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── public/
│   └── vite.svg
├── index.html
├── package.json
├── server.js
└── vite.config.js
```

## 🛠️ Technologies Used
React NodeJS Express.js Vite JavaScript

- **JavaScript/Node.js** – Core programming language for mathematical logic and backend processing.
- **Express.js** – Lightweight web framework used for backend routing to serve the application.
- **React.js & Vite** – For building the lightning-fast, highly responsive, state-driven user interface.
- **CSS3** – For styling the layout, glassmorphism aesthetics, SVGs, and fluid tree micro-animations.

## Installation
Create a clone or download the repository to your local machine.

1. **Install Dependencies**: Open a terminal in the project folder and install the required packages:
   ```bash
   npm install
   ```

2. **Start the Frontend (Development Mode)**: 
   ```bash
   npm run dev
   ```
   Open your browser and visit: `http://localhost:5173`

3. **Run Full-Stack (Production Build)**: Build the React app and start the Node.js server:
   ```bash
   npm run build
   node server.js
   ```
   The application will be served on `http://localhost:3000`.

## Usage
1. Launch the application in your browser.
2. Select your desired tree type from the dropdown menu (Sum, Min, or Max).
3. Choose the number of leaf nodes (4, 8, or 16) or click **Randomize** to generate new array values.
4. **Range Query**: Enter a start (`L`) and end (`R`) index in the left panel and click "Run Query" to see how the algorithm fetches the result in $O(\log N)$ time.
5. **Point Update**: Enter a target index and a new value, then click "Update" to watch the tree recalculate the path to the root.
6. Review the **Right Panel** for a step-by-step trace log detailing which nodes were visited, ignored, or combined.

## Execution Logic
Segment Tree uses a mathematical approach to perfectly map binary tree nodes to a linear array. It ensures:

- **Optimized Construction** – Builds the tree in strictly $O(N)$ time by combining child nodes from the bottom up.
- **Real-Time Highlighting** – Seamlessly maps standard 1D array coordinates (e.g., `2*i` and `2*i + 1`) to visually render SVG connecting edges.
- **Recursive Traversal** – Implements strict boundary checking logic (`L <= start` and `end <= R`) to determine total overlap, partial overlap, or no overlap.

## Educational Value
After executing an operation, the application provides built-in metrics and visual cues that offer:

- **Path Tracing** – Nodes turn yellow when visited, and green when a result is confirmed and returned.
- **State Reporting** – Clearly states if a sub-tree was completely within the query range, or if it was split and combined.
- **Algorithm Optimization** – Visually proves why a Segment Tree is faster than standard array iteration for large datasets.

## Future Improvements
While the visualizer currently runs as a blazing-fast local sandbox, several enhancements are planned:

- **Lazy Propagation** – Add support for visualizing Range Updates using the lazy propagation technique.
- **Custom Arrays** – Allow users to manually type out their entire base array instead of relying on random generation.
- **Step Controls** – Add "Pause", "Next Step", and "Previous Step" buttons to manually walk through the recursive stack trace at your own pace.

## License
This project is licensed under the MIT License.
