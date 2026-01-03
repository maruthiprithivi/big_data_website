import React, { useState } from 'react';
import {
  Database, Inbox, Cpu, Activity, HardDrive, Zap,
  Globe, Cloud, GitMerge, LayoutDashboard, ScrollText,
  ChevronRight, Check, Sparkles, Info
} from 'lucide-react';

const BigDataArchitectureExplorer = () => {
  const [activeArchitecture, setActiveArchitecture] = useState('lambda');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showDataFlow, setShowDataFlow] = useState(true);

  const iconComponents = {
    database: Database,
    queue: Inbox,
    cluster: Cpu,
    stream: Activity,
    warehouse: HardDrive,
    cache: Zap,
    api: Globe,
    cloud: Cloud,
    pipeline: GitMerge,
    dashboard: LayoutDashboard,
    log: ScrollText
  };

  const colorScheme = {
    database: { bg: 'rgba(59, 130, 246, 0.15)', border: '#60a5fa', icon: '#60a5fa', label: '#1e3a5f' },
    queue: { bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6', icon: '#8b5cf6', label: '#3b1f5e' },
    cluster: { bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899', icon: '#ec4899', label: '#5c1f4a' },
    stream: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', icon: '#f59e0b', label: '#5c3d1f' },
    warehouse: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', icon: '#10b981', label: '#1f4a3d' },
    cache: { bg: 'rgba(6, 182, 212, 0.15)', border: '#06b6d4', icon: '#06b6d4', label: '#1f4a5c' },
    api: { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', icon: '#a855f7', label: '#3d1f5c' },
    cloud: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', icon: '#3b82f6', label: '#1f2f5c' },
    pipeline: { bg: 'rgba(124, 58, 237, 0.15)', border: '#7c3aed', icon: '#7c3aed', label: '#2f1f5c' },
    dashboard: { bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899', icon: '#ec4899', label: '#5c1f4a' },
    log: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', icon: '#3b82f6', label: '#1f2f5c' }
  };

  const architectures = {
    lambda: {
      name: 'Lambda Architecture',
      tagline: 'Hybrid Batch + Stream Processing',
      description: 'Lambda Architecture decomposes the problem into three layers: batch layer for accuracy, speed layer for low latency, and serving layer for queries.',
      layout: 'lambda',
      overview: {
        text: 'Lambda Architecture decomposes the problem into three layers: batch layer for accuracy, speed layer for low latency, and serving layer for queries.',
        scenario: 'E-Commerce Platform - Amazon-Scale',
        scenarioDescription: 'A global e-commerce platform processes millions of customer interactions daily. User clickstreams, product views, purchases, and reviews flow continuously through data sources. The batch layer recalculates personalized product recommendations overnight using complete purchase history, while the speed layer updates trending products in real-time. The serving layer merges both views to show accurate historical trends alongside live flash sale metrics on customer dashboards.',
        components: [
          { name: 'Data Sources', metric: 'Customer clicks, purchases, reviews from web and mobile apps' },
          { name: 'Message Queue', metric: 'Kafka buffering millions of events during peak shopping hours' },
          { name: 'Batch Processing', metric: 'Nightly Spark jobs recalculating customer lifetime value and recommendations' },
          { name: 'Stream Processing', metric: 'Real-time fraud detection and trending product calculations' },
          { name: 'Data Warehouse', metric: 'Historical purchase patterns and product performance metrics' },
          { name: 'In-Memory Cache', metric: 'Hot product inventory and flash sale counters' },
          { name: 'API Gateway', metric: 'Serving personalized homepages and recommendation widgets' }
        ]
      },
      useCases: [
        'Real-time analytics dashboards',
        'Fraud detection systems',
        'Recommendation engines',
        'Social media feeds'
      ],
      advantages: [
        'Fault-tolerant through recomputation',
        'Handles both real-time and batch workloads',
        'Supports complex event processing',
        'Scalable architecture pattern'
      ],
      challenges: [
        'Complex to maintain two separate code paths',
        'Data synchronization between batch and speed layers',
        'Higher operational overhead',
        'Potential data inconsistencies during merging'
      ],
      learningResources: [
        { title: 'Designing Data-Intensive Applications by Martin Kleppmann', url: 'https://dataintensive.net/' },
        { title: 'Big Data: Principles and Best Practices by Nathan Marz', url: 'https://www.manning.com/books/big-data' },
        { title: 'Questioning the Lambda Architecture by Jay Kreps', url: 'https://www.oreilly.com/radar/questioning-the-lambda-architecture/' }
      ],
      components: [
        { id: 'source', name: 'Data Sources', shape: 'database', description: 'Multiple database sources', details: 'Operational databases, data lakes, and external APIs generating continuous data streams.', technologies: ['PostgreSQL', 'MongoDB', 'S3', 'APIs'] },
        { id: 'ingestion', name: 'Message Queue', shape: 'queue', description: 'Distributed message broker', details: 'Durable event log with partitioning, ordering, and replay capabilities.', technologies: ['Kafka', 'Kinesis', 'Pulsar'] },
        { id: 'batch', name: 'Batch Layer', shape: 'cluster', description: 'Batch compute cluster', details: 'Distributed processing of complete historical datasets with MapReduce.', technologies: ['Spark', 'Hadoop', 'EMR'] },
        { id: 'batch-storage', name: 'Batch Views', shape: 'warehouse', description: 'Data warehouse', details: 'Columnar OLAP database for analytical queries.', technologies: ['Snowflake', 'BigQuery', 'ClickHouse'] },
        { id: 'speed', name: 'Speed Layer', shape: 'stream', description: 'Stream processor', details: 'Real-time stateful processing with windowing and aggregations.', technologies: ['Flink', 'Storm', 'Kafka Streams'] },
        { id: 'speed-storage', name: 'Real-time Views', shape: 'cache', description: 'In-memory cache', details: 'Low-latency key-value store for hot data.', technologies: ['Redis', 'Memcached'] },
        { id: 'serving', name: 'Serving Layer', shape: 'api', description: 'Query interface', details: 'Unified API merging batch and real-time views.', technologies: ['Druid', 'GraphQL', 'REST'] }
      ],
      connections: [
        { from: 'source', to: 'ingestion', type: 'stream' },
        { from: 'ingestion', to: 'batch', type: 'batch' },
        { from: 'ingestion', to: 'speed', type: 'stream' },
        { from: 'batch', to: 'batch-storage', type: 'batch' },
        { from: 'speed', to: 'speed-storage', type: 'stream' },
        { from: 'batch-storage', to: 'serving', type: 'query' },
        { from: 'speed-storage', to: 'serving', type: 'query' }
      ]
    },
    kappa: {
      name: 'Kappa Architecture',
      tagline: 'Stream-First Simplicity',
      description: 'Kappa Architecture simplifies Lambda by using only a stream processing layer with a replayable event log.',
      layout: 'linear',
      overview: {
        text: 'Kappa Architecture simplifies Lambda by using only a stream processing layer with a replayable event log, eliminating the batch layer complexity.',
        scenario: 'IoT Smart City Platform',
        scenarioDescription: 'A smart city platform collects sensor data from traffic lights, air quality monitors, and public transit vehicles. All events are stored in an infinite event log (Kafka) allowing the system to replay historical data when deploying new analytics algorithms. Stream processors continuously calculate traffic congestion patterns, pollution levels, and transit delays. Materialized views maintain pre-computed metrics that power real-time dashboards for city planners and public mobile apps.',
        components: [
          { name: 'Event Log', metric: 'Infinite Kafka topics storing years of sensor readings for replay and reprocessing' },
          { name: 'Stream Application', metric: 'Flink jobs processing GPS coordinates, temperature, and traffic flow data' },
          { name: 'Materialized Views', metric: 'Live dashboards showing current congestion, air quality index, and transit status' },
          { name: 'Query API', metric: 'REST endpoints serving city planners and citizen mobile applications' }
        ]
      },
      useCases: [
        'Event-driven microservices',
        'Real-time data pipelines',
        'Stream analytics platforms',
        'IoT data processing'
      ],
      advantages: [
        'Simpler architecture with single processing path',
        'Replayable event log for reprocessing',
        'Lower operational complexity',
        'True streaming-first approach'
      ],
      challenges: [
        'Requires infinite event log retention',
        'Reprocessing can be time-consuming',
        'Limited support for complex batch analytics',
        'State management complexity'
      ],
      learningResources: [
        { title: 'Kafka: The Definitive Guide, 2nd Edition', url: 'https://www.oreilly.com/library/view/kafka-the-definitive/9781492043072/' },
        { title: 'Streaming Systems by Tyler Akidau', url: 'https://www.oreilly.com/library/view/streaming-systems/9781491983867/' },
        { title: 'Questioning the Lambda Architecture by Jay Kreps', url: 'https://www.oreilly.com/radar/questioning-the-lambda-architecture/' }
      ],
      components: [
        { id: 'event-log', name: 'Event Log', shape: 'log', description: 'Immutable log', details: 'Append-only event log with infinite retention.', technologies: ['Kafka', 'Pulsar'] },
        { id: 'stream-app', name: 'Stream Application', shape: 'stream', description: 'Unified processor', details: 'Single processing layer for all time ranges.', technologies: ['Flink', 'ksqlDB'] },
        { id: 'materialized', name: 'Materialized Views', shape: 'warehouse', description: 'Live query results', details: 'Continuously updated precomputed views.', technologies: ['Materialize', 'RisingWave'] },
        { id: 'api', name: 'Query API', shape: 'api', description: 'Serving layer', details: 'Real-time query interface.', technologies: ['GraphQL', 'REST'] }
      ],
      connections: [
        { from: 'event-log', to: 'stream-app', type: 'stream' },
        { from: 'stream-app', to: 'materialized', type: 'stream' },
        { from: 'materialized', to: 'api', type: 'query' }
      ]
    },
    streaming: {
      name: 'Streaming Architecture',
      tagline: 'Pure Real-Time Processing',
      description: 'Event-driven architecture for continuous low-latency processing with stream-first approach.',
      layout: 'linear',
      overview: {
        text: 'Pure streaming architecture for real-time event processing with continuous data flows and minimal latency.',
        scenario: 'Ride-Sharing Platform - Uber/Lyft',
        scenarioDescription: 'A ride-sharing platform requires sub-second latency for matching riders with drivers. Mobile apps continuously emit location updates, ride requests, and driver availability events. Stream processors calculate real-time surge pricing based on supply-demand ratios, estimate arrival times using current traffic conditions, and detect anomalies like GPS spoofing. Results flow directly to live rider and driver apps with minimal delay, while operational metrics stream to monitoring dashboards.',
        components: [
          { name: 'Event Producers', metric: 'Mobile apps emitting GPS pings, ride requests, and trip status updates' },
          { name: 'Stream Broker', metric: 'Kafka handling location streams from millions of active drivers and riders' },
          { name: 'Stream Processor', metric: 'Kafka Streams calculating surge zones, ETAs, and driver-rider matching' },
          { name: 'Data Sinks', metric: 'Real-time updates pushed to mobile apps and operations dashboards via WebSockets' }
        ]
      },
      useCases: [
        'Real-time monitoring systems',
        'Live dashboards and metrics',
        'Anomaly detection',
        'Log aggregation and analysis'
      ],
      advantages: [
        'Minimal latency for data processing',
        'Simplified architecture',
        'Easy to scale horizontally',
        'Native support for event time processing'
      ],
      challenges: [
        'Limited historical data analysis',
        'State management complexity',
        'Requires careful backpressure handling',
        'Testing and debugging difficulty'
      ],
      learningResources: [
        { title: 'Stream Processing with Apache Flink', url: 'https://www.oreilly.com/library/view/stream-processing-with/9781491974285/' },
        { title: 'Kafka Streams in Action, 2nd Edition', url: 'https://www.manning.com/books/kafka-streams-in-action-second-edition' },
        { title: 'Designing Event-Driven Systems by Ben Stopford', url: 'https://www.confluent.io/resources/ebook/designing-event-driven-systems/' }
      ],
      components: [
        { id: 'producers', name: 'Event Producers', shape: 'database', description: 'Event sources', details: 'Microservices and IoT devices emitting events.', technologies: ['Microservices', 'IoT', 'APIs'] },
        { id: 'broker', name: 'Stream Broker', shape: 'queue', description: 'Event backbone', details: 'Distributed log for event streaming.', technologies: ['Kafka', 'Pulsar'] },
        { id: 'processor', name: 'Stream Processor', shape: 'stream', description: 'Real-time compute', details: 'Stateful stream processing with windowing.', technologies: ['Flink', 'Kafka Streams'] },
        { id: 'sink', name: 'Data Sinks', shape: 'warehouse', description: 'Output targets', details: 'Materialized streaming results.', technologies: ['ClickHouse', 'S3'] }
      ],
      connections: [
        { from: 'producers', to: 'broker', type: 'stream' },
        { from: 'broker', to: 'processor', type: 'stream' },
        { from: 'processor', to: 'sink', type: 'stream' }
      ]
    },
    batch: {
      name: 'Batch Architecture',
      tagline: 'Traditional ETL Processing',
      description: 'Scheduled batch processing for data warehousing with periodic ETL jobs and analytical workloads.',
      layout: 'linear',
      overview: {
        text: 'Traditional batch processing architecture with scheduled ETL workflows for data warehousing and business intelligence.',
        scenario: 'Retail Chain Analytics - Walmart/Target',
        scenarioDescription: 'A national retail chain with thousands of stores runs nightly batch processes to consolidate sales data. Point-of-sale systems upload daily transaction logs to a central data lake. Overnight ETL pipelines clean, transform, and aggregate data - calculating store performance metrics, regional sales trends, and inventory turnover rates. The data warehouse powers morning executive dashboards and enables business analysts to create custom reports for merchandising decisions and quarterly forecasting.',
        components: [
          { name: 'Source Systems', metric: 'Nightly extracts from thousands of store POS systems and inventory databases' },
          { name: 'Data Lake', metric: 'Raw transaction logs, product catalogs, and customer loyalty program data' },
          { name: 'ETL Pipeline', metric: 'Airflow DAGs running hourly/daily to transform and aggregate sales metrics' },
          { name: 'Data Warehouse', metric: 'Snowflake storing historical sales, products, and customer dimensions' },
          { name: 'BI Tools', metric: 'Tableau dashboards for executives, managers, and business analysts' }
        ]
      },
      useCases: [
        'Business intelligence and reporting',
        'Data warehouse consolidation',
        'Historical trend analysis',
        'Regulatory compliance reporting'
      ],
      advantages: [
        'Well-established patterns and tools',
        'Excellent for complex transformations',
        'Optimized for analytical queries',
        'Strong consistency guarantees'
      ],
      challenges: [
        'High latency for fresh data',
        'Resource-intensive batch jobs',
        'Scheduling complexity',
        'Limited real-time capabilities'
      ],
      learningResources: [
        { title: 'The Data Warehouse Toolkit, 3rd Edition by Ralph Kimball', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/' },
        { title: 'Building a Scalable Data Warehouse with Data Vault 2.0', url: 'https://www.oreilly.com/library/view/building-a-scalable/9780128026489/' },
        { title: 'Fundamentals of Data Engineering by Joe Reis & Matt Housley', url: 'https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/' }
      ],
      components: [
        { id: 'sources', name: 'Source Systems', shape: 'database', description: 'OLTP databases', details: 'Operational databases and business systems.', technologies: ['PostgreSQL', 'MySQL', 'Oracle'] },
        { id: 'data-lake', name: 'Data Lake', shape: 'cloud', description: 'Raw data storage', details: 'Object storage for unstructured data.', technologies: ['S3', 'ADLS', 'GCS'] },
        { id: 'etl', name: 'ETL Pipeline', shape: 'pipeline', description: 'Transformation layer', details: 'Extract, transform, and load workflows.', technologies: ['Airflow', 'dbt', 'Glue'] },
        { id: 'warehouse', name: 'Data Warehouse', shape: 'warehouse', description: 'OLAP storage', details: 'Structured analytical database.', technologies: ['Snowflake', 'Redshift'] },
        { id: 'bi', name: 'BI Tools', shape: 'dashboard', description: 'Analytics layer', details: 'Dashboards and reporting tools.', technologies: ['Tableau', 'Power BI', 'Looker'] }
      ],
      connections: [
        { from: 'sources', to: 'data-lake', type: 'batch' },
        { from: 'data-lake', to: 'etl', type: 'batch' },
        { from: 'etl', to: 'warehouse', type: 'batch' },
        { from: 'warehouse', to: 'bi', type: 'query' }
      ]
    }
  };

  const connectionColors = {
    stream: '#f59e0b',
    batch: '#ec4899',
    query: '#10b981'
  };

  const currentArch = architectures[activeArchitecture];

  const ComponentCard = ({ component, onClick }) => {
    const colors = colorScheme[component.shape] || colorScheme.database;
    const Icon = iconComponents[component.shape];

    return (
      <div
        onClick={() => onClick(component)}
        style={{
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          borderRadius: '16px',
          padding: '20px',
          minWidth: '180px',
          maxWidth: '180px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          boxShadow: `0 0 20px ${colors.border}33`
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${colors.border}22`,
            border: `1px solid ${colors.border}44`
          }}
        >
          <Icon size={44} color={colors.icon} strokeWidth={1.5} />
        </div>
        <div
          style={{
            background: colors.label,
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            textAlign: 'center',
            width: '100%',
            border: `1px solid ${colors.border}66`
          }}
        >
          {component.name}
        </div>
      </div>
    );
  };

  const ConnectionArrow = ({ type }) => {
    const color = connectionColors[type] || '#60a5fa';

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', minWidth: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color }}>
          <div style={{
            width: '60px',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${color}, ${color})`,
            position: 'relative'
          }}>
            {showDataFlow && (
              <div
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 12px ${color}`,
                  animation: 'flowRight 1.5s infinite linear',
                  top: '-4px'
                }}
              />
            )}
          </div>
          <ChevronRight size={18} />
        </div>
      </div>
    );
  };

  const VerticalConnectionArrow = ({ type, direction = 'down' }) => {
    const color = connectionColors[type] || '#60a5fa';
    const rotation = direction === 'down' ? 'rotate(90deg)' : 'rotate(-90deg)';

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0', minHeight: '80px', transform: rotation }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color }}>
          <div style={{
            width: '60px',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${color}, ${color})`,
            position: 'relative'
          }}>
            {showDataFlow && (
              <div
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 12px ${color}`,
                  animation: 'flowRight 1.5s infinite linear',
                  top: '-4px'
                }}
              />
            )}
          </div>
          <ChevronRight size={18} />
        </div>
      </div>
    );
  };

  const renderLambdaLayout = () => {
    const comps = currentArch.components;
    const source = comps.find(c => c.id === 'source');
    const ingestion = comps.find(c => c.id === 'ingestion');
    const batch = comps.find(c => c.id === 'batch');
    const speed = comps.find(c => c.id === 'speed');
    const batchStorage = comps.find(c => c.id === 'batch-storage');
    const speedStorage = comps.find(c => c.id === 'speed-storage');
    const serving = comps.find(c => c.id === 'serving');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
        {/* Top Row - Batch Layer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '180px' }}></div>
          <div style={{ width: '80px', minWidth: '80px' }}></div>
          <ComponentCard component={batch} onClick={setSelectedComponent} />
          <ConnectionArrow type="batch" />
          <ComponentCard component={batchStorage} onClick={setSelectedComponent} />
        </div>

        {/* Vertical connectors: Message Queue to Batch, Batch Views to Serving */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '180px' }}></div>
          <div style={{ width: '80px', minWidth: '80px' }}></div>
          <div style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
            <VerticalConnectionArrow type="batch" direction="up" />
          </div>
          <div style={{ width: '80px', minWidth: '80px' }}></div>
          <div style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
            <VerticalConnectionArrow type="query" direction="down" />
          </div>
        </div>

        {/* Middle Row - Source & Ingestion & Serving */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ComponentCard component={source} onClick={setSelectedComponent} />
          <ConnectionArrow type="stream" />
          <ComponentCard component={ingestion} onClick={setSelectedComponent} />
          <div style={{ width: '80px', minWidth: '80px' }}></div>
          <ComponentCard component={serving} onClick={setSelectedComponent} />
        </div>

        {/* Vertical connectors: Message Queue to Speed, Real-time Views to Serving */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '180px' }}></div>
          <div style={{ width: '80px', minWidth: '80px' }}></div>
          <div style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
            <VerticalConnectionArrow type="stream" direction="down" />
          </div>
          <div style={{ width: '80px', minWidth: '80px' }}></div>
          <div style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
            <VerticalConnectionArrow type="query" direction="up" />
          </div>
        </div>

        {/* Bottom Row - Speed Layer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '180px' }}></div>
          <div style={{ width: '80px', minWidth: '80px' }}></div>
          <ComponentCard component={speed} onClick={setSelectedComponent} />
          <ConnectionArrow type="stream" />
          <ComponentCard component={speedStorage} onClick={setSelectedComponent} />
        </div>
      </div>
    );
  };

  const renderLinearLayout = () => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
        {currentArch.components.map((comp, idx) => (
          <React.Fragment key={comp.id}>
            <ComponentCard component={comp} onClick={setSelectedComponent} />
            {idx < currentArch.components.length - 1 && (
              <ConnectionArrow type={currentArch.connections[idx]?.type || 'stream'} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#ffffff' }}>
      <style>{`
        @keyframes flowRight {
          0% { left: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: calc(100% - 10px); opacity: 0; }
        }
      `}</style>

      <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
              Big Data Architecture Explorer
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>
              Interactive 2D visualization of data engineering patterns
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {Object.keys(architectures).map(key => (
              <button
                key={key}
                onClick={() => {
                  setActiveArchitecture(key);
                  setSelectedComponent(null);
                }}
                style={{
                  padding: '12px 24px',
                  background: activeArchitecture === key
                    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                    : 'rgba(30, 41, 59, 0.6)',
                  border: activeArchitecture === key ? '2px solid #60a5fa' : '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  if (activeArchitecture !== key) {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeArchitecture !== key) {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                  }
                }}
              >
                {architectures[key].name}
              </button>
            ))}
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {currentArch.name}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
                  {currentArch.tagline}
                </p>
                <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
                  {currentArch.description}
                </p>
              </div>
              <button
                onClick={() => setShowDataFlow(!showDataFlow)}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'}
              >
                <Sparkles size={18} />
                <span>Data Flow {showDataFlow ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '12px',
              padding: '16px 24px',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                Connection Types:
              </span>
              {Object.entries(connectionColors).map(([type, color]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '3px',
                    background: color,
                    borderRadius: '2px'
                  }} />
                  <span style={{ color: '#e2e8f0', fontSize: '14px', textTransform: 'capitalize' }}>
                    {type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '12px',
              padding: '60px 40px',
              marginBottom: '24px',
              minHeight: '500px'
            }}
          >
            {currentArch.layout === 'lambda' ? renderLambdaLayout() : renderLinearLayout()}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              fontSize: '12px',
              marginTop: '48px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(71, 85, 105, 0.3)',
              justifyContent: 'center'
            }}>
              <Info size={16} />
              <span>Click on any component to view details</span>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '24px'
            }}
          >
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#60a5fa'
              }}>
                Overview
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
                {currentArch.overview.text}
              </p>

              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Sparkles size={20} color="#60a5fa" />
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#60a5fa' }}>
                    Example Scenario: {currentArch.overview.scenario}
                  </h4>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', marginBottom: '8px' }}>
                  {currentArch.overview.scenarioDescription}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>
                  Note: This is a fictional example based on patterns observed in the market to illustrate real-world applications.
                </p>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>
                Components in This Scenario
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {currentArch.overview.components.map((comp, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '12px 16px'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>
                      {comp.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
                      {comp.metric}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#a78bfa'
              }}>
                Use Cases
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentArch.useCases.map((useCase, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ChevronRight size={18} color="#a78bfa" />
                    <span style={{ color: '#cbd5e1', fontSize: '15px' }}>{useCase}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#34d399'
              }}>
                Advantages
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentArch.advantages.map((advantage, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Check size={18} color="#34d399" />
                    <span style={{ color: '#cbd5e1', fontSize: '15px' }}>{advantage}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#fbbf24'
              }}>
                Challenges
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentArch.challenges.map((challenge, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      marginTop: '4px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#fbbf24',
                      flexShrink: 0
                    }} />
                    <span style={{ color: '#cbd5e1', fontSize: '15px' }}>{challenge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#f472b6'
              }}>
                Learning Resources
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentArch.learningResources.map((resource, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      marginTop: '6px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      background: 'rgba(244, 114, 182, 0.2)',
                      border: '1px solid #f472b6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#f472b6'
                    }}>
                      {idx + 1}
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#cbd5e1',
                        fontSize: '15px',
                        textDecoration: 'none',
                        borderBottom: '1px solid #f472b644',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#f472b6';
                        e.currentTarget.style.borderBottom = '1px solid #f472b6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#cbd5e1';
                        e.currentTarget.style.borderBottom = '1px solid #f472b644';
                      }}
                    >
                      {resource.title}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedComponent && (
        <div
          onClick={() => setSelectedComponent(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '24px' }}>
              <div
                style={{
                  background: colorScheme[selectedComponent.shape]?.bg,
                  border: `2px solid ${colorScheme[selectedComponent.shape]?.border}`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {React.createElement(iconComponents[selectedComponent.shape], {
                  size: 32,
                  color: colorScheme[selectedComponent.shape]?.icon
                })}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {selectedComponent.name}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                  {selectedComponent.description}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#60a5fa', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Details
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                {selectedComponent.details}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                Technologies
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedComponent.technologies.map((tech, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '13px',
                      color: '#e2e8f0',
                      fontWeight: '500'
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedComponent(null)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BigDataArchitectureExplorer;
