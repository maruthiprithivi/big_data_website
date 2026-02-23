# Design Plan: MapReduce Section for Big Data Architecture Explorer

## 1. Codebase Analysis Summary

### Architecture
- **Single-file React app** (`App.jsx`, ~6665 lines) using Vite + React 18
- **Styling**: Inline styles with dark theme (slate/blue palette), Tailwind CSS 4 available
- **Visualization tools**: `@xyflow/react` (ReactFlow), `@dagrejs/dagre`, `three.js`, `lucide-react` icons
- **Pattern**: All architecture sections follow a unified data-driven pattern:
  - Architecture data object in `architectures` map (name, description, layout, overview, components, connections, useCases, advantages, challenges, learningResources)
  - Custom render function per layout type (`renderLambdaLayout()`, `renderBlockchainLayout()`, `renderStarLayout()`, `renderSnowflakeLayout()`, `renderLinearLayout()`)
  - Shared `ComponentCard` + `ConnectionArrow` components for node rendering
  - Shared overview/scenario/use-cases/advantages/challenges sections below the diagram
  - Click-to-detail modal for individual components
  - Animated data flow dots on connection arrows (togglable via `showDataFlow`)

### Navigation Pattern
- **Top nav**: Architecture pattern buttons grouped by category (Processing Architectures | Data Modeling)
- **Secondary nav**: Toggle buttons for extra sections (Compare & Glossary, Hands-on Lab, Curriculum, Case Studies)
- Sections are mutually exclusive — only one "extra" section visible at a time
- Each toggle sets its own `showXxx` state and clears all others

### Component System
- `ComponentCard`: 180x180px cards with icon, label, color-coded by `shape`
- `ConnectionArrow`: Horizontal animated arrows with data flow dots
- `VerticalConnectionArrow`: Vertical variant
- `MergeToCenterArrow`: Two-to-one merge arrow (used in blockchain layout)
- `RadialArrow` / `ChainArrow` / `BranchArrow`: For star/snowflake radial layouts
- `ERTable` / `ERSubTable`: Entity-relationship table cards for schema sections
- Color scheme map: 17 shape types with bg/border/icon/label colors
- Icon map: 17 shape types mapped to lucide-react icons

### Responsive Scaling
- `useResponsiveScale` hook handles diagram scaling based on container width
- `MIN_WIDTHS` per layout type, scale factor applied via CSS transform

---

## 2. MapReduce Section Design

### 2.1 Integration Approach

Add MapReduce as a **new architecture entry** in the `architectures` object with key `mapreduce`, plus a **new custom layout renderer** `renderMapReduceLayout()`. This follows the exact same pattern as existing architectures, so all shared infrastructure (overview, scenarios, click-to-detail modal, navigation) works automatically.

**Navigation placement**: Add a new grouped section in the top nav bar between "Processing Architectures" and "Data Modeling" — or append MapReduce to the Processing Architectures group:

```
[Lambda] [Kappa] [Streaming] [Batch] [MapReduce]  |  [Star Schema] [Snowflake Schema]
```

### 2.2 Architecture Data Object

