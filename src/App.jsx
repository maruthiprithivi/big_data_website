import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Database, Inbox, Cpu, Activity, HardDrive, Zap,
  Globe, Cloud, GitMerge, LayoutDashboard, ScrollText,
  ChevronRight, Check, Sparkles, Info, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { ReactFlow, Background, useNodesState, useEdgesState, Handle, Position, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';

// Custom hook for responsive diagram scaling
const useResponsiveScale = (layoutType, containerRef) => {
  const [scale, setScale] = useState(1);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Define minimum widths for each layout type
    const MIN_WIDTHS = {
      lambda: 852,
      blockchain: 1340,
      kappa: 1080,
      streaming: 1080,
      batch: 1340
    };

    // Absolute minimum before showing warning
    const ABSOLUTE_MIN = 600;

    const updateScale = () => {
      const containerWidth = containerRef.current.offsetWidth;
      const minRequired = MIN_WIDTHS[layoutType] || 1080;

      if (containerWidth < ABSOLUTE_MIN) {
        setShowWarning(true);
        setScale(ABSOLUTE_MIN / minRequired);
      } else {
        setShowWarning(false);
        if (containerWidth < minRequired) {
          // Scale down to fit
          setScale(containerWidth / minRequired);
        } else {
          // No scaling needed
          setScale(1);
        }
      }
    };

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);
    updateScale(); // Initial calculation

    return () => resizeObserver.disconnect();
  }, [layoutType, containerRef]);

  return { scale, showWarning };
};