```javascript
mapreduce: {
  name: 'MapReduce',
  difficulty: 'Intermediate',
  tagline: 'Distributed Data Processing Framework',
  description: 'MapReduce is the foundational distributed processing model introduced by Google in 2004 and implemented in Apache Hadoop. It breaks large data processing tasks into two primary phases — Map and Reduce — allowing massive datasets to be processed in parallel across thousands of commodity servers. A client submits a job with a query; the framework splits input data into chunks distributed across servers, applies the Map function to each chunk independently (producing intermediate key-value pairs), shuffles and sorts those pairs by key, then applies the Reduce function to aggregate results. This model enabled companies like Yahoo, Facebook, and LinkedIn to process petabytes of data reliably on commodity hardware.',
  layout: 'mapreduce',  // NEW custom layout
  overview: {
    text: 'MapReduce follows a simple but powerful paradigm: "divide and conquer" at massive scale. The process begins when a client submits a job to the JobTracker (YARN ResourceManager in Hadoop 2+), which consults the NameNode to locate input data blocks across the HDFS cluster. Input splits are assigned to Map tasks running on DataNodes where the data physically resides (data locality optimization). Each Mapper reads its split, applies the user-defined map() function to each record, and emits intermediate key-value pairs. The framework then performs a Shuffle & Sort phase — the most network-intensive step — where intermediate pairs are partitioned by key, transferred across the network to Reducer nodes, and sorted. Each Reducer receives all values for a given key range, applies the reduce() function to aggregate them, and writes final output to HDFS. The master/worker model with heartbeat monitoring provides fault tolerance: if a worker fails, its tasks are reassigned to other nodes.',
    scenario: 'Web Search Engine - Google-Scale Log Analysis',
    scenarioDescription: 'A search engine processes 20TB of daily web crawl logs to compute page relevance scores and search index updates. The client submits a word count and link analysis job. HDFS stores log files as 128MB blocks across 500 servers. The MapReduce framework splits the job into 160,000 Map tasks (one per block), each parsing log entries and emitting (URL, metadata) pairs. The Shuffle phase redistributes ~5TB of intermediate data by URL key across 2,000 Reduce tasks, which aggregate page visit counts, compute link graphs, and output updated search index segments back to HDFS.',
    components: [
      { name: 'Client / Driver', metric: 'Submits the MapReduce job with JAR, input/output paths, and configuration' },
      { name: 'JobTracker / ResourceManager', metric: 'Coordinates job execution, schedules tasks, monitors progress and failures' },
      { name: 'NameNode (HDFS)', metric: 'Stores metadata about file block locations across the cluster' },
      { name: 'Input Splits', metric: 'Input data divided into 128MB chunks, one per Map task' },
      { name: 'Map Phase', metric: 'User-defined map() function applied in parallel to each split, emitting key-value pairs' },
      { name: 'Shuffle & Sort', metric: 'Intermediate pairs partitioned by key, transferred across network, and sorted' },
      { name: 'Reduce Phase', metric: 'User-defined reduce() function aggregates all values per key' },
      { name: 'HDFS Output', metric: 'Final results written back to HDFS as part-r-XXXXX files' }
    ]
  },
  useCases: [
    'Large-scale log analysis and ETL',
    'Building search indexes (inverted indexes)',
    'Machine learning data preprocessing',
    'Distributed sorting and aggregation',
    'Graph processing (PageRank iterations)',
    'Data warehouse batch transformations'
  ],
  advantages: [
    'Scales linearly — add more nodes for more throughput',
    'Fault-tolerant — automatic task re-execution on failure',
    'Data locality — moves computation to data, not data to computation',
    'Simple programming model — just implement map() and reduce()',
    'Handles petabytes of data on commodity hardware',
    'Proven at Google, Yahoo, Facebook scale'
  ],
  challenges: [
    'High latency — not suitable for real-time or interactive queries',
    'Disk-heavy — intermediate data written to disk between stages',
    'Only two stages (Map → Reduce) — complex pipelines require chaining multiple jobs',
    'JVM startup overhead for each task',
    'Shuffle phase is network-intensive and can become a bottleneck',
    'Largely superseded by Apache Spark for in-memory iterative processing'
  ],
  learningResources: [
    { title: 'Google Research: MapReduce - Simplified Data Processing on Large Clusters (Original Paper)', url: 'https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/' },
    { title: 'Apache Hadoop Official Documentation: MapReduce Tutorial', url: 'https://hadoop.apache.org/docs/stable/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html' },
    { title: 'Hadoop: The Definitive Guide (O\'Reilly) - Free Sample Chapters', url: 'https://www.oreilly.com/library/view/hadoop-the-definitive/9781491901687/' }
  ],
  components: [
    { id: 'mr-client', name: 'Client', shape: 'cloud', description: 'Job submitter', details: 'The client application submits a MapReduce job including the JAR file with map/reduce functions, input/output HDFS paths, and job configuration. It communicates with the ResourceManager to initiate execution.', technologies: ['Java', 'Hadoop Streaming', 'Python'] },
    { id: 'mr-jobtracker', name: 'ResourceManager', shape: 'api', description: 'Job coordinator', details: 'The central scheduler (YARN ResourceManager) receives job submissions, negotiates container resources with NodeManagers, schedules Map and Reduce tasks, and monitors execution. Handles task failures by rescheduling on other nodes.', technologies: ['YARN', 'Hadoop', 'ZooKeeper'] },
    { id: 'mr-namenode', name: 'NameNode', shape: 'database', description: 'HDFS metadata', details: 'Stores the filesystem metadata: which blocks belong to which files and which DataNodes hold each block replica. The ResourceManager consults the NameNode to assign Map tasks to nodes holding the relevant data blocks (data locality).', technologies: ['HDFS', 'Hadoop'] },
    { id: 'mr-input', name: 'Input Splits', shape: 'log', description: 'Data partitioning', details: 'Input data is divided into fixed-size splits (typically matching HDFS block size of 128MB). Each split is assigned to one Map task. InputFormat classes (TextInputFormat, SequenceFileInputFormat) control how files are split and records are parsed.', technologies: ['HDFS', 'InputFormat'] },
    { id: 'mr-map', name: 'Map Phase', shape: 'cluster', description: 'Parallel mapping', details: 'Each Mapper runs on a DataNode, reads one input split, and applies the user-defined map(key, value) function to each record. Outputs intermediate key-value pairs to local disk (not HDFS). A combiner (optional local reducer) can pre-aggregate before the shuffle.', technologies: ['Java', 'Python', 'Combiner'] },
    { id: 'mr-shuffle', name: 'Shuffle & Sort', shape: 'pipeline', description: 'Data redistribution', details: 'The most complex and network-intensive phase. Intermediate map outputs are partitioned by key (using a hash partitioner by default), transferred across the network to Reducer nodes, and merge-sorted. Each Reducer receives all pairs for its key partition.', technologies: ['Partitioner', 'HTTP', 'Merge Sort'] },
    { id: 'mr-reduce', name: 'Reduce Phase', shape: 'stream', description: 'Aggregation', details: 'Each Reducer receives a sorted stream of (key, [values]) for its assigned key partition. The user-defined reduce(key, values) function aggregates the values — summing counts, merging lists, computing statistics. Output is written to HDFS.', technologies: ['Java', 'Python', 'Aggregation'] },
    { id: 'mr-output', name: 'HDFS Output', shape: 'warehouse', description: 'Final results', details: 'Reduce output is written to HDFS as part-r-NNNNN files (one per Reducer). OutputFormat classes control the file format (text, sequence file, Parquet). Results can feed into subsequent MapReduce jobs or analytics tools.', technologies: ['HDFS', 'Parquet', 'Hive'] }
  ],
  connections: [
    { from: 'mr-client', to: 'mr-jobtracker', type: 'query' },
    { from: 'mr-jobtracker', to: 'mr-namenode', type: 'query' },
    { from: 'mr-namenode', to: 'mr-input', type: 'batch' },
    { from: 'mr-input', to: 'mr-map', type: 'batch' },
    { from: 'mr-map', to: 'mr-shuffle', type: 'stream' },
    { from: 'mr-shuffle', to: 'mr-reduce', type: 'stream' },
    { from: 'mr-reduce', to: 'mr-output', type: 'batch' }
  ]
}
```