const BigDataArchitectureExplorer = () => {
  const [activeArchitecture, setActiveArchitecture] = useState('lambda');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showDataFlow, setShowDataFlow] = useState(true);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showHandsOn, setShowHandsOn] = useState(false);
  const [showBanner, setShowBanner] = useState(() => {
    const bannerDismissed = localStorage.getItem('bannerDismissed');
    return !bannerDismissed;
  });

  // Responsive diagram scaling
  const diagramContainerRef = useRef(null);
  const { scale, showWarning } = useResponsiveScale(activeArchitecture, diagramContainerRef);

  // Hands On section responsive scaling
  const handsOnDiagramRef = useRef(null);
  const { scale: handsOnScale, showWarning: handsOnShowWarning } = useResponsiveScale('blockchain', handsOnDiagramRef);

  // Technology URL mapping
  const technologyUrls = {
    'PostgreSQL': 'https://www.postgresql.org/',
    'MongoDB': 'https://www.mongodb.com/',
    'MySQL': 'https://www.mysql.com/',
    'Oracle': 'https://www.oracle.com/database/',
    'S3': 'https://aws.amazon.com/s3/',
    'ADLS': 'https://azure.microsoft.com/en-us/products/storage/data-lake-storage',
    'GCS': 'https://cloud.google.com/storage',
    'Kafka': 'https://kafka.apache.org/',
    'Kinesis': 'https://aws.amazon.com/kinesis/',
    'Pulsar': 'https://pulsar.apache.org/',
    'Spark': 'https://spark.apache.org/',
    'Hadoop': 'https://hadoop.apache.org/',
    'EMR': 'https://aws.amazon.com/emr/',
    'Snowflake': 'https://www.snowflake.com/en/',
    'BigQuery': 'https://cloud.google.com/bigquery',
    'ClickHouse': 'https://clickhouse.com/',
    'Redshift': 'https://aws.amazon.com/redshift/',
    'Flink': 'https://flink.apache.org/',
    'Storm': 'https://storm.apache.org/',
    'Kafka Streams': 'https://kafka.apache.org/documentation/streams/',
    'Redis': 'https://redis.io/',
    'Memcached': 'https://memcached.org/',
    'Druid': 'https://druid.apache.org/',
    'GraphQL': 'https://graphql.org/',
    'ksqlDB': 'https://www.confluent.io/product/ksqldb/',
    'Materialize': 'https://materialize.com/',
    'RisingWave': 'https://risingwave.com/',
    'Airflow': 'https://airflow.apache.org/',
    'dbt': 'https://www.getdbt.com/',
    'Glue': 'https://aws.amazon.com/glue/',
    'Tableau': 'https://www.tableau.com/',
    'Power BI': 'https://www.microsoft.com/en-us/power-platform/products/power-bi',
    'Looker': 'https://cloud.google.com/looker'
  };

  // Add CSS animations for the decision tree
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInSlideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Safeguard: Reset to lambda if blockchain is selected but hands-on is not showing
  useEffect(() => {
    if (activeArchitecture === 'blockchain' && !showHandsOn) {
      setActiveArchitecture('lambda');
    }
  }, [activeArchitecture, showHandsOn]);

  // Handle banner dismissal
  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('bannerDismissed', 'true');
  };

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
      difficulty: 'Advanced',
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
        { title: 'Microsoft Learn: Big Data Architectures Guide', url: 'https://learn.microsoft.com/en-us/azure/architecture/databases/guide/big-data-architectures' },
        { title: 'AWS Blog: Build Lambda Architecture for Batch and Real-time Analytics', url: 'https://aws.amazon.com/blogs/big-data/build-a-big-data-lambda-architecture-for-batch-and-real-time-analytics-using-amazon-redshift/' },
        { title: 'Confluent: Apache Flink Complete Introduction (Free Course)', url: 'https://developer.confluent.io/courses/apache-flink/intro/' }
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
      difficulty: 'Intermediate',
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
        { title: 'Medium: Free Apache Kafka Resources for Beginners 2024', url: 'https://medium.com/confluent/7-more-free-awesome-apache-kafka-resources-for-beginners-2024-6f7581e9a613' },
        { title: 'RisingWave: Hands-On Tutorial for Apache Kafka Stream Processing', url: 'https://risingwave.com/blog/hands-on-tutorial-for-apache-kafka-stream-processing/' },
        { title: 'Official Apache Flink Documentation: Learn Flink', url: 'https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/overview/' }
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
      difficulty: 'Intermediate',
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
        { title: 'Ververica: Stream Processing with Apache Flink Beginner Guide 2025', url: 'https://www.ververica.com/stream-processing-with-apache-flink-beginners-guide' },
        { title: 'DataCamp: Kafka Streams Tutorial for Real-Time Data Processing', url: 'https://www.datacamp.com/tutorial/kafka-streams-tutorial' },
        { title: 'InfoQ: Event-Driven Architecture (Free Resources)', url: 'https://www.infoq.com/eventdrivenarchitecture/' }
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
      difficulty: 'Beginner',
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
        { title: 'GitHub: Awesome Apache Spark (Curated Learning Resources)', url: 'https://github.com/awesome-spark/awesome-spark' },
        { title: 'Spark By Examples: Comprehensive Tutorials with Code', url: 'https://sparkbyexamples.com/' },
        { title: 'AWS: Batch Processing Gateway on EMR (Practical Example)', url: 'https://github.com/aws-samples/batch-processing-gateway-on-emr-on-eks' }
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
    },
    blockchain: {
      name: 'Blockchain Data Pipeline',
      difficulty: 'Intermediate',
      tagline: 'Real-Time Blockchain Analytics',
      description: 'Containerized pipeline for ingesting and analyzing blockchain data from multiple chains with real-time monitoring.',
      layout: 'blockchain',
      overview: {
        text: 'A modern data pipeline architecture for collecting, storing, and analyzing blockchain data from Bitcoin and Solana networks.',
        scenario: 'Blockchain Analytics Platform',
        scenarioDescription: 'An educational system for ingesting blockchain data from Bitcoin and Solana into ClickHouse, featuring real-time monitoring via Streamlit. External blockchain APIs continuously stream block and transaction data to a FastAPI collector service with separate Bitcoin and Solana collectors, which persist the data in a columnar ClickHouse database with dedicated tables. The Streamlit dashboard provides real-time visualization, collection controls, and SQL query capabilities for analyzing blockchain metrics, transaction patterns, and network performance.',
        components: [
          { name: 'Bitcoin API', metric: 'REST API from blockstream.info providing block and transaction data' },
          { name: 'Solana RPC', metric: 'JSON-RPC from mainnet-beta.solana.com with slot and transaction streams' },
          { name: 'Bitcoin Collector', metric: 'Dedicated collector for Bitcoin blockchain data' },
          { name: 'Solana Collector', metric: 'Dedicated collector for Solana blockchain data' },
          { name: 'FastAPI Service', metric: 'Asynchronous Python service orchestrating data collection' },
          { name: 'ClickHouse Database', metric: 'Columnar OLAP storage with optimized compression for blockchain analytics' },
          { name: 'Bitcoin Tables', metric: 'bitcoin_blocks and bitcoin_transactions tables' },
          { name: 'Solana Tables', metric: 'solana_blocks and solana_transactions tables' },
          { name: 'Streamlit Dashboard', metric: 'Interactive web UI for monitoring collection and querying blockchain metrics' },
          { name: 'Web Browser', metric: 'User interface at localhost:8501 for controlling and visualizing data' }
        ]
      },
      useCases: [
        'Blockchain data analysis and research',
        'Real-time cryptocurrency monitoring',
        'Cross-chain transaction comparison',
        'Educational blockchain data engineering'
      ],
      advantages: [
        'Multi-blockchain support (Bitcoin & Solana)',
        'Fully containerized with Docker Compose',
        'Real-time collection with safety limits',
        'Columnar storage optimized for analytics'
      ],
      challenges: [
        'Public RPC endpoint rate limits',
        'Managing high-volume blockchain data',
        'Different blockchain data models',
        'Storage requirements for historical data'
      ],
      learningResources: [
        { title: 'GitHub Repository: Blockchain Data Ingestion Lab', url: 'https://github.com/maruthiprithivi/big_data_architecture' },
        { title: 'ClickHouse: Official Documentation', url: 'https://clickhouse.com/docs' },
        { title: 'FastAPI: Modern Python API Framework', url: 'https://fastapi.tiangolo.com/' }
      ],
      components: [
        { id: 'bitcoin-api', name: 'Bitcoin API', shape: 'database', description: 'External blockchain RPC', details: 'REST API providing Bitcoin block and transaction data from blockstream.info.', technologies: ['blockstream.info', 'REST API'] },
        { id: 'solana-rpc', name: 'Solana RPC', shape: 'database', description: 'External blockchain RPC', details: 'JSON-RPC endpoint for Solana slot and transaction data from mainnet-beta.', technologies: ['Solana RPC', 'JSON-RPC'] },
        { id: 'bitcoin-collector', name: 'Bitcoin Collector', shape: 'stream', description: 'Bitcoin ingestion', details: 'Dedicated collector for Bitcoin blockchain data within FastAPI service.', technologies: ['Python', 'asyncio'] },
        { id: 'solana-collector', name: 'Solana Collector', shape: 'stream', description: 'Solana ingestion', details: 'Dedicated collector for Solana blockchain data within FastAPI service.', technologies: ['Python', 'asyncio'] },
        { id: 'fastapi', name: 'FastAPI Service', shape: 'api', description: 'Collector orchestration', details: 'Asynchronous service orchestrating Bitcoin and Solana collectors at port 8000.', technologies: ['FastAPI', 'Python', 'Docker'] },
        { id: 'clickhouse', name: 'ClickHouse DB', shape: 'warehouse', description: 'Columnar database', details: 'OLAP database with automatic schema and compression at port 8123.', technologies: ['ClickHouse', 'SQL'] },
        { id: 'bitcoin-tables', name: 'Bitcoin Tables', shape: 'log', description: 'Bitcoin data storage', details: 'Tables: bitcoin_blocks, bitcoin_transactions storing Bitcoin chain data.', technologies: ['ClickHouse Schema'] },
        { id: 'solana-tables', name: 'Solana Tables', shape: 'log', description: 'Solana data storage', details: 'Tables: solana_blocks, solana_transactions storing Solana chain data.', technologies: ['ClickHouse Schema'] },
        { id: 'dashboard', name: 'Streamlit Dashboard', shape: 'dashboard', description: 'Monitoring UI', details: 'Real-time visualization and collection control interface at port 8501.', technologies: ['Streamlit', 'Python', 'Docker'] },
        { id: 'browser', name: 'Web Browser', shape: 'cloud', description: 'User interface', details: 'Browser-based access to dashboard at localhost:8501.', technologies: ['HTTP', 'localhost:8501'] }
      ],
      connections: [
        { from: 'bitcoin-api', to: 'bitcoin-collector', type: 'stream' },
        { from: 'solana-rpc', to: 'solana-collector', type: 'stream' },
        { from: 'bitcoin-collector', to: 'clickhouse', type: 'batch' },
        { from: 'solana-collector', to: 'clickhouse', type: 'batch' },
        { from: 'clickhouse', to: 'dashboard', type: 'query' },
        { from: 'dashboard', to: 'browser', type: 'query' }
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
          minHeight: '180px',
          maxHeight: '180px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', minWidth: '80px', height: '180px' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0', minHeight: '80px', width: '180px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color, transform: rotation }}>
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
          <div style={{ width: '96px', minWidth: '96px' }}></div>
          <ComponentCard component={batch} onClick={setSelectedComponent} />
          <ConnectionArrow type="batch" />
          <ComponentCard component={batchStorage} onClick={setSelectedComponent} />
        </div>

        {/* Vertical connectors: Message Queue to Batch, Batch Views to Serving */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '180px' }}></div>
          <div style={{ width: '96px', minWidth: '96px' }}></div>
          <VerticalConnectionArrow type="batch" direction="up" />
          <div style={{ width: '96px', minWidth: '96px' }}></div>
          <VerticalConnectionArrow type="query" direction="down" />
        </div>

        {/* Middle Row - Source & Ingestion & Serving */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ComponentCard component={source} onClick={setSelectedComponent} />
          <ConnectionArrow type="stream" />
          <ComponentCard component={ingestion} onClick={setSelectedComponent} />
          <div style={{ width: '96px', minWidth: '96px' }}></div>
          <ComponentCard component={serving} onClick={setSelectedComponent} />
        </div>

        {/* Vertical connectors: Message Queue to Speed, Real-time Views to Serving */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '180px' }}></div>
          <div style={{ width: '96px', minWidth: '96px' }}></div>
          <VerticalConnectionArrow type="stream" direction="down" />
          <div style={{ width: '96px', minWidth: '96px' }}></div>
          <VerticalConnectionArrow type="query" direction="up" />
        </div>

        {/* Bottom Row - Speed Layer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '180px' }}></div>
          <div style={{ width: '96px', minWidth: '96px' }}></div>
          <ComponentCard component={speed} onClick={setSelectedComponent} />
          <ConnectionArrow type="stream" />
          <ComponentCard component={speedStorage} onClick={setSelectedComponent} />
        </div>
      </div>
    );
  };

  const renderLinearLayout = () => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', gap: '8px' }}>
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

  const LBendArrow = ({ type, direction }) => {
    const color = connectionColors[type] || '#60a5fa';
    const isCenter = direction === 'center';
    const isDown = direction === 'down';

    // Keep the arrow *center-aligned* to the source card (y=90), and end at the ClickHouse-aligned bend height.
    // Two bends total: right -> up/down -> right.
    //
    // We "nudge" the arrow end slightly into the ClickHouse rounded corner so it visually touches the border,
    // without obviously overshooting into the card.
    const SVG_W = 360;
    const SVG_H = 180;
    const CHEVRON_SIZE = 18; // match ConnectionArrow chevron size
    const CHEVRON_GAP = 1; // tighter line -> chevron spacing
    const TARGET_GAP = 1; // tighter chevron -> target spacing (still no overlap)
    const CHEVRON_Y_OFFSET = 0; // prefer true center alignment; baseline issues handled via display:block

    const startY = 90;
    const bendX = 70;
    // For the merged single-arrow variant, we go straight into ClickHouse center (y=90).
    // Otherwise we offset up/down around the center.
    const TARGET_CENTER_OFFSET = 15;
    const bendY = isCenter ? startY : startY + (isDown ? TARGET_CENTER_OFFSET : -TARGET_CENTER_OFFSET);
    // Make the chevron tip stop short of the target by TARGET_GAP, same visual as ConnectionArrow.
    const chevronLeft = SVG_W - TARGET_GAP - CHEVRON_SIZE;
    const endX = chevronLeft - CHEVRON_GAP;

    // If merged: single straight line at center. Otherwise: two bends only (right -> up/down -> right).
    const pathD = isCenter
      ? `M 0 ${startY} L ${endX} ${startY}`
      : `M 0 ${startY} L ${bendX} ${startY} L ${bendX} ${bendY} L ${endX} ${bendY}`;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0',
        minWidth: `${SVG_W}px`,
        height: `${SVG_H}px`,
        position: 'relative',
        marginRight: '0px',
        overflow: 'visible'
      }}>
        <svg width={SVG_W} height={SVG_H} style={{ overflow: 'hidden' }}>
          {/* Main L-shaped path */}
          <path
            d={pathD}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Animated dataflow dots */}
          {showDataFlow && (
            <>
              <circle r="5" fill={color} filter={`drop-shadow(0 0 6px ${color})`}>
                <animateMotion dur="1.5s" repeatCount="indefinite">
                  <mpath href={`#lbend-path-${type}-${direction}`} />
                </animateMotion>
              </circle>
            </>
          )}

          {/* Hidden path for animation reference */}
          <path id={`lbend-path-${type}-${direction}`} d={pathD} stroke="none" fill="none" />
        </svg>

        {/* Use the SAME chevron icon as `ConnectionArrow` (reference chevron style). */}
        <div
          style={{
            position: 'absolute',
            left: `${chevronLeft}px`,
            top: `${bendY + CHEVRON_Y_OFFSET}px`,
            transform: 'translateY(-50%)',
            color,
            pointerEvents: 'none'
          }}
        >
          <ChevronRight size={CHEVRON_SIZE} strokeWidth={2} style={{ display: 'block' }} />
        </div>
      </div>
    );
  };

  // Two sources -> one target: draw two lines from the two collector centers,
  // merge them, then continue as a single centered line into ClickHouse.
  const MergeToCenterArrow = ({ type }) => {
    const color = connectionColors[type] || '#60a5fa';

    // This arrow column sits between the stacked collectors (180 + 100 + 180 = 460).
    const SVG_W = 120;
    const SVG_H = 460;
    const STROKE_W = 2;

    const CHEVRON_SIZE = 18;
    const CHEVRON_GAP = 1;
    const TARGET_GAP = 1;

    // Collector centers inside this 460px column.
    const TOP_Y = 90; // first card center
    const BOTTOM_Y = 370; // second card center (180 + 100 + 90)
    const MERGE_Y = 230; // column vertical center (align to ClickHouse center)

    const MERGE_X = 70;
    const chevronLeft = SVG_W - TARGET_GAP - CHEVRON_SIZE;
    const endX = chevronLeft - CHEVRON_GAP;

    const topPath = `M 0 ${TOP_Y} L ${MERGE_X} ${TOP_Y} L ${MERGE_X} ${MERGE_Y}`;
    const bottomPath = `M 0 ${BOTTOM_Y} L ${MERGE_X} ${BOTTOM_Y} L ${MERGE_X} ${MERGE_Y}`;
    const mainPath = `M ${MERGE_X} ${MERGE_Y} L ${endX} ${MERGE_Y}`;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0',
          minWidth: `${SVG_W}px`,
          height: `${SVG_H}px`,
          position: 'relative',
          overflow: 'visible'
        }}
      >
        <svg width={SVG_W} height={SVG_H} style={{ overflow: 'hidden' }}>
          <defs>
            {/* Hidden paths for animation motion */}
            <path id={`merge-top-path-${type}`} d={topPath} stroke="none" fill="none" />
            <path id={`merge-bottom-path-${type}`} d={bottomPath} stroke="none" fill="none" />
            <path id={`merge-main-path-${type}`} d={mainPath} stroke="none" fill="none" />
          </defs>

          {/* Branches from both sources */}
          <path
            d={topPath}
            stroke={color}
            strokeWidth={STROKE_W}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={bottomPath}
            stroke={color}
            strokeWidth={STROKE_W}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Merged single line to ClickHouse center */}
          <path
            d={mainPath}
            stroke={color}
            strokeWidth={STROKE_W}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Animated dataflow dots (match other arrows) */}
          {showDataFlow && (
            <>
              {/* Top branch dot */}
              <circle r="5" fill={color} filter={`drop-shadow(0 0 6px ${color})`}>
                <animateMotion dur="1.5s" repeatCount="indefinite">
                  <mpath href={`#merge-top-path-${type}`} />
                </animateMotion>
              </circle>

              {/* Bottom branch dot */}
              <circle r="5" fill={color} filter={`drop-shadow(0 0 6px ${color})`}>
                <animateMotion dur="1.5s" repeatCount="indefinite">
                  <mpath href={`#merge-bottom-path-${type}`} />
                </animateMotion>
              </circle>

              {/* Merged line dot (slight delay so it feels like it continues after merge) */}
              <circle r="5" fill={color} filter={`drop-shadow(0 0 6px ${color})`}>
                <animateMotion begin="0.6s" dur="1.5s" repeatCount="indefinite">
                  <mpath href={`#merge-main-path-${type}`} />
                </animateMotion>
              </circle>
            </>
          )}

          {/* Visual merge node */}
          <circle cx={MERGE_X} cy={MERGE_Y} r="3" fill={color} />

          {/* Chevron at the target end (same style as ConnectionArrow) */}
          <g
            transform={`translate(${chevronLeft}, ${MERGE_Y})`}
            style={{ color }}
          >
            <g transform="translate(0, -9)">
              <ChevronRight size={CHEVRON_SIZE} strokeWidth={2} style={{ display: 'block' }} />
            </g>
          </g>
        </svg>
      </div>
    );
  };

  const renderBlockchainLayout = () => {
    const bitcoinApi = currentArch.components.find(c => c.id === 'bitcoin-api');
    const solanaRpc = currentArch.components.find(c => c.id === 'solana-rpc');
    const bitcoinCollector = currentArch.components.find(c => c.id === 'bitcoin-collector');
    const solanaCollector = currentArch.components.find(c => c.id === 'solana-collector');
    const clickhouse = currentArch.components.find(c => c.id === 'clickhouse');
    const dashboard = currentArch.components.find(c => c.id === 'dashboard');
    const browser = currentArch.components.find(c => c.id === 'browser');

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0px', padding: '40px' }}>
        {/* Column 1: External APIs stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
          <ComponentCard component={bitcoinApi} onClick={setSelectedComponent} />
          <ComponentCard component={solanaRpc} onClick={setSelectedComponent} />
        </div>

        {/* Arrows from APIs to Collectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
          <ConnectionArrow type="stream" />
          <ConnectionArrow type="stream" />
        </div>

        {/* Column 2: Collectors stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
          <ComponentCard component={bitcoinCollector} onClick={setSelectedComponent} />
          <ComponentCard component={solanaCollector} onClick={setSelectedComponent} />
        </div>

        {/* Two sources -> one target (merge into a single centered arrow to ClickHouse) */}
        <MergeToCenterArrow type="batch" />

        {/* Column 3: ClickHouse centered */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ComponentCard component={clickhouse} onClick={setSelectedComponent} />
        </div>

        {/* Arrow from ClickHouse to Dashboard */}
        <ConnectionArrow type="query" />

        {/* Column 4: Dashboard */}
        <ComponentCard component={dashboard} onClick={setSelectedComponent} />

        {/* Arrow from Dashboard to Browser */}
        <ConnectionArrow type="query" />

        {/* Column 5: Browser */}
        <ComponentCard component={browser} onClick={setSelectedComponent} />
      </div>
    );
  };

  // Custom Node Components for React Flow Decision Tree
  const StartNode = ({ data }) => {
    return (
      <div style={{
        padding: '18px 32px',
        background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
        border: '3px solid #a78bfa',
        borderRadius: '16px',
        color: '#ffffff',
        fontWeight: '700',
        fontSize: '15px',
        boxShadow: '0 10px 30px rgba(167, 139, 250, 0.5), 0 0 0 1px rgba(167, 139, 250, 0.2)',
        textAlign: 'center',
        width: '320px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        {data.label}
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#a78bfa', width: 12, height: 12, border: '2px solid #fff' }}
        />
      </div>
    );
  };

  const QuestionNode = ({ data }) => {
    const isExpanded = data.isExpanded;
    return (
      <div style={{
        padding: '18px 24px',
        background: isExpanded
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(37, 99, 235, 0.4) 100%)'
          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%)',
        border: `3px solid ${isExpanded ? '#60a5fa' : '#3b82f6'}`,
        borderRadius: '16px',
        color: '#ffffff',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isExpanded
          ? '0 10px 30px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.2)'
          : '0 6px 16px rgba(59, 130, 246, 0.25)',
        textAlign: 'center',
        width: '320px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#3b82f6', width: 12, height: 12, border: '2px solid #fff' }}
        />
        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        <span>{data.label}</span>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#3b82f6', width: 12, height: 12, border: '2px solid #fff' }}
        />
      </div>
    );
  };

  const ArchitectureNode = ({ data }) => {
    const colors = {
      batch: { gradient: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)', border: '#22c55e', shadow: 'rgba(34, 197, 94, 0.5)' },
      lambda: { gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: '#ef4444', shadow: 'rgba(239, 68, 68, 0.5)' },
      kappa: { gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.5)' },
      streaming: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.5)' }
    };
    const style = colors[data.architecture];

    return (
      <div style={{
        padding: '16px 24px',
        background: style.gradient,
        border: `3px solid ${style.border}`,
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 10px 30px ${style.shadow}, 0 0 0 1px ${style.shadow}`,
        textAlign: 'center',
        width: '320px',
        height: '70px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: style.border, width: 12, height: 12, border: '2px solid #fff' }}
        />
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>
          {data.label}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
          {data.subtitle}
        </div>
      </div>
    );
  };

  // Dagre layout configuration
  const getLayoutedElements = (nodes, edges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: 'TB',     // Top to Bottom
      nodesep: 250,      // Horizontal spacing between nodes at same level
      ranksep: 120,      // Vertical spacing between levels
      align: 'UL',       // Alignment
      ranker: 'tight-tree'  // Better tree layout
    });

    nodes.forEach((node) => {
      // All nodes are now uniform size
      const width = 320;
      const height = 70;
      dagreGraph.setNode(node.id, { width, height });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const width = 320;
      const height = 70;
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - width / 2,
          y: nodeWithPosition.y - height / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  };

  // Define node types
  const nodeTypes = useMemo(() => ({
    start: StartNode,
    question: QuestionNode,
    architecture: ArchitectureNode
  }), []);

  // React Flow state for decision tree
  // Note: Creating separate Lambda nodes to avoid crossing lines
  const initialNodes = [
    {
      id: 'start',
      type: 'start',
      data: { label: 'Start: What are your data requirements?' },
      position: { x: 0, y: 0 }
    },
    {
      id: 'realtimeQuestion',
      type: 'question',
      data: { label: 'Do you need real-time data processing?', isExpanded: false },
      position: { x: 0, y: 0 }
    },
    {
      id: 'batchAnalyticsQuestion',
      type: 'question',
      data: { label: 'Do you need complex analytics on large datasets?', isExpanded: false },
      position: { x: 0, y: 0 }
    },
    {
      id: 'realtimeYesQuestion',
      type: 'question',
      data: { label: 'Do you also need to analyze historical data?', isExpanded: false },
      position: { x: 0, y: 0 }
    },
    {
      id: 'reprocessingQuestion',
      type: 'question',
      data: { label: 'Do you need to reprocess/replay historical events?', isExpanded: false },
      position: { x: 0, y: 0 }
    },
    {
      id: 'batch',
      type: 'architecture',
      data: { label: 'Batch Architecture', subtitle: 'Scheduled processing', architecture: 'batch' },
      position: { x: 0, y: 0 }
    },
    {
      id: 'lambda1',
      type: 'architecture',
      data: { label: 'Lambda Architecture', subtitle: 'Batch + Stream hybrid', architecture: 'lambda' },
      position: { x: 0, y: 0 }
    },
    {
      id: 'lambda2',
      type: 'architecture',
      data: { label: 'Lambda Architecture', subtitle: 'Batch + Stream hybrid', architecture: 'lambda' },
      position: { x: 0, y: 0 }
    },
    {
      id: 'kappa',
      type: 'architecture',
      data: { label: 'Kappa Architecture', subtitle: 'Event log replay', architecture: 'kappa' },
      position: { x: 0, y: 0 }
    },
    {
      id: 'streaming',
      type: 'architecture',
      data: { label: 'Streaming Architecture', subtitle: 'Current events only', architecture: 'streaming' },
      position: { x: 0, y: 0 }
    }
  ];

  const initialEdges = [
    {
      id: 'start-realtime',
      source: 'start',
      target: 'realtimeQuestion',
      animated: true,
      style: { stroke: '#a78bfa', strokeWidth: 3 },
      type: 'step'
    }
  ];

  const allEdges = [
    {
      id: 'start-realtime',
      source: 'start',
      target: 'realtimeQuestion',
      animated: true,
      style: { stroke: '#a78bfa', strokeWidth: 3 },
      type: 'step'
    },
    {
      id: 'realtime-yes',
      source: 'realtimeQuestion',
      target: 'realtimeYesQuestion',
      label: 'Yes',
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: '#ffffff', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 }
    },
    {
      id: 'realtime-no',
      source: 'realtimeQuestion',
      target: 'batchAnalyticsQuestion',
      label: 'No',
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: '#ffffff', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 }
    },
    {
      id: 'realtimeYes-lambda1',
      source: 'realtimeYesQuestion',
      target: 'lambda1',
      label: 'Yes',
      animated: true,
      style: { stroke: '#ef4444', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: '#ffffff', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 }
    },
    {
      id: 'realtimeYes-reprocessing',
      source: 'realtimeYesQuestion',
      target: 'reprocessingQuestion',
      label: 'No',
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: '#ffffff', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 }
    },
    {
      id: 'batchAnalytics-batch',
      source: 'batchAnalyticsQuestion',
      target: 'batch',
      label: 'Yes',
      animated: true,
      style: { stroke: '#22c55e', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: '#ffffff', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 }
    },
    {
      id: 'batchAnalytics-batch2',
      source: 'batchAnalyticsQuestion',
      target: 'batch',
      label: 'No',
      animated: true,
      style: { stroke: '#22c55e', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: '#ffffff', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 }
    },
    {
      id: 'reprocessing-kappa',
      source: 'reprocessingQuestion',
      target: 'kappa',
      label: 'Yes',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: '#ffffff', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 }
    },
    {
      id: 'reprocessing-streaming',
      source: 'reprocessingQuestion',
      target: 'streaming',
      label: 'No',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: '#ffffff', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 }
    }
  ];

  // Pre-calculate layout with ALL nodes to get fixed positions
  const layoutedNodesWithPositions = useMemo(() => {
    const allLayouted = getLayoutedElements(initialNodes, allEdges);
    return allLayouted.nodes;
  }, []);

  // Initialize with only start and first question visible, but use pre-calculated positions
  const initialVisibleNodes = layoutedNodesWithPositions.filter(n => n.id === 'start' || n.id === 'realtimeQuestion');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialVisibleNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [expandedDecisionNodes, setExpandedDecisionNodes] = useState({ start: true, realtimeQuestion: false });
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onNodeClick = useCallback((event, node) => {
    if (node.type === 'architecture') {
      // Navigate to the selected architecture
      setActiveArchitecture(node.data.architecture);
      setShowAdditionalInfo(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (node.type === 'question' || node.type === 'start') {
      // Toggle expansion for question nodes
      const nodeId = node.id;
      const newExpandedState = {
        ...expandedDecisionNodes,
        [nodeId]: !expandedDecisionNodes[nodeId]
      };

      // If collapsing a node, also collapse all its descendants
      if (!newExpandedState[nodeId]) {
        if (nodeId === 'realtimeQuestion') {
          newExpandedState.realtimeYesQuestion = false;
          newExpandedState.batchAnalyticsQuestion = false;
          newExpandedState.reprocessingQuestion = false;
        } else if (nodeId === 'realtimeYesQuestion') {
          newExpandedState.reprocessingQuestion = false;
        }
      }

      setExpandedDecisionNodes(newExpandedState);

      // Determine visible nodes based on expanded state (hierarchical)
      const visibleNodeIds = new Set(['start', 'realtimeQuestion']);

      // Only show immediate children if parent is expanded
      if (newExpandedState.realtimeQuestion) {
        visibleNodeIds.add('realtimeYesQuestion');
        visibleNodeIds.add('batchAnalyticsQuestion');

        // Only show next level if parent AND this level are expanded
        if (newExpandedState.realtimeYesQuestion) {
          visibleNodeIds.add('lambda1');
          visibleNodeIds.add('reprocessingQuestion');

          // Only show deepest level if all ancestors are expanded
          if (newExpandedState.reprocessingQuestion) {
            visibleNodeIds.add('kappa');
            visibleNodeIds.add('streaming');
          }
        }

        if (newExpandedState.batchAnalyticsQuestion) {
          visibleNodeIds.add('batch');
        }
      }

      // Filter visible edges
      const visibleEdges = allEdges.filter((edge) => {
        return visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
      });

      // Get visible nodes from pre-calculated positions (no layout recalculation)
      const visibleNodes = layoutedNodesWithPositions.filter(n => visibleNodeIds.has(n.id));

      // Update nodes with expansion state
      setNodes(visibleNodes.map(n => {
        const isExpanded = newExpandedState[n.id];
        if (n.type === 'question' && isExpanded !== undefined) {
          return { ...n, data: { ...n.data, isExpanded } };
        }
        return n;
      }));

      setEdges(visibleEdges);

      // Auto-fit view after a short delay to allow layout to complete
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
        }
      }, 50);
    }
  }, [expandedDecisionNodes, setNodes, setEdges, setActiveArchitecture, setShowAdditionalInfo, reactFlowInstance]);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#ffffff' }}>
      <style>{`
        @keyframes flowRight {
          0% { left: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: calc(100% - 10px); opacity: 0; }
        }
        @keyframes flowDown {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: calc(100% - 10px); opacity: 0; }
        }
        @keyframes flowUp {
          0% { top: calc(100% - 10px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 0; opacity: 0; }
        }
      `}</style>

      <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          {showBanner && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <Info size={20} style={{ color: '#60a5fa', flexShrink: 0 }} />
                <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  <strong style={{ color: '#ffffff' }}>Work in Progress:</strong> This project is actively evolving and will be updated regularly. The content is provided as-is for educational and reference purposes. Feel free to explore and learn from the architecture patterns presented here.
                </p>
              </div>
              <button
                onClick={handleDismissBanner}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
                  e.currentTarget.style.color = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }}
                aria-label="Dismiss banner"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
              Big Data Architecture Explorer
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>
              Interactive 2D visualization of data engineering patterns
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {Object.keys(architectures).filter(key => key !== 'blockchain').map(key => (
              <button
                key={key}
                onClick={() => {
                  setActiveArchitecture(key);
                  setSelectedComponent(null);
                  setShowAdditionalInfo(false);
                  setShowHandsOn(false);
                }}
                style={{
                  padding: '12px 24px',
                  minWidth: '180px',
                  background: (activeArchitecture === key && !showAdditionalInfo && !showHandsOn)
                    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                    : 'rgba(30, 41, 59, 0.6)',
                  border: (activeArchitecture === key && !showAdditionalInfo && !showHandsOn) ? '2px solid #60a5fa' : '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  if (!(activeArchitecture === key && !showAdditionalInfo && !showHandsOn)) {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(activeArchitecture === key && !showAdditionalInfo && !showHandsOn)) {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                  }
                }}
              >
                {architectures[key].name}
              </button>
            ))}
            <button
              onClick={() => {
                setShowAdditionalInfo(!showAdditionalInfo);
                setShowHandsOn(false);
                if (!showAdditionalInfo) {
                  setTimeout(() => {
                    const additionalInfoSection = document.getElementById('additional-info');
                    if (additionalInfoSection) {
                      additionalInfoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }
              }}
              style={{
                padding: '12px 24px',
                minWidth: '180px',
                background: showAdditionalInfo
                  ? 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)'
                  : 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(124, 58, 237, 0.15) 100%)',
                border: showAdditionalInfo ? '2px solid #a78bfa' : '2px solid rgba(167, 139, 250, 0.5)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backdropFilter: 'blur(10px)',
                boxShadow: showAdditionalInfo
                  ? '0 0 20px rgba(167, 139, 250, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)'
                  : '0 0 15px rgba(167, 139, 250, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!showAdditionalInfo) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167, 139, 250, 0.3) 0%, rgba(124, 58, 237, 0.2) 100%)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(167, 139, 250, 0.4), 0 4px 10px rgba(0, 0, 0, 0.25)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showAdditionalInfo) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(124, 58, 237, 0.15) 100%)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(167, 139, 250, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)';
                }
              }}
            >
              Additional Info
            </button>
            <button
              onClick={() => {
                setShowHandsOn(!showHandsOn);
                setShowAdditionalInfo(false);
                if (!showHandsOn) {
                  setTimeout(() => {
                    const handsOnSection = document.getElementById('hands-on');
                    if (handsOnSection) {
                      handsOnSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }
              }}
              style={{
                padding: '12px 24px',
                minWidth: '180px',
                background: showHandsOn
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                border: showHandsOn ? '2px solid #10b981' : '2px solid rgba(16, 185, 129, 0.5)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backdropFilter: 'blur(10px)',
                boxShadow: showHandsOn
                  ? '0 0 20px rgba(16, 185, 129, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)'
                  : '0 0 15px rgba(16, 185, 129, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!showHandsOn) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.2) 100%)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4), 0 4px 10px rgba(0, 0, 0, 0.25)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showHandsOn) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)';
                }
              }}
            >
              Hands-on
            </button>
          </div>

          {!showAdditionalInfo && !showHandsOn && (
          <>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {currentArch.name}
                  </h2>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: currentArch.difficulty === 'Beginner' ? 'rgba(34, 197, 94, 0.2)' :
                                currentArch.difficulty === 'Intermediate' ? 'rgba(59, 130, 246, 0.2)' :
                                'rgba(239, 68, 68, 0.2)',
                    color: currentArch.difficulty === 'Beginner' ? '#22c55e' :
                           currentArch.difficulty === 'Intermediate' ? '#3b82f6' :
                           '#ef4444',
                    border: `1px solid ${currentArch.difficulty === 'Beginner' ? '#22c55e' :
                                         currentArch.difficulty === 'Intermediate' ? '#3b82f6' :
                                         '#ef4444'}`
                  }}>
                    {currentArch.difficulty}
                  </span>
                </div>
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

          {showWarning && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.15) 100%)',
                border: '2px solid rgba(245, 158, 11, 0.6)',
                borderRadius: '12px',
                padding: '16px 24px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#fbbf24',
                fontSize: '14px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Info size={20} />
              <span>
                Screen width is too small for optimal viewing.
                Please view on a larger screen or rotate your device.
              </span>
            </div>
          )}

          <div
            ref={diagramContainerRef}
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '12px',
              padding: '60px 40px',
              marginBottom: '24px',
              minHeight: '500px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.3s ease-out',
                minHeight: scale < 1 ? `${500 / scale}px` : '500px'
              }}
            >
              {currentArch.layout === 'lambda' ? renderLambdaLayout() :
               currentArch.layout === 'blockchain' ? renderBlockchainLayout() :
               renderLinearLayout()}
            </div>

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
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
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
          </>
          )}

          {showAdditionalInfo && (
            <>
              <div
                id="additional-info"
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  overflowX: 'auto'
                }}
              >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#60a5fa' }}>
              Architecture Comparison
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#94a3b8', borderBottom: '2px solid rgba(71, 85, 105, 0.5)', fontWeight: '600' }}>Feature</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#ec4899', borderBottom: '2px solid rgba(71, 85, 105, 0.5)', fontWeight: '600' }}>Lambda</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#8b5cf6', borderBottom: '2px solid rgba(71, 85, 105, 0.5)', fontWeight: '600' }}>Kappa</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#f59e0b', borderBottom: '2px solid rgba(71, 85, 105, 0.5)', fontWeight: '600' }}>Streaming</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#10b981', borderBottom: '2px solid rgba(71, 85, 105, 0.5)', fontWeight: '600' }}>Batch</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Difficulty</td>
                  <td style={{ padding: '10px 12px', color: '#ef4444', borderBottom: '1px solid rgba(71, 85, 105, 0.3)', fontWeight: '600' }}>Advanced</td>
                  <td style={{ padding: '10px 12px', color: '#3b82f6', borderBottom: '1px solid rgba(71, 85, 105, 0.3)', fontWeight: '600' }}>Intermediate</td>
                  <td style={{ padding: '10px 12px', color: '#3b82f6', borderBottom: '1px solid rgba(71, 85, 105, 0.3)', fontWeight: '600' }}>Intermediate</td>
                  <td style={{ padding: '10px 12px', color: '#22c55e', borderBottom: '1px solid rgba(71, 85, 105, 0.3)', fontWeight: '600' }}>Beginner</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Complexity</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>High</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Medium</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Low</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Low</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Real-time Support</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Yes</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Yes</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Yes</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>No</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Data Consistency</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>High</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Medium</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Medium</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>High</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Latency</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Low (speed layer)</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Low</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Very Low</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>High (hours/days)</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Processing Layers</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Batch + Speed + Serving</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Stream only</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Stream only</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Batch only</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Data Reprocessing</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Easy (batch layer)</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Possible (replay log)</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Limited</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Easy (re-run ETL)</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Operational Overhead</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>High</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Medium</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Low</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>Low</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>Best For</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>Mission-critical systems needing both accuracy and speed</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>Event-driven systems with replay requirements</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>Real-time applications with minimal latency needs</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>Reporting, analytics, and historical insights</td>
                </tr>
              </tbody>
            </table>
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
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#fbbf24'
            }}>
              Technical Glossary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h4 style={{ color: '#60a5fa', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>OLAP</h4>
                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Online Analytical Processing - Database optimized for complex queries and analytics on large datasets.</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h4 style={{ color: '#60a5fa', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>OLTP</h4>
                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Online Transaction Processing - Database optimized for high-volume transactions and data modifications.</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h4 style={{ color: '#60a5fa', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>ETL</h4>
                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Extract, Transform, Load - Process of extracting data from sources, transforming it, and loading into a data warehouse.</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h4 style={{ color: '#60a5fa', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Stateful Processing</h4>
                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Stream processing that maintains state across events, enabling windowing, aggregations, and joins.</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h4 style={{ color: '#60a5fa', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>MapReduce</h4>
                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Programming model for processing large datasets in parallel across distributed clusters.</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h4 style={{ color: '#60a5fa', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Event Log</h4>
                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Immutable, append-only sequence of events that can be replayed for reprocessing.</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h4 style={{ color: '#60a5fa', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Materialized View</h4>
                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Pre-computed query results stored for fast retrieval, continuously updated from source data.</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h4 style={{ color: '#60a5fa', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Partitioning</h4>
                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Dividing data across multiple nodes for parallel processing and scalability.</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h4 style={{ color: '#60a5fa', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Backpressure</h4>
                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Flow control mechanism to prevent overwhelming downstream systems when data arrives faster than it can be processed.</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h4 style={{ color: '#60a5fa', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Data Lake</h4>
                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Centralized repository for storing raw, unstructured data at scale in its native format.</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h4 style={{ color: '#60a5fa', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Windowing</h4>
                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Grouping stream events into finite time or count-based windows for aggregation.</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h4 style={{ color: '#60a5fa', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Columnar Storage</h4>
                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Data storage format organizing by columns rather than rows, optimized for analytics.</p>
              </div>
            </div>
          </div>

          {/* Decision Flowchart */}
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
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#a78bfa'
            }}>
              Which Architecture Should I Use?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
              Click on nodes to expand the decision tree and find the best architecture for your requirements
            </p>

            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              height: '1000px',
              width: '100%'
            }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{
                  padding: 0.2,
                  minZoom: 0.5,
                  maxZoom: 1
                }}
                minZoom={0.3}
                maxZoom={1.2}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                style={{ background: 'transparent' }}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#475569" gap={16} size={1} />
              </ReactFlow>
            </div>
          </div>
            </>
          )}

          {showHandsOn && (
            <>
              <div
                id="hands-on"
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px'
                }}
              >
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#10b981' }}>
                  Hands-on Lab: Blockchain Data Ingestion Pipeline
                </h3>

                <div style={{ marginBottom: '24px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '12px' }}>
                    Build a real-time blockchain data pipeline that demonstrates big data architecture patterns through practical implementation.
                  </p>
                </div>

                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#a78bfa' }}>
                    Understanding Blockchain Data Pipelines
                  </h4>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#cbd5e1', fontSize: '15px', marginBottom: '12px', lineHeight: '1.6' }}>
                      {architectures.blockchain.overview.text}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.6' }}>
                      {architectures.blockchain.overview.scenarioDescription}
                    </p>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#c4b5fd' }}>
                      Use Cases in Production
                    </h5>
                    <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
                      {architectures.blockchain.useCases.map((useCase, index) => (
                        <li key={index} style={{ marginBottom: '4px' }}>{useCase}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#c4b5fd' }}>
                        Advantages
                      </h5>
                      <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
                        {architectures.blockchain.advantages.map((advantage, index) => (
                          <li key={index} style={{ marginBottom: '4px' }}>{advantage}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#c4b5fd' }}>
                        Challenges
                      </h5>
                      <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
                        {architectures.blockchain.challenges.map((challenge, index) => (
                          <li key={index} style={{ marginBottom: '4px' }}>{challenge}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#c4b5fd' }}>
                      Learning Resources
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {architectures.blockchain.learningResources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#a78bfa',
                            fontSize: '14px',
                            textDecoration: 'none',
                            transition: 'color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c4b5fd'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#a78bfa'}
                        >
                          {resource.title} →
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {handsOnShowWarning && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.15) 100%)',
                      border: '2px solid rgba(245, 158, 11, 0.6)',
                      borderRadius: '12px',
                      padding: '16px 24px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#fbbf24',
                      fontSize: '14px',
                      fontWeight: '600',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    <Info size={20} />
                    <span>
                      Screen width is too small for optimal viewing.
                      Please view on a larger screen or rotate your device.
                    </span>
                  </div>
                )}

                <div
                  ref={handsOnDiagramRef}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: '12px',
                    marginBottom: '32px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', paddingTop: '24px', color: '#10b981', textAlign: 'center' }}>
                    System Architecture
                  </h4>
                  {(() => {
                    const arch = architectures.blockchain;
                    const bitcoinApi = arch.components.find(c => c.id === 'bitcoin-api');
                    const solanaRpc = arch.components.find(c => c.id === 'solana-rpc');
                    const bitcoinCollector = arch.components.find(c => c.id === 'bitcoin-collector');
                    const solanaCollector = arch.components.find(c => c.id === 'solana-collector');
                    const clickhouse = arch.components.find(c => c.id === 'clickhouse');
                    const dashboard = arch.components.find(c => c.id === 'dashboard');
                    const browser = arch.components.find(c => c.id === 'browser');

                    return (
                      <div
                        style={{
                          transform: `scale(${handsOnScale})`,
                          transformOrigin: 'top center',
                          transition: 'transform 0.3s ease-out',
                          padding: '0 20px 20px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0px' }}>
                        {/* Column 1: External APIs stacked */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
                          <ComponentCard component={bitcoinApi} onClick={(comp) => setSelectedComponent(comp)} />
                          <ComponentCard component={solanaRpc} onClick={(comp) => setSelectedComponent(comp)} />
                        </div>

                        {/* Arrows from APIs to Collectors */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
                          <ConnectionArrow type="stream" />
                          <ConnectionArrow type="stream" />
                        </div>

                        {/* Column 2: Collectors stacked */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
                          <ComponentCard component={bitcoinCollector} onClick={(comp) => setSelectedComponent(comp)} />
                          <ComponentCard component={solanaCollector} onClick={(comp) => setSelectedComponent(comp)} />
                        </div>

                        {/* Two sources -> one target (merge into a single centered arrow to ClickHouse) */}
                        <MergeToCenterArrow type="batch" />

                        {/* Column 3: ClickHouse centered */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <ComponentCard component={clickhouse} onClick={(comp) => setSelectedComponent(comp)} />
                        </div>

                        {/* Arrow from ClickHouse to Dashboard */}
                        <ConnectionArrow type="query" />

                        {/* Column 4: Dashboard */}
                        <ComponentCard component={dashboard} onClick={(comp) => setSelectedComponent(comp)} />

                        {/* Arrow from Dashboard to Browser */}
                        <ConnectionArrow type="query" />

                        {/* Column 5: Browser */}
                        <ComponentCard component={browser} onClick={(comp) => setSelectedComponent(comp)} />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#10b981' }}>
                    What You'll Learn
                  </h4>
                  <ul style={{ color: '#cbd5e1', fontSize: '14px', marginLeft: '20px', lineHeight: '1.8' }}>
                    <li>Design and implement real-time data ingestion pipelines</li>
                    <li>Work with multi-blockchain architectures (Bitcoin & Solana)</li>
                    <li>Use ClickHouse columnar database for analytical queries</li>
                    <li>Build asynchronous APIs with FastAPI</li>
                    <li>Orchestrate microservices using Docker Compose</li>
                    <li>Understand the 5Vs of Big Data through practical examples</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#60a5fa' }}>
                    The 5Vs of Big Data in This Lab
                  </h4>
                  <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#60a5fa' }}>Volume:</strong> Solana generates 20,000+ transactions per block, demonstrating massive data scale</p>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#60a5fa' }}>Velocity:</strong> Real-time collection with Solana's ~400ms block times vs Bitcoin's ~10 minutes</p>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#60a5fa' }}>Variety:</strong> Handle heterogeneous blockchain architectures (UTXO vs account-based models)</p>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#60a5fa' }}>Veracity:</strong> Data validation through blockchain consensus mechanisms</p>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#60a5fa' }}>Value:</strong> Extract insights on network congestion and adoption patterns</p>
                  </div>
                </div>

                <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#a78bfa' }}>
                    Prerequisites
                  </h4>
                  <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: '#e2e8f0' }}>Required:</p>
                    <ul style={{ marginLeft: '20px', marginBottom: '12px', lineHeight: '1.8' }}>
                      <li>Docker Desktop 20.10+</li>
                      <li>10GB free disk space minimum</li>
                      <li>Internet connectivity</li>
                      <li>Basic command-line knowledge</li>
                    </ul>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: '#e2e8f0' }}>Recommended:</p>
                    <ul style={{ marginLeft: '20px', marginBottom: '12px', lineHeight: '1.8' }}>
                      <li>SQL knowledge (SELECT, WHERE, GROUP BY)</li>
                      <li>Basic REST API familiarity</li>
                      <li>8GB RAM minimum (16GB recommended)</li>
                    </ul>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: '#e2e8f0' }}>Time Estimate:</p>
                    <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                      <li>Exercises 1-6: 1.5-2 hours</li>
                      <li>Exercises 7-9: 1-1.5 hours</li>
                      <li>Extensions: 2-3 hours</li>
                    </ul>
                  </div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#f59e0b' }}>
                    Quick Start Guide
                  </h4>
                  <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                    <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                      <li style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#f59e0b' }}>Clone the repository:</strong>
                        <pre style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '4px', marginTop: '4px', overflow: 'auto' }}>
                          <code>git clone https://github.com/maruthiprithivi/big_data_architecture.git{'\n'}cd big_data_architecture</code>
                        </pre>
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#f59e0b' }}>Configure environment (optional):</strong>
                        <pre style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '4px', marginTop: '4px', overflow: 'auto' }}>
                          <code>cp .env.example .env</code>
                        </pre>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Note: Default settings work for first-time users</span>
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#f59e0b' }}>Start services:</strong>
                        <pre style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '4px', marginTop: '4px', overflow: 'auto' }}>
                          <code>./start.sh</code>
                        </pre>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Initial setup: 15-20 minutes (Docker downloads), subsequent starts: 30-60 seconds</span>
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#f59e0b' }}>Access dashboard:</strong> Open{' '}
                        <a href="http://localhost:8501" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'underline' }}>
                          http://localhost:8501
                        </a> in your browser
                      </li>
                      <li>
                        <strong style={{ color: '#f59e0b' }}>Shutdown:</strong>
                        <pre style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '4px', marginTop: '4px', overflow: 'auto' }}>
                          <code>docker compose down     # Stop services{'\n'}docker compose down -v  # Remove all data</code>
                        </pre>
                      </li>
                    </ol>
                  </div>
                </div>

                <div style={{ background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#14b8a6' }}>
                    Exercises Structure
                  </h4>
                  <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontWeight: '600', color: '#14b8a6', marginBottom: '8px' }}>Getting Started (Exercises 1-3)</p>
                      <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                        <li>System verification and service health checks</li>
                        <li>Starting your first data collection</li>
                        <li>Exploring the Streamlit dashboard</li>
                      </ul>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontWeight: '600', color: '#14b8a6', marginBottom: '8px' }}>SQL Exploration (Exercises 4-6)</p>
                      <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                        <li>Basic block queries and blockchain structure</li>
                        <li>Transaction analysis and fee calculations</li>
                        <li>Cross-chain comparisons using SQL</li>
                      </ul>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontWeight: '600', color: '#14b8a6', marginBottom: '8px' }}>Data Analysis (Exercises 7-9)</p>
                      <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                        <li>Time-series analysis and trend identification</li>
                        <li>Storage and compression optimization</li>
                        <li>Performance metrics and bottleneck analysis</li>
                      </ul>
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', color: '#14b8a6', marginBottom: '8px' }}>Extension Challenges (Optional)</p>
                      <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                        <li>Add custom metrics to the collector</li>
                        <li>Create advanced analytical queries</li>
                        <li>Experiment with collection parameters</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#ef4444' }}>
                    Common Issues & Troubleshooting
                  </h4>
                  <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#ef4444' }}>Container startup failures:</strong> Check logs with <code style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '2px 6px', borderRadius: '3px' }}>docker compose logs [service]</code></p>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#ef4444' }}>RPC connection errors:</strong> Public endpoints have rate limits. Reduce COLLECTION_INTERVAL_SECONDS or use dedicated providers</p>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#ef4444' }}>Database connection issues:</strong> Restart collector after ClickHouse initialization: <code style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '2px 6px', borderRadius: '3px' }}>docker compose restart collector</code></p>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#ef4444' }}>Dashboard shows no data:</strong> Verify collection started via dashboard button, then check collector logs</p>
                  </div>
                </div>

                <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#6366f1' }}>
                    Additional Resources
                  </h4>
                  <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#6366f1' }}>GitHub Repository:</strong>{' '}
                      <a
                        href="https://github.com/maruthiprithivi/big_data_architecture"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#10b981', textDecoration: 'underline' }}
                      >
                        maruthiprithivi/big_data_architecture
                      </a>
                    </p>
                    <p style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#6366f1' }}>EXERCISES.md:</strong> Complete exercise instructions with step-by-step guidance
                    </p>
                    <p style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#6366f1' }}>SAMPLE_QUERIES.md:</strong> SQL query examples for blockchain data analysis
                    </p>
                    <p style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#6366f1' }}>GLOSSARY.md:</strong> Blockchain terminology and concepts reference
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
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
                {selectedComponent.technologies.map((tech, i) => {
                  const url = technologyUrls[tech];
                  const isClickable = !!url;

                  const pillStyle = {
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    color: '#e2e8f0',
                    fontWeight: '500',
                    textDecoration: 'none',
                    display: 'inline-block',
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'all 0.2s ease'
                  };

                  if (isClickable) {
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={pillStyle}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(139, 92, 246, 0.2)';
                          e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(30, 41, 59, 0.8)';
                          e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        {tech}
                      </a>
                    );
                  }

                  return (
                    <span key={i} style={pillStyle}>
                      {tech}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Code Examples Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#fbbf24', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                Code Examples
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(() => {
                  const componentName = selectedComponent.name.toLowerCase();
                  const technologies = selectedComponent.technologies;
                  const examples = [];

                  // Kafka / Message Queue examples
                  if (technologies.some(t => t.includes('Kafka')) || componentName.includes('queue') || componentName.includes('message')) {
                    examples.push({
                      title: 'Kafka Producer (Python)',
                      code: `from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Send event to topic
event = {'user_id': 123, 'action': 'purchase', 'amount': 49.99}
producer.send('user-events', value=event)
producer.flush()`
                    });
                  }

                  // Spark / Batch Processing examples
                  if (technologies.some(t => t.includes('Spark')) || componentName.includes('batch')) {
                    examples.push({
                      title: 'Spark Batch Job (PySpark)',
                      code: `from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, count

spark = SparkSession.builder.appName("BatchAnalytics").getOrCreate()

# Read data and aggregate
df = spark.read.parquet("s3://data-lake/events/")
daily_metrics = df.groupBy("date", "product_id") \\
    .agg(count("*").alias("views"), avg("price").alias("avg_price"))

daily_metrics.write.mode("overwrite").parquet("s3://warehouse/daily-metrics/")`
                    });
                  }

                  // Flink / Stream Processing examples
                  if (technologies.some(t => t.includes('Flink')) || technologies.some(t => t.includes('Storm')) || (componentName.includes('stream') && !componentName.includes('data'))) {
                    examples.push({
                      title: 'Flink Stream Processing (Java)',
                      code: `StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

DataStream<Event> events = env
    .addSource(new FlinkKafkaConsumer<>("events", new EventSchema(), props))
    .keyBy(event -> event.getUserId())
    .timeWindow(Time.minutes(5))
    .aggregate(new EventAggregator());

events.addSink(new FlinkKafkaProducer<>("aggregated-events", new EventSchema(), props));
env.execute("Real-time Aggregation");`
                    });
                  }

                  // Redis / Cache examples
                  if (technologies.some(t => t.includes('Redis')) || componentName.includes('cache')) {
                    examples.push({
                      title: 'Redis Caching Pattern (Python)',
                      code: `import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def get_user_profile(user_id):
    # Check cache first
    cached = redis_client.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)

    # Fetch from database if not cached
    profile = db.query(f"SELECT * FROM users WHERE id={user_id}")
    redis_client.setex(f"user:{user_id}", 3600, json.dumps(profile))
    return profile`
                    });
                  }

                  // PostgreSQL / Database examples
                  if (technologies.some(t => t.includes('PostgreSQL')) || technologies.some(t => t.includes('MongoDB')) || componentName.includes('source')) {
                    examples.push({
                      title: 'PostgreSQL Query (Python)',
                      code: `import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="analytics",
    user="datauser",
    password="password"
)

cursor = conn.cursor()
cursor.execute("""
    SELECT date, product_id, SUM(quantity) as total_sales
    FROM orders
    WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY date, product_id
    ORDER BY total_sales DESC
""")
results = cursor.fetchall()`
                    });
                  }

                  // Snowflake / Data Warehouse examples
                  if (technologies.some(t => t.includes('Snowflake')) || technologies.some(t => t.includes('BigQuery')) || componentName.includes('warehouse')) {
                    examples.push({
                      title: 'Snowflake Analytics Query (SQL)',
                      code: `-- Analytical query with window functions
SELECT
    user_id,
    order_date,
    total_amount,
    AVG(total_amount) OVER (
        PARTITION BY user_id
        ORDER BY order_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as moving_avg_7day
FROM orders
WHERE order_date >= DATEADD(month, -6, CURRENT_DATE())
ORDER BY user_id, order_date;`
                    });
                  }

                  // API / REST examples
                  if (technologies.some(t => t.includes('REST')) || technologies.some(t => t.includes('GraphQL')) || componentName.includes('api') || componentName.includes('serving')) {
                    examples.push({
                      title: 'REST API Endpoint (Node.js)',
                      code: `const express = require('express');
const app = express();

app.get('/api/metrics/:userId', async (req, res) => {
    const { userId } = req.params;

    // Merge batch and real-time views
    const batchView = await queryWarehouse(userId);
    const realtimeView = await queryCache(userId);

    const merged = {
        ...batchView,
        recentActivity: realtimeView.events,
        lastUpdated: new Date()
    };

    res.json(merged);
});`
                    });
                  }

                  // S3 / Cloud Storage examples
                  if (technologies.some(t => t.includes('S3')) || componentName.includes('storage')) {
                    examples.push({
                      title: 'S3 Data Lake Write (Python)',
                      code: `import boto3
import pandas as pd

s3_client = boto3.client('s3')

# Write partitioned data to S3
df = pd.DataFrame(events)
partition_path = f"year={year}/month={month}/day={day}/"

df.to_parquet(
    f"s3://data-lake/events/{partition_path}/data.parquet",
    compression='snappy',
    partition_cols=['region', 'category']
)`
                    });
                  }

                  // Airflow / Orchestration examples
                  if (technologies.some(t => t.includes('Airflow')) || componentName.includes('orchestration') || componentName.includes('pipeline')) {
                    examples.push({
                      title: 'Airflow DAG (Python)',
                      code: `from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'retries': 3,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG('daily_batch_job', default_args=default_args, schedule_interval='0 2 * * *')

extract = PythonOperator(task_id='extract', python_callable=extract_data, dag=dag)
transform = PythonOperator(task_id='transform', python_callable=transform_data, dag=dag)
load = PythonOperator(task_id='load', python_callable=load_to_warehouse, dag=dag)

extract >> transform >> load`
                    });
                  }

                  // Default example if no specific technology match
                  if (examples.length === 0) {
                    examples.push({
                      title: 'Component Integration Example',
                      code: `# Example integration for ${selectedComponent.name}
# Technologies: ${technologies.join(', ')}

# This component typically handles:
# - ${selectedComponent.description}
# - ${selectedComponent.details}

# Refer to official documentation for specific implementation details.`
                    });
                  }

                  return examples.map((example, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        padding: '10px 14px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
                        color: '#fbbf24',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {example.title}
                      </div>
                      <pre style={{
                        margin: 0,
                        padding: '14px',
                        fontSize: '12px',
                        lineHeight: '1.6',
                        color: '#e2e8f0',
                        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {example.code}
                      </pre>
                    </div>
                  ));
                })()}
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