### 2.3 Custom Layout: `renderMapReduceLayout()`

The user's screenshot and requirements call for a visually distinctive layout that shows the full MapReduce flow — not just a linear chain but a layout that conveys:

1. **A client sending a query to servers**
2. **The query being split across multiple parallel tasks**
3. **Tasks being organized (shuffle & sort)**
4. **Results being reduced and collected**

**Layout design — a "fan-out / fan-in" diagram:**

```
                        ┌─────────────┐
                        │   Client    │
                        └──────┬──────┘
                               │ (submit job)
                        ┌──────▼──────┐
                        │ ResourceMgr │◄──► NameNode
                        └──────┬──────┘
                               │ (assign splits)
                   ┌───────────┼───────────┐
                   ▼           ▼           ▼
            ┌────────┐  ┌────────┐  ┌────────┐
            │Split 1 │  │Split 2 │  │Split 3 │    ← Input Splits
            └───┬────┘  └───┬────┘  └───┬────┘
                │           │           │
            ┌───▼────┐  ┌───▼────┐  ┌───▼────┐
            │ Map 1  │  │ Map 2  │  │ Map 3  │    ← Map Phase (parallel)
            └───┬────┘  └───┬────┘  └───┬────┘
                │           │           │
                └─────┬─────┴─────┬─────┘
                      │ SHUFFLE   │
                ┌─────▼─────┬─────▼─────┐
                │           │           │
            ┌───▼────┐  ┌───▼────┐      │
            │Reduce 1│  │Reduce 2│      │         ← Reduce Phase
            └───┬────┘  └───┬────┘      │
                │           │           │
                └─────┬─────┘           │
                      │                 │
                ┌─────▼─────┐           │
                │HDFS Output│           │         ← Final Output
                └───────────┘
```

**Implementation approach — two options (recommend Option A):**

#### Option A: Custom SVG + ComponentCard layout (Recommended)

Build the layout using the existing `ComponentCard` components arranged in rows with custom SVG arrows for the fan-out/fan-in pattern. This matches how the Lambda, Blockchain, and Star schema layouts are built.

**Row structure:**
- **Row 1** (center): Client card
- **Row 2** (center): ResourceManager card + NameNode card (side by side with bidirectional arrow)
- **Row 3** (fan-out, 3 columns): Three Input Split mini-cards
- **Row 4** (fan-out, 3 columns): Three Map mini-cards (with animated processing indicators)
- **Row 5** (center): Shuffle & Sort card (wide, spanning the fan-out width)
- **Row 6** (fan-in, 2 columns): Two Reduce cards
- **Row 7** (center): HDFS Output card

**Custom arrow components needed:**
- `FanOutArrow`: One-to-many downward arrows (1 source → 3 targets)
- `FanInArrow`: Many-to-one downward arrows (3 sources → 1 target, or 2 → 1)
- `VerticalConnectionArrow`: Already exists, reuse for single vertical connections
- Animated data flow dots on all arrows (reuse existing `showDataFlow` pattern)

**New visual elements for the MapReduce layout specifically:**
- **Mini server icons** on the Map row showing parallel execution (small server/rack visuals inside or beside each Map card)
- **Animated data particles** during shuffle phase — key-value pairs visually moving from mappers to reducers in a cross-pattern
- **Key-value labels**: Small floating `(k, v)` labels on the arrows between Map → Shuffle to visually show the intermediate data concept
- **Phase labels**: Vertical or horizontal phase labels ("MAP PHASE", "SHUFFLE & SORT", "REDUCE PHASE") along the left side

#### Option B: ReactFlow (dagre) based layout

Use ReactFlow with dagre auto-layout (already available in the project — used for the decision tree). Nodes would be custom ReactFlow nodes matching the ComponentCard style. This gives pan/zoom and auto-layout but may feel disconnected from the other architecture sections that use pure CSS/SVG layouts.

**Recommendation: Option A** — maintains visual consistency with the rest of the site.

### 2.4 Interactive Animation Flow

Building on the user's request for seeing "servers, data queries going to them, how the query is split, then the task is split and organised":

**Step-by-step animated flow** (controlled by a stepper/play button):

| Step | What Happens | Visual |
|------|-------------|--------|
| 1. Submit | Client sends job to ResourceManager | Arrow animates from Client → ResourceManager, job config appears |
| 2. Locate | ResourceManager queries NameNode for block locations | Arrow animates ResourceManager → NameNode, block location data appears |
| 3. Split | Input data split into chunks assigned to servers | Fan-out arrows animate, split cards light up sequentially |
| 4. Map | Parallel map() execution on each split | All 3 Map cards pulse simultaneously, intermediate KV pairs appear |
| 5. Shuffle | Intermediate data redistributed by key | Cross-pattern animated arrows from Maps → Shuffle card, KV labels move |
| 6. Sort | Data sorted by key within each partition | Shuffle card shows sorting animation (bars reordering) |
| 7. Reduce | Reduce function aggregates values per key | Fan-in arrows animate, Reduce cards pulse |
| 8. Output | Final results written to HDFS | Arrow animates from Reduce → HDFS Output |

**Implementation**:
- Add a `mapReduceStep` state (0 = show all, 1-8 = highlight specific step)
- A "Play" button auto-advances steps with a timer
- Step indicator bar at the top of the diagram showing current phase
- Cards and arrows not in the current step are dimmed (opacity: 0.3)
- Active step components have glow effect and pulse animation
- A "Show All" button resets to full view

### 2.5 Word Count Example Overlay

Add an optional "Show Example" toggle that overlays a concrete word count example on the diagram:

```
Input: "hello world hello"   →   Split 1: "hello world"  |  Split 2: "hello"
                                       ↓                        ↓
                              Map: (hello,1)(world,1)  |  Map: (hello,1)
                                       ↓ SHUFFLE ↓
                              Reduce: hello → [1,1,1] → (hello, 3)
                                      world → [1]     → (world, 1)
```

This shows real data flowing through each stage as small labels on the arrows/cards.

### 2.6 New Shape Types and Colors

Add new shape/icon entries if needed:

```javascript
// New shapes to add to iconComponents and colorScheme:
split: Cpu,        // or use existing 'cluster' - for input splits (fan-out)
shuffle: GitMerge, // for shuffle & sort phase
```

Or reuse existing shapes — the current set covers the needs:
- `cloud` → Client
- `api` → ResourceManager
- `database` → NameNode
- `log` → Input Splits
- `cluster` → Map Phase
- `pipeline` → Shuffle & Sort
- `stream` → Reduce Phase
- `warehouse` → HDFS Output

### 2.7 Responsive Scaling

Add `mapreduce` to the `MIN_WIDTHS` map in `useResponsiveScale`:

```javascript
const MIN_WIDTHS = {
  lambda: 852,
  blockchain: 1340,
  kappa: 1080,
  streaming: 1080,
  batch: 1340,
  star: 960,
  snowflake: 1100,
  mapreduce: 1080  // NEW
};
```

### 2.8 Navigation Changes

Update the top nav to include MapReduce in the Processing Architectures group:

```javascript
// Change from:
{['lambda', 'kappa', 'streaming', 'batch'].map(key => {
// Change to:
{['lambda', 'kappa', 'streaming', 'batch', 'mapreduce'].map(key => {
  const icons = { lambda: 'L', kappa: 'K', streaming: 'S', batch: 'B', mapreduce: 'MR' };
```

### 2.9 Layout Dispatch

Update the layout rendering conditional:

```javascript
{currentArch.layout === 'lambda' ? renderLambdaLayout() :
 currentArch.layout === 'blockchain' ? renderBlockchainLayout() :
 currentArch.layout === 'star' ? renderStarLayout() :
 currentArch.layout === 'snowflake' ? renderSnowflakeLayout() :
 currentArch.layout === 'mapreduce' ? renderMapReduceLayout() :
 renderLinearLayout()}
```

---

## 3. Implementation Steps

### Step 1: Add MapReduce architecture data
- Add `mapreduce` entry to the `architectures` object with all content (description, overview, scenario, components, connections, useCases, advantages, challenges, learningResources)
- Add `mapReduceStep` state for the step-by-step animation
- Add `mapreduce` to `MIN_WIDTHS` in `useResponsiveScale`

### Step 2: Update navigation
- Add `'mapreduce'` to the Processing Architectures nav button group
- Add `mapreduce: 'MR'` to the icons map

### Step 3: Build custom arrow components
- `FanOutArrow` — SVG component for 1-to-3 downward fan-out with animated dots
- `FanInArrow` — SVG component for 3-to-1 or 2-to-1 downward fan-in with animated dots
- `BidirectionalArrow` — for ResourceManager ↔ NameNode connection
- Phase label component for side annotations

### Step 4: Build `renderMapReduceLayout()`
- Implement the fan-out/fan-in layout using flexbox rows
- Row 1: Client (centered)
- Row 2: ResourceManager + NameNode (centered pair)
- Row 3: 3x Input Splits (fan-out from ResourceManager)
- Row 4: 3x Map tasks (1:1 below splits)
- Row 5: Shuffle & Sort (wide card, centered)
- Row 6: 2x Reduce tasks (fan-in from shuffle)
- Row 7: HDFS Output (centered)
- Phase labels along left side

### Step 5: Add step-by-step animation controls
- Step indicator bar at top of diagram
- Play/Pause button for auto-advance
- Step forward/back buttons
- Dimming logic for non-active components
- Glow/pulse effects for active step

### Step 6: Add word count example overlay
- Toggle button "Show Example Data"
- Small floating labels showing concrete data at each stage
- Labels animate in sync with the step-by-step flow

### Step 7: Update layout dispatch
- Add `mapreduce` case to the layout rendering conditional in the main JSX

### Step 8: Test and polish
- Verify responsive scaling
- Test all interactive elements
- Verify the component detail modal works for all MapReduce components
- Ensure data flow animation toggle works
- Run build (`vite build`) to confirm no errors

---

## 4. Files Modified

| File | Changes |
|------|---------|
| `src/App.jsx` | All changes — new architecture data, new state, new arrow components, new layout renderer, nav update, layout dispatch update |

No new files needed — the project is a single-file app.

## 5. Dependencies

No new npm dependencies required. Everything is built with:
- React (useState, useEffect, useMemo)
- lucide-react icons (existing)
- Inline SVG for custom arrows
- CSS animations (existing keyframes + new ones for shuffle/fan effects)
