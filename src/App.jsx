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

  // Curriculum section states
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [activePhase, setActivePhase] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(null);

  // Case Studies section state
  const [showCaseStudies, setShowCaseStudies] = useState(false);
  const [completedLevels, setCompletedLevels] = useState(() => {
    const saved = localStorage.getItem('curriculumCompletedLevels');
    return saved ? JSON.parse(saved) : [];
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
      @keyframes levelUnlock {
        0% {
          transform: scale(0.8);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      @keyframes progressFill {
        from {
          width: 0%;
        }
      }
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      @keyframes bounceIn {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
          opacity: 1;
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

  // Persist curriculum progress to localStorage
  useEffect(() => {
    localStorage.setItem('curriculumCompletedLevels', JSON.stringify(completedLevels));
  }, [completedLevels]);

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
      description: 'Lambda Architecture, introduced by Nathan Marz (creator of Apache Storm), decomposes data processing into three distinct layers: a batch layer that recomputes complete views from the master dataset for accuracy, a speed layer that processes recent data in real-time for low latency, and a serving layer that merges both views to answer queries. This hybrid approach provides both accurate historical analysis and real-time responsiveness.',
      layout: 'lambda',
      overview: {
        text: 'Lambda Architecture solves the challenge of building robust, fault-tolerant data systems that need both real-time processing and accurate historical analysis. The batch layer processes the complete dataset periodically (typically nightly), producing accurate "batch views" that account for all data. The speed layer compensates for the batch layer\'s high latency by processing only recent data in real-time, producing "real-time views." The serving layer indexes and exposes both views, merging them at query time to provide comprehensive, up-to-date results. This architecture is ideal when you need guaranteed accuracy (via batch recomputation) alongside real-time responsiveness.',
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
      description: 'Kappa Architecture, proposed by Jay Kreps (co-creator of Apache Kafka), simplifies Lambda by treating all data as a stream and using only stream processing. Instead of maintaining separate batch and speed layers, Kappa uses a replayable event log (like Kafka) as the source of truth. When logic changes or reprocessing is needed, you simply replay the log through updated stream processors. This "stream-first" approach reduces complexity while maintaining the ability to recompute historical views.',
      layout: 'linear',
      overview: {
        text: 'Kappa Architecture recognizes that batch processing is essentially a special case of stream processing (a stream with a bounded start and end). By storing all raw events in a replayable, append-only log with configurable retention (potentially infinite), the architecture enables reprocessing historical data by simply replaying the log through stream processors. This eliminates the need to maintain two separate codebases for batch and stream processing. When you need to change your processing logic, deploy the new version and replay from the beginning of the log to rebuild your views. The simplicity comes with trade-offs: very long replay times for large datasets and potential challenges with complex analytical queries that are better suited for batch systems.',
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
      description: 'Pure Streaming Architecture focuses exclusively on processing unbounded data streams in real-time, prioritizing minimal latency over historical completeness. Unlike Lambda which adds batch for accuracy or Kappa which adds replay for reprocessing, pure streaming treats data as ephemeral flows that must be processed immediately. This pattern excels when the value of data degrades rapidly with time—real-time alerting, fraud detection, live monitoring, and operational dashboards where "good enough now" beats "perfect later."',
      layout: 'linear',
      overview: {
        text: 'Pure Streaming Architecture embraces the philosophy that data is most valuable at the moment it\'s created. Events flow from producers through message brokers to stream processors and finally to sinks (databases, dashboards, or other services), with each stage designed for minimal latency. Stream processors use windowing (tumbling, sliding, session windows) to aggregate data over time periods, and stateful processing to maintain counters, aggregates, and complex event patterns. The architecture handles challenges like out-of-order events, late-arriving data, and backpressure when downstream systems can\'t keep up. While this simplicity enables sub-second latency, it sacrifices the ability to easily reprocess historical data or perform complex batch analytics.',
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
      description: 'Batch Architecture is the foundational pattern for data warehousing and analytics, processing data in discrete, scheduled jobs rather than continuously. Data is extracted from source systems, transformed through ETL (Extract, Transform, Load) or ELT pipelines, and loaded into a data warehouse optimized for analytical queries. This architecture excels at complex transformations, aggregations, and joins that would be difficult or expensive in real-time. The trade-off is latency—data freshness is limited by batch frequency (hourly, daily, or weekly).',
      layout: 'linear',
      overview: {
        text: 'Batch Architecture follows the classic data warehouse paradigm: source systems generate operational data, which is periodically extracted and staged in a data lake or staging area. ETL pipelines transform raw data into analytical models (often using dimensional modeling with fact and dimension tables), applying business rules, data quality checks, and aggregations. The transformed data lands in a data warehouse optimized for OLAP (Online Analytical Processing) queries. Orchestration tools like Airflow schedule and monitor these pipelines, handling dependencies, retries, and alerting. Modern implementations often use ELT (Extract, Load, Transform) where raw data is loaded first and transformed within the warehouse using tools like dbt. Despite its simplicity, batch processing remains dominant for business intelligence, regulatory reporting, and scenarios where data freshness measured in hours or days is acceptable.',
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
      description: 'This architecture demonstrates a practical implementation of real-time data ingestion and analytics using blockchain data as the subject matter. It combines streaming ingestion patterns (continuously polling blockchain APIs), columnar storage for analytics (ClickHouse), and a modern full-stack dashboard (Next.js). The architecture showcases how to handle multi-source data ingestion, data model differences between sources (Bitcoin vs Solana), and real-time visualization—skills transferable to any domain requiring continuous data collection and analysis.',
      layout: 'blockchain',
      overview: {
        text: 'This hands-on pipeline demonstrates key big data patterns: multi-source data ingestion where each blockchain (Bitcoin, Solana) has different data models and APIs requiring specialized collectors; columnar storage using ClickHouse which provides exceptional compression ratios and query performance for time-series and analytical workloads; containerized microservices enabling easy deployment and scaling; and real-time dashboards that visualize ingestion rates, data freshness, and enable ad-hoc SQL queries. The architecture intentionally keeps complexity manageable for learning while demonstrating production-grade patterns. It uses public APIs (which have rate limits) rather than running full blockchain nodes, making it accessible for educational purposes.',
        scenario: 'Blockchain Analytics Platform',
        scenarioDescription: 'An educational system for ingesting blockchain data from Bitcoin and Solana into ClickHouse, featuring real-time monitoring via Next.js. External blockchain APIs continuously stream block and transaction data to a FastAPI collector service with separate Bitcoin and Solana collectors, which persist the data in a columnar ClickHouse database with dedicated tables. The Next.js dashboard provides real-time visualization with ingestion rate metrics, countdown timer, and data preview tables, along with collection controls and SQL query capabilities for analyzing blockchain metrics, transaction patterns, and network performance.',
        components: [
          { name: 'Bitcoin API', metric: 'REST API from blockstream.info providing block and transaction data' },
          { name: 'Solana RPC', metric: 'JSON-RPC from mainnet-beta.solana.com with slot and transaction streams' },
          { name: 'Bitcoin Collector', metric: 'Dedicated collector for Bitcoin blockchain data' },
          { name: 'Solana Collector', metric: 'Dedicated collector for Solana blockchain data' },
          { name: 'FastAPI Service', metric: 'Asynchronous Python service orchestrating data collection' },
          { name: 'ClickHouse Database', metric: 'Columnar OLAP storage with optimized compression for blockchain analytics' },
          { name: 'Bitcoin Tables', metric: 'bitcoin_blocks and bitcoin_transactions tables' },
          { name: 'Solana Tables', metric: 'solana_blocks and solana_transactions tables' },
          { name: 'Next.js Dashboard', metric: 'Real-time monitoring UI with ingestion rate metrics and automatic shutdown timer' },
          { name: 'Web Browser', metric: 'User interface at localhost:3001 for controlling and visualizing data' }
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
        'Columnar storage optimized for analytics',
        'Real-time dashboard with ingestion rate metrics',
        'Built-in safety controls and monitoring'
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
        { id: 'dashboard', name: 'Next.js Dashboard', shape: 'dashboard', description: 'Monitoring UI', details: 'Real-time visualization with ingestion rate metrics, countdown timer, and data preview tables at port 3001. Built with Next.js 16 and Turbopack.', technologies: ['Next.js 16', 'Turbopack', 'React', 'Docker'] },
        { id: 'browser', name: 'Web Browser', shape: 'cloud', description: 'User interface', details: 'Browser-based access to dashboard at localhost:3001.', technologies: ['HTTP', 'localhost:3001'] }
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

  // Data Engineering Curriculum - From Zero to Hired
  const curriculumData = {
    title: "Data Engineering Curriculum",
    subtitle: "From Zero to Hired Data Engineer",
    phases: [
      {
        id: 1,
        name: "The Foundation",
        subtitle: "Data Literacy",
        goal: "Understand the ecosystem before touching code",
        icon: "foundation",
        color: "#3b82f6",
        colorLight: "rgba(59, 130, 246, 0.15)",
        levels: [
          {
            id: "1.1",
            name: "The Data Lifecycle",
            concept: "How data moves through systems: Generation → Ingestion → Storage → Processing → Consumption. Understanding this flow is fundamental to designing any data system.",
            whyItMatters: "Every data engineering decision you make will be about optimizing one of these stages. Know the lifecycle, and you'll always know where you are in the bigger picture.",
            analogy: "Think of data like water in a city: it's collected (Generation), piped in (Ingestion), stored in tanks (Storage), treated/filtered (Processing), and delivered to homes (Consumption).",
            references: [
              { title: "Data Engineering vs Data Science (Medium)", url: "https://medium.com/@rchang/a-beginners-guide-to-data-engineering-part-i-4227c5c457d7" }
            ],
            bossFight: {
              name: "Napkin Architecture",
              description: "Draw a diagram of how you think Spotify recommends songs to users.",
              input: "Your napkin, whiteboard, or any drawing tool",
              expectedOutput: "A diagram showing: User actions → Data collection → Storage → Processing/ML → Recommendations displayed"
            }
          },
          {
            id: "1.2",
            name: "OLTP vs. OLAP",
            concept: "Transactional databases (OLTP) power app backends with fast, simple operations. Analytical warehouses (OLAP) enable deep reporting on historical data.",
            whyItMatters: "Choosing the wrong database type is one of the most expensive mistakes in data engineering. OLTP for your analytics? Slow queries. OLAP for your app? Slow writes.",
            analogy: "OLTP is a cash register — fast, handles one transaction at a time, optimized for speed. OLAP is a library archive — slower to search, but can answer complex questions across millions of records.",
            references: [
              { title: "AWS: OLTP vs OLAP", url: "https://aws.amazon.com/compare/the-difference-between-olap-and-oltp/" }
            ],
            microTask: {
              name: "Database Detective",
              description: "List 3 examples each of systems that should use OLTP vs OLAP.",
              input: "Think about apps you use daily",
              expectedOutput: "OLTP: Banking app, E-commerce checkout, User login system. OLAP: Sales dashboard, Customer analytics, Financial reporting."
            }
          },
          {
            id: "1.3",
            name: "Data Modeling Basics",
            concept: "Normalization reduces data redundancy (good for writes). Denormalization increases redundancy for faster reads (good for analytics).",
            whyItMatters: "Your data model determines query performance, storage costs, and how easy it is to maintain your system. Get it wrong, and you'll be refactoring for months.",
            analogy: "Normalization is like organizing a library with a single copy of each book and a card catalog. Denormalization is like putting copies of popular books in every section — uses more space but faster to find.",
            references: [
              { title: "Splunk: Normalization vs Denormalization", url: "https://www.splunk.com/en_us/blog/learn/data-normalization.html" }
            ],
            microTask: {
              name: "Schema Sketcher",
              description: "Design a normalized schema for an e-commerce product catalog, then denormalize it for a product search feature.",
              input: "Products have: name, price, category, brand, reviews",
              expectedOutput: "Normalized: Products, Categories, Brands, Reviews tables with foreign keys. Denormalized: Single products_search table with embedded category_name, brand_name, avg_rating."
            }
          }
        ]
      },
      {
        id: 2,
        name: "The Toolkit",
        subtitle: "SQL & Python",
        goal: "Master the tools of the trade",
        icon: "tools",
        color: "#10b981",
        colorLight: "rgba(16, 185, 129, 0.15)",
        levels: [
          {
            id: "2.1",
            name: "SQL (The King)",
            concept: "SQL is the universal language of data. Master SELECT, FROM, WHERE, GROUP BY, JOINs, and Window Functions — these cover 90% of real-world data work.",
            whyItMatters: "Every data tool speaks SQL. Spark? SQL. BigQuery? SQL. dbt? SQL. If you master SQL, you can work with almost any data platform on Earth.",
            analogy: "SQL is like English for data — it's the lingua franca. Learn it once, use it everywhere.",
            references: [
              { title: "Mode Analytics SQL Tutorial", url: "https://mode.com/sql-tutorial/" },
              { title: "ThoughtSpot SQL Guide", url: "https://www.thoughtspot.com/data-trends/data-modeling/sql-commands-cheat-sheet" }
            ],
            codeExample: {
              language: "sql",
              code: `-- Window Functions: Running total of sales
SELECT
    order_date,
    product_id,
    amount,
    SUM(amount) OVER (
        PARTITION BY product_id
        ORDER BY order_date
    ) as running_total
FROM sales
WHERE order_date >= '2024-01-01';`
            },
            bossFight: {
              name: "The Detective",
              description: "Given a CSV of messy sales data, find the top 3 items sold on Tuesdays using only SQL.",
              input: "sales.csv with columns: order_id, product_name, quantity, order_date, price",
              expectedOutput: "A query returning product_name and total_quantity for top 3 products sold on Tuesdays, ordered by quantity descending."
            }
          },
          {
            id: "2.2",
            name: "Python for Data",
            concept: "Python + Pandas is the Swiss Army knife of data engineering. Learn DataFrames, reading CSV/JSON, and making API requests.",
            whyItMatters: "Python is the glue that connects everything in data engineering. From quick scripts to production pipelines, Python is everywhere.",
            analogy: "If SQL is for talking to databases, Python is for talking to everything else — APIs, files, cloud services, ML models.",
            references: [
              { title: "Pandas Official Getting Started", url: "https://pandas.pydata.org/docs/getting_started/index.html" }
            ],
            codeExample: {
              language: "python",
              code: `import pandas as pd
import requests

# Fetch weather data from API
response = requests.get(
    "https://api.open-meteo.com/v1/forecast",
    params={"latitude": 40.71, "longitude": -74.01, "current_weather": True}
)
weather = response.json()

# Convert to DataFrame and save
df = pd.DataFrame([weather["current_weather"]])
df.to_json("weather_data.json", orient="records")`
            },
            microTask: {
              name: "Weather Fetcher",
              description: "Write a Python script to fetch weather data from OpenMeteo API and save it to a JSON file.",
              input: "OpenMeteo API: https://api.open-meteo.com/v1/forecast",
              expectedOutput: "A weather_data.json file containing current weather for your city."
            }
          }
        ]
      },
      {
        id: 3,
        name: "The Pipeline",
        subtitle: "Core Engineering",
        goal: "Move data automatically",
        icon: "pipeline",
        color: "#f59e0b",
        colorLight: "rgba(245, 158, 11, 0.15)",
        levels: [
          {
            id: "3.1",
            name: "Dimensional Modeling",
            concept: "Star Schema: Fact Tables store measurements (sales, clicks, events). Dimension Tables provide context (who, what, when, where).",
            whyItMatters: "Dimensional modeling is the foundation of every data warehouse. It's how you make data queryable by business users.",
            analogy: "Facts are the verbs (sold, clicked, shipped). Dimensions are the nouns (customer, product, date). Together they tell the complete story.",
            references: [
              { title: "Kimball Group Dimensional Modeling Techniques", url: "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/" },
              { title: "Holistics: Kimball in the Modern Stack", url: "https://www.holistics.io/blog/how-we-structure-our-data-team-at-holistics/" }
            ],
            codeExample: {
              language: "sql",
              code: `-- Star Schema Example
-- Fact Table: Records every sale event
CREATE TABLE fact_sales (
    sale_id BIGINT PRIMARY KEY,
    date_key INT REFERENCES dim_date(date_key),
    product_key INT REFERENCES dim_product(product_key),
    customer_key INT REFERENCES dim_customer(customer_key),
    quantity INT,
    amount DECIMAL(10,2)
);

-- Dimension Table: Product details
CREATE TABLE dim_product (
    product_key INT PRIMARY KEY,
    product_name VARCHAR(255),
    category VARCHAR(100),
    brand VARCHAR(100)
);`
            },
            microTask: {
              name: "Schema Architect",
              description: "Design a star schema for an online streaming service (like Netflix).",
              input: "Track: what users watch, when, how long, on what device",
              expectedOutput: "fact_viewing with dimension tables: dim_user, dim_content, dim_date, dim_device"
            }
          },
          {
            id: "3.2",
            name: "Orchestration (Airflow)",
            concept: "Airflow manages dependencies between tasks using DAGs (Directed Acyclic Graphs). It ensures tasks run in the right order, handles failures, and provides visibility.",
            whyItMatters: "Production data pipelines have dozens of steps that must run in sequence. Airflow is the industry standard for orchestrating this complexity.",
            analogy: "Airflow is like a conductor for an orchestra — it doesn't play instruments, but it ensures everyone plays at the right time in the right order.",
            references: [
              { title: "Official Apache Airflow Tutorial", url: "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html" }
            ],
            codeExample: {
              language: "python",
              code: `from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

def extract_data():
    # Fetch data from API
    pass

def transform_data():
    # Clean and transform
    pass

def load_data():
    # Load to warehouse
    pass

with DAG('daily_etl', start_date=datetime(2024, 1, 1), schedule='@daily') as dag:
    extract = PythonOperator(task_id='extract', python_callable=extract_data)
    transform = PythonOperator(task_id='transform', python_callable=transform_data)
    load = PythonOperator(task_id='load', python_callable=load_data)

    extract >> transform >> load  # Define dependencies`
            },
            bossFight: {
              name: "The Daily Report",
              description: "Build an Airflow DAG that runs every morning, pulls weather data from the API you built in Phase 2, and saves it to a database.",
              input: "Your Python weather script from Level 2.2",
              expectedOutput: "A working DAG with extract → transform → load tasks that runs on a schedule."
            }
          },
          {
            id: "3.3",
            name: "Containerization (Docker)",
            concept: "Docker packages your code with all its dependencies into containers. This solves 'it works on my machine' forever.",
            whyItMatters: "Every modern data tool runs in containers. Kubernetes, cloud deployments, local development — Docker is the universal packaging format.",
            analogy: "Docker is like shipping containers for code. Just as shipping containers standardized global trade, Docker standardized software deployment.",
            references: [
              { title: "Towards Data Science: Docker for Data Science", url: "https://towardsdatascience.com/docker-for-data-science-a-step-by-step-guide-1e5f7f3d8a5f/" }
            ],
            codeExample: {
              language: "dockerfile",
              code: `# Dockerfile for Python data pipeline
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run the pipeline
CMD ["python", "weather_pipeline.py"]`
            },
            microTask: {
              name: "Container Builder",
              description: "Containerize the Python weather script from Level 2.2.",
              input: "Your weather_fetcher.py script",
              expectedOutput: "A Dockerfile and working container that can be run with 'docker run weather-fetcher'"
            }
          }
        ]
      },
      {
        id: 4,
        name: "Scale & Cloud",
        subtitle: "The Pro Level",
        goal: "Move from laptop to cloud infrastructure",
        icon: "cloud",
        color: "#8b5cf6",
        colorLight: "rgba(139, 92, 246, 0.15)",
        levels: [
          {
            id: "4.1",
            name: "Big Data Processing (Spark)",
            concept: "Apache Spark enables distributed computing when your data doesn't fit in RAM. It splits work across a cluster of machines.",
            whyItMatters: "When you graduate from gigabytes to terabytes, Pandas won't cut it. Spark is how you process massive datasets in production.",
            analogy: "Pandas is one person doing dishes. Spark is an assembly line of workers — each handles a portion, and the work gets done much faster.",
            references: [
              { title: "PySpark Official Quickstart", url: "https://spark.apache.org/docs/latest/api/python/getting_started/index.html" }
            ],
            codeExample: {
              language: "python",
              code: `from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, count

# Initialize Spark
spark = SparkSession.builder.appName("SalesAnalytics").getOrCreate()

# Read data (distributed across cluster)
df = spark.read.parquet("s3://data-lake/sales/")

# Transformations (executed in parallel)
result = df.filter(col("year") == 2024) \\
    .groupBy("product_category") \\
    .agg(
        count("*").alias("total_orders"),
        avg("amount").alias("avg_order_value")
    )

result.write.parquet("s3://warehouse/category_metrics/")`
            },
            microTask: {
              name: "Spark vs Pandas",
              description: "Rewrite a Pandas aggregation script in PySpark. Compare the API differences.",
              input: "A simple Pandas groupby operation",
              expectedOutput: "Equivalent PySpark code with notes on syntax differences."
            }
          },
          {
            id: "4.2",
            name: "Infrastructure as Code (Terraform)",
            concept: "Terraform manages cloud resources via code files (.tf). Instead of clicking in AWS console, you declare what you want and Terraform creates it.",
            whyItMatters: "Manual cloud setup doesn't scale and can't be version controlled. Terraform makes infrastructure reproducible, reviewable, and automated.",
            analogy: "Terraform is like a recipe for your cloud kitchen. Instead of remembering how to set things up, you write it down once and can recreate it perfectly every time.",
            references: [
              { title: "HashiCorp: Terraform AWS Getting Started", url: "https://developer.hashicorp.com/terraform/tutorials/aws-get-started" }
            ],
            codeExample: {
              language: "hcl",
              code: `# main.tf - Create an S3 bucket for data lake
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "data_lake" {
  bucket = "my-company-data-lake"

  tags = {
    Environment = "production"
    Team        = "data-engineering"
  }
}`
            },
            microTask: {
              name: "Infrastructure Starter",
              description: "Write a Terraform script to create one AWS S3 bucket for your data lake.",
              input: "AWS account (free tier works)",
              expectedOutput: "A main.tf file that successfully creates an S3 bucket when you run 'terraform apply'"
            }
          },
          {
            id: "4.3",
            name: "The Transformation Layer (dbt)",
            concept: "dbt brings software engineering best practices to SQL: version control, testing, documentation, and modularity for your transformations.",
            whyItMatters: "Raw data is messy. dbt is how modern teams transform raw data into clean, tested, documented tables that business users can trust.",
            analogy: "If your data warehouse is a kitchen, dbt is your recipe book — tested recipes (models) that turn raw ingredients (source data) into dishes (analytics tables).",
            references: [
              { title: "dbt Labs: Getting Started", url: "https://docs.getdbt.com/docs/introduction" }
            ],
            codeExample: {
              language: "sql",
              code: `-- models/marts/dim_customers.sql
{{ config(materialized='table') }}

WITH source_customers AS (
    SELECT * FROM {{ ref('stg_customers') }}
),

enriched AS (
    SELECT
        customer_id,
        first_name,
        last_name,
        email,
        created_at,
        -- Add derived columns
        DATEDIFF(day, created_at, CURRENT_DATE) as days_since_signup,
        CASE
            WHEN total_orders > 10 THEN 'power_user'
            WHEN total_orders > 0 THEN 'active'
            ELSE 'new'
        END as customer_segment
    FROM source_customers
)

SELECT * FROM enriched`
            },
            bossFight: {
              name: "dbt Project Setup",
              description: "Initialize a dbt project and create your first model that transforms raw user data into a clean dim_users table.",
              input: "A raw_users table with messy data",
              expectedOutput: "A dbt project with staging and marts layers, plus a working dim_users model with tests."
            }
          }
        ]
      },
      {
        id: 5,
        name: "The Frontier",
        subtitle: "Advanced Trends 2026",
        goal: "Niche specialization and modern best practices",
        icon: "rocket",
        color: "#ec4899",
        colorLight: "rgba(236, 72, 153, 0.15)",
        levels: [
          {
            id: "5.1",
            name: "Data Contracts",
            concept: "Data Contracts treat data like an API with strict schema enforcement. Producers and consumers agree on the format, and breaking changes require coordination.",
            whyItMatters: "In large organizations, upstream changes break downstream pipelines constantly. Data contracts prevent this chaos by formalizing agreements between teams.",
            analogy: "Data contracts are like API documentation — they define what data looks like, what's required, and what's optional. Break the contract, break the build.",
            references: [
              { title: "Atlan: Data Contracts Explained", url: "https://atlan.com/data-contracts/" },
              { title: "DataContract.com (Open Standard)", url: "https://datacontract.com/" }
            ],
            codeExample: {
              language: "yaml",
              code: `# datacontract.yaml
dataContractSpecification: 0.9.3
id: orders-contract
info:
  title: Orders Data Contract
  version: 1.0.0
  owner: data-platform-team

models:
  orders:
    type: table
    fields:
      order_id:
        type: string
        required: true
        primaryKey: true
      customer_id:
        type: string
        required: true
      amount:
        type: decimal
        required: true
      created_at:
        type: timestamp
        required: true

quality:
  - type: sql
    query: SELECT COUNT(*) FROM orders WHERE amount < 0
    mustBe: 0`
            },
            microTask: {
              name: "Contract Writer",
              description: "Write a data contract for an events table that tracks user clicks on a website.",
              input: "Events should include: event_id, user_id, event_type, page_url, timestamp",
              expectedOutput: "A YAML data contract with field definitions and at least one quality check."
            }
          },
          {
            id: "5.2",
            name: "Streaming (Kafka)",
            concept: "Apache Kafka enables real-time event processing. Instead of batch processing data hourly, you process it as it arrives — milliseconds after it happens.",
            whyItMatters: "Modern users expect real-time: live notifications, instant recommendations, fraud detection in milliseconds. Kafka makes this possible at scale.",
            analogy: "Batch processing is like mail delivery — you get all your letters once a day. Kafka is like a text message — you get it the instant it's sent.",
            references: [
              { title: "Confluent: Apache Kafka Introduction", url: "https://developer.confluent.io/what-is-apache-kafka/" }
            ],
            codeExample: {
              language: "python",
              code: `from kafka import KafkaConsumer, KafkaProducer
import json

# Producer: Send events to Kafka
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

event = {
    'user_id': 'user_123',
    'action': 'page_view',
    'page': '/products/shoes',
    'timestamp': '2024-01-15T10:30:00Z'
}
producer.send('user-events', value=event)

# Consumer: Process events in real-time
consumer = KafkaConsumer(
    'user-events',
    bootstrap_servers=['localhost:9092'],
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

for message in consumer:
    event = message.value
    print(f"Processing: {event['action']} by {event['user_id']}")`
            },
            bossFight: {
              name: "Real-Time Pipeline",
              description: "Build a Kafka producer that sends simulated user events, and a consumer that aggregates them into a 'users online' counter.",
              input: "Kafka running locally (use Docker)",
              expectedOutput: "A working producer sending events and a consumer printing real-time counts."
            }
          }
        ]
      }
    ]
  };

  // Phase colors for curriculum
  const phaseColors = {
    1: { primary: '#3b82f6', light: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' },
    2: { primary: '#10b981', light: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
    3: { primary: '#f59e0b', light: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
    4: { primary: '#8b5cf6', light: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)' },
    5: { primary: '#ec4899', light: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.3)' }
  };

  // Phase icons for curriculum
  const phaseIcons = {
    foundation: '🏗️',
    tools: '🛠️',
    pipeline: '🔄',
    cloud: '☁️',
    rocket: '🚀'
  };

  const connectionColors = {
    stream: '#f59e0b',
    batch: '#ec4899',
    query: '#10b981'
  };

  // Case Studies Data - Real-world Big Data Architecture Examples
  const caseStudies = [
    {
      id: 'netflix',
      company: 'Netflix',
      industry: 'Streaming Entertainment',
      logo: '🎬',
      color: '#e50914',
      title: 'Real-Time Personalization at Scale',
      subtitle: 'Processing 500+ billion events daily',
      architectureType: 'Lambda Architecture + Event-Driven',
      challenge: 'Netflix needed to deliver personalized content recommendations to 230+ million subscribers across 190+ countries, while processing massive amounts of viewing data in real-time to update recommendations as user preferences evolve.',
      solution: 'Netflix implemented a sophisticated Lambda Architecture combining Apache Kafka for real-time event streaming with Apache Spark for batch processing. Their data pipeline ingests over 500 billion events daily, including every play, pause, search, and browse action.',
      implementation: [
        'Apache Kafka handles real-time event streaming from millions of concurrent users',
        'Apache Spark processes batch jobs for deep learning model training on petabytes of viewing history',
        'Apache Flink provides real-time stream processing for instant recommendation updates',
        'Amazon S3 serves as their data lake storing raw viewing events and processed datasets',
        'Apache Cassandra and Amazon DynamoDB provide low-latency serving for personalization APIs'
      ],
      keyMetrics: [
        { label: 'Events/Day', value: '500B+' },
        { label: 'Storage', value: '60+ PB' },
        { label: 'Users', value: '230M+' },
        { label: 'Countries', value: '190+' }
      ],
      keyLearnings: [
        'Event-driven architecture enables near-instant personalization updates',
        'Separating batch and speed layers allows for both accurate historical analysis and real-time responsiveness',
        'Investing in data quality at ingestion prevents cascading issues downstream',
        'A/B testing infrastructure integrated into the data pipeline enables rapid experimentation'
      ],
      technologies: ['Kafka', 'Spark', 'Flink', 'S3', 'Cassandra', 'Druid'],
      references: [
        { title: 'Netflix Tech Blog: Evolution of the Netflix Data Pipeline', url: 'https://netflixtechblog.com/evolution-of-the-netflix-data-pipeline-da246ca36905' },
        { title: 'Netflix: Keystone Real-Time Stream Processing Platform', url: 'https://netflixtechblog.com/keystone-real-time-stream-processing-platform-a3ee651812a' }
      ]
    },
    {
      id: 'uber',
      company: 'Uber',
      industry: 'Transportation & Logistics',
      logo: '🚗',
      color: '#000000',
      title: 'Real-Time Marketplace Matching',
      subtitle: 'Sub-second rider-driver matching across 10,000+ cities',
      architectureType: 'Streaming Architecture + Kappa',
      challenge: 'Uber processes millions of GPS pings per second from drivers and riders globally, requiring sub-second latency for ride matching, dynamic pricing (surge), and ETA calculations while maintaining system reliability across 10,000+ cities.',
      solution: 'Uber built a stream-first architecture centered on Apache Kafka and Apache Flink. Their "Marketplace" platform processes location updates in real-time to optimize driver-rider matching and calculate surge pricing dynamically.',
      implementation: [
        'Apache Kafka processes trillions of messages daily with geo-partitioned topics',
        'Apache Flink handles real-time surge pricing calculations with sub-second latency',
        'Apache Hive and Presto power batch analytics on historical trip data',
        'Custom-built H3 geospatial indexing system enables efficient location-based queries',
        'Apache Pinot serves real-time OLAP queries for operational dashboards'
      ],
      keyMetrics: [
        { label: 'Messages/Day', value: '1T+' },
        { label: 'GPS Pings/Sec', value: '1M+' },
        { label: 'Cities', value: '10,000+' },
        { label: 'Latency', value: '<100ms' }
      ],
      keyLearnings: [
        'Geospatial partitioning is essential for location-based streaming applications',
        'Stream processing must handle late-arriving data gracefully for accurate analytics',
        'Idempotent processing ensures correctness during system failures and retries',
        'Backpressure handling is critical when processing variable traffic patterns'
      ],
      technologies: ['Kafka', 'Flink', 'Spark', 'Pinot', 'Hive'],
      references: [
        { title: 'Uber Engineering: Real-Time Exactly-Once Ad Event Processing', url: 'https://www.uber.com/blog/real-time-exactly-once-ad-event-processing/' },
        { title: 'Uber Engineering: AresDB - Real-time Analytics Engine', url: 'https://www.uber.com/blog/aresdb/' }
      ]
    },
    {
      id: 'airbnb',
      company: 'Airbnb',
      industry: 'Travel & Hospitality',
      logo: '🏠',
      color: '#ff5a5f',
      title: 'Search Ranking & Dynamic Pricing',
      subtitle: 'ML-powered search across 7M+ listings',
      architectureType: 'Lambda Architecture + ML Pipelines',
      challenge: 'Airbnb needed to rank millions of listings in real-time based on guest preferences, host responsiveness, seasonality, and hundreds of other signals while enabling hosts to price competitively with dynamic pricing suggestions.',
      solution: 'Airbnb developed a comprehensive Lambda Architecture with Apache Spark for batch ML model training, Apache Kafka for real-time feature updates, and Apache Airflow for workflow orchestration. Their "Minerva" platform unifies metrics computation across batch and streaming.',
      implementation: [
        'Apache Airflow orchestrates 25,000+ daily batch jobs for data transformation and ML training',
        'Apache Spark trains ranking models on historical booking and search data',
        'Apache Kafka streams real-time availability updates and booking events',
        'Apache Druid powers real-time analytics dashboards for hosts and internal teams',
        'Custom feature store provides consistent ML features across batch training and real-time inference'
      ],
      keyMetrics: [
        { label: 'Listings', value: '7M+' },
        { label: 'Daily Jobs', value: '25,000+' },
        { label: 'Data Warehouse', value: '50+ PB' },
        { label: 'Countries', value: '220+' }
      ],
      keyLearnings: [
        'Feature stores bridge the gap between batch model training and real-time serving',
        'Data quality monitoring is essential when ML models depend on data pipelines',
        'Unified metrics definitions (Minerva) prevent metric inconsistencies across teams',
        'Progressive rollout of ML models through experimentation platforms reduces risk'
      ],
      technologies: ['Spark', 'Airflow', 'Kafka', 'Druid', 'Hive'],
      references: [
        { title: 'Airbnb Engineering: Airflow at Airbnb', url: 'https://medium.com/airbnb-engineering/airflow-a-workflow-management-platform-46318b977fd8' },
        { title: 'Airbnb Engineering: Minerva - Metric Platform', url: 'https://medium.com/airbnb-engineering/how-airbnb-achieved-metric-consistency-at-scale-f23cc53dea70' }
      ]
    },
    {
      id: 'meta',
      company: 'Meta (Facebook)',
      industry: 'Social Media',
      logo: '👥',
      color: '#1877f2',
      title: 'Unified Data Warehouse at Exabyte Scale',
      subtitle: 'Largest Hadoop/Presto deployment in the world',
      architectureType: 'Batch Architecture + Custom Stream Processing',
      challenge: 'Meta operates one of the largest data infrastructures in the world, processing exabytes of data daily from billions of users across Facebook, Instagram, WhatsApp, and Messenger while supporting both real-time features and long-term analytics.',
      solution: 'Meta built custom data infrastructure including Scuba for real-time analytics, Presto for interactive SQL queries, and massive Hadoop clusters for batch processing. Their unified data platform processes exabytes daily while maintaining sub-second query latency for analysts.',
      implementation: [
        'Scuba provides real-time analytics with sub-second query latency on streaming data',
        'Presto enables interactive SQL queries across their entire data warehouse',
        'Apache Spark and custom MapReduce jobs process batch workloads at exabyte scale',
        'Prophet (open-sourced) handles time-series forecasting for capacity planning',
        'Custom data lake architecture with columnar storage for analytical efficiency'
      ],
      keyMetrics: [
        { label: 'Daily Data', value: '1+ EB' },
        { label: 'Presto Queries/Day', value: '1M+' },
        { label: 'Active Users', value: '3B+' },
        { label: 'Data Centers', value: '20+' }
      ],
      keyLearnings: [
        'At extreme scale, building custom tools often becomes necessary',
        'Data governance and privacy must be built into the architecture from day one',
        'Query optimization and caching dramatically impact costs at scale',
        'Separating storage and compute enables independent scaling'
      ],
      technologies: ['Spark', 'Presto', 'Hive', 'Kafka'],
      references: [
        { title: 'Meta Engineering: Scaling Data Infrastructure', url: 'https://engineering.fb.com/2014/10/21/core-infra/scaling-the-facebook-data-warehouse-to-300-pb/' },
        { title: 'Presto: SQL on Everything', url: 'https://prestodb.io/' }
      ]
    },
    {
      id: 'google',
      company: 'Google',
      industry: 'Technology',
      logo: '🔍',
      color: '#4285f4',
      title: 'Global-Scale Data Processing',
      subtitle: 'Pioneers of MapReduce, BigQuery, and Dataflow',
      architectureType: 'Hybrid (Innovators of Lambda/Kappa patterns)',
      challenge: 'Google processes hundreds of petabytes daily across Search, YouTube, Gmail, and Cloud services, requiring both batch processing for index building and real-time processing for ads, recommendations, and spam detection.',
      solution: 'Google pioneered many foundational big data technologies including MapReduce, Bigtable, Spanner, Dremel (BigQuery), and Dataflow. Their unified "Millwheel" and later "Dataflow" model enables both batch and stream processing with the same programming model.',
      implementation: [
        'BigQuery provides serverless analytics with automatic scaling and SQL interface',
        'Cloud Dataflow (Apache Beam) unifies batch and stream processing semantics',
        'Cloud Pub/Sub handles real-time event ingestion at global scale',
        'Bigtable serves as high-throughput, low-latency storage for time-series data',
        'Spanner provides globally-distributed, strongly-consistent transactions'
      ],
      keyMetrics: [
        { label: 'Search Queries/Day', value: '8.5B+' },
        { label: 'YouTube Hours/Day', value: '1B+' },
        { label: 'Gmail Users', value: '1.8B+' },
        { label: 'Data Centers', value: '30+' }
      ],
      keyLearnings: [
        'Unified batch and stream processing (Dataflow model) simplifies development',
        'Separation of storage and compute enables elastic scaling',
        'Strong consistency is achievable at global scale (Spanner)',
        'Serverless architectures reduce operational burden significantly'
      ],
      technologies: ['BigQuery', 'Dataflow', 'Pub/Sub', 'Bigtable', 'Spanner'],
      references: [
        { title: 'Google Cloud: Dataflow Overview', url: 'https://cloud.google.com/dataflow/docs/concepts' },
        { title: 'The Dataflow Model (Research Paper)', url: 'https://research.google/pubs/the-dataflow-model-a-practical-approach-to-balancing-correctness-latency-and-cost-in-massive-scale-unbounded-out-of-order-data-processing/' }
      ]
    },
    {
      id: 'linkedin',
      company: 'LinkedIn',
      industry: 'Professional Networking',
      logo: '💼',
      color: '#0077b5',
      title: 'Real-Time Activity Tracking',
      subtitle: 'Creators of Apache Kafka',
      architectureType: 'Kappa Architecture (Kafka-centric)',
      challenge: 'LinkedIn needed to track and process billions of user interactions daily for features like "Who viewed your profile," news feed ranking, and connection recommendations while maintaining real-time responsiveness for 900+ million members.',
      solution: 'LinkedIn created Apache Kafka to solve their real-time data challenges, building an entire data ecosystem around it. Their architecture processes trillions of messages daily, powering both real-time features and batch analytics through a unified event log.',
      implementation: [
        'Apache Kafka (created at LinkedIn) serves as the central nervous system for all data',
        'Apache Samza (created at LinkedIn) provides stateful stream processing',
        'Apache Pinot enables real-time OLAP analytics for member-facing features',
        'Hadoop clusters process batch analytics and ML model training',
        'Venice (created at LinkedIn) serves as a derived data serving platform'
      ],
      keyMetrics: [
        { label: 'Messages/Day', value: '7T+' },
        { label: 'Members', value: '900M+' },
        { label: 'Kafka Clusters', value: '100+' },
        { label: 'Topics', value: '100K+' }
      ],
      keyLearnings: [
        'A unified event log (Kafka) enables both real-time and batch processing',
        'Stream processing frameworks benefit from deep Kafka integration',
        'Compacted topics enable event sourcing patterns for derived data',
        'Schema evolution is critical for long-lived event streams'
      ],
      technologies: ['Kafka', 'Samza', 'Pinot', 'Spark', 'Hadoop'],
      references: [
        { title: 'LinkedIn Engineering: The Log - What every software engineer should know', url: 'https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying' },
        { title: 'Apache Kafka Documentation', url: 'https://kafka.apache.org/documentation/' }
      ]
    },
    {
      id: 'twitter',
      company: 'X (Twitter)',
      industry: 'Social Media',
      logo: '🐦',
      color: '#1da1f2',
      title: 'Real-Time Tweet Processing',
      subtitle: 'Processing 500M+ tweets daily',
      architectureType: 'Streaming Architecture + Lambda',
      challenge: 'Twitter processes hundreds of millions of tweets daily, requiring real-time delivery to followers, instant search indexing, trend detection, and spam filtering—all while handling massive traffic spikes during global events.',
      solution: 'Twitter built a sophisticated streaming architecture with Apache Kafka for event streaming, Apache Storm (which they helped develop) for real-time processing, and Manhattan (custom distributed database) for low-latency storage.',
      implementation: [
        'Apache Kafka handles event streaming for all tweet-related events',
        'Heron (successor to Storm) processes real-time analytics and trend detection',
        'Manhattan provides low-latency key-value storage for timelines',
        'Apache Hadoop and Scalding (Scala MapReduce) power batch analytics',
        'Snowflake IDs enable globally unique, time-sortable tweet identifiers'
      ],
      keyMetrics: [
        { label: 'Tweets/Day', value: '500M+' },
        { label: 'Users', value: '350M+' },
        { label: 'Timeline Reads/Sec', value: '300K+' },
        { label: 'Peak Events/Sec', value: '150K+' }
      ],
      keyLearnings: [
        'Fan-out on write vs. read is a critical architectural decision for social graphs',
        'Distributed ID generation is essential for globally distributed systems',
        'Caching at multiple layers is crucial for handling read-heavy workloads',
        'Graceful degradation prevents complete failures during traffic spikes'
      ],
      technologies: ['Kafka', 'Storm', 'Hadoop', 'Manhattan'],
      references: [
        { title: 'Twitter Engineering: The Infrastructure Behind Twitter Scale', url: 'https://blog.twitter.com/engineering/en_us/topics/infrastructure' },
        { title: 'Twitter Engineering: Manhattan - Real-Time, Multi-Tenant Distributed Database', url: 'https://blog.twitter.com/engineering/en_us/a/2014/manhattan-our-real-time-multi-tenant-distributed-database-for-twitter-scale' }
      ]
    },
    {
      id: 'pinterest',
      company: 'Pinterest',
      industry: 'Social Discovery',
      logo: '📌',
      color: '#e60023',
      title: 'Visual Discovery at Scale',
      subtitle: 'Processing billions of Pins for personalized discovery',
      architectureType: 'Lambda Architecture + ML Pipelines',
      challenge: 'Pinterest needed to process billions of Pins and user interactions to power visual search, personalized recommendations, and shopping features while scaling ML inference to handle millions of requests per second.',
      solution: 'Pinterest built a comprehensive data platform combining Apache Kafka for real-time events, Apache Spark for batch processing, and custom ML infrastructure for visual understanding and recommendations at scale.',
      implementation: [
        'Apache Kafka processes billions of events daily for real-time features',
        'Apache Spark powers batch ML training and data transformations',
        'Apache Flink handles real-time feature computation for ML models',
        'Custom visual embedding service processes billions of images',
        'Apache Druid provides real-time analytics for business metrics'
      ],
      keyMetrics: [
        { label: 'Monthly Users', value: '450M+' },
        { label: 'Pins', value: '300B+' },
        { label: 'ML Predictions/Sec', value: '10M+' },
        { label: 'Visual Searches/Day', value: '600M+' }
      ],
      keyLearnings: [
        'Visual ML at scale requires specialized infrastructure for embeddings',
        'Feature freshness significantly impacts recommendation quality',
        'A/B testing infrastructure is critical for ML-driven products',
        'Batch-computed features complement real-time features for ML models'
      ],
      technologies: ['Kafka', 'Spark', 'Flink', 'Druid', 'S3'],
      references: [
        { title: 'Pinterest Engineering: Real-time User Signal Serving for Feature Engineering', url: 'https://medium.com/pinterest-engineering/real-time-user-signal-serving-for-feature-engineering-ead9a01e5b' },
        { title: 'Pinterest Engineering: A Decade of AI Platform at Pinterest', url: 'https://medium.com/pinterest-engineering/a-decade-of-ai-platform-at-pinterest-4e3b37c0f758' }
      ]
    },
    {
      id: 'grab',
      company: 'Grab',
      industry: 'Super App (Ride-hailing, Food, Payments)',
      logo: '🚕',
      color: '#00b14f',
      title: 'Southeast Asia\'s Super App Data Platform',
      subtitle: 'Unified data platform for ride-hailing, food delivery, and fintech',
      architectureType: 'Streaming Architecture + Event-Driven',
      challenge: 'Grab needed to build a unified data platform supporting multiple business verticals (transportation, food delivery, payments, insurance) across Southeast Asia with varying data regulations and infrastructure maturity levels.',
      solution: 'Grab built "Trident," a unified data streaming platform based on Apache Kafka that powers real-time features across all business lines while maintaining data governance and compliance across different countries.',
      implementation: [
        'Apache Kafka serves as the backbone for all real-time events across business units',
        'Apache Flink powers real-time ETAs, surge pricing, and fraud detection',
        'Apache Spark handles batch processing for ML model training and reporting',
        'Presto enables interactive queries across their data lake',
        'Custom data catalog ensures data discoverability and governance'
      ],
      keyMetrics: [
        { label: 'Daily Rides', value: '10M+' },
        { label: 'Countries', value: '8' },
        { label: 'GrabPay Transactions', value: 'Billions' },
        { label: 'Events/Sec', value: '100K+' }
      ],
      keyLearnings: [
        'Unified data platform enables cross-business-unit insights and features',
        'Regional data regulations require flexible data residency solutions',
        'Multi-tenant data platforms need strong access controls and governance',
        'Schema management is critical when many teams produce and consume data'
      ],
      technologies: ['Kafka', 'Flink', 'Spark', 'Presto', 'S3'],
      references: [
        { title: 'Grab Engineering: Trident - Real-Time Event Streaming Platform', url: 'https://engineering.grab.com/trident-real-time-event-processing-at-scale' },
        { title: 'Grab Engineering: Data Platform Evolution', url: 'https://engineering.grab.com/' }
      ]
    },
    {
      id: 'reddit',
      company: 'Reddit',
      industry: 'Social Media & Community',
      logo: '🤖',
      color: '#ff4500',
      title: 'Community-Scale Content Processing',
      subtitle: 'Real-time content ranking and moderation',
      architectureType: 'Lambda Architecture + Event-Driven',
      challenge: 'Reddit processes billions of votes, comments, and posts daily, requiring real-time content ranking, spam detection, and personalized feed generation while respecting community-specific rules and moderation policies.',
      solution: 'Reddit built a data platform combining Apache Kafka for real-time events, Apache Flink for stream processing, and Apache Spark for batch analytics. Their architecture supports both platform-wide features and community-specific customizations.',
      implementation: [
        'Apache Kafka streams all user interactions (votes, comments, posts)',
        'Apache Flink computes real-time content scores and trending topics',
        'Apache Spark powers batch ML training for content recommendations',
        'Apache Druid provides real-time analytics for community insights',
        'Custom content safety models process posts for policy violations'
      ],
      keyMetrics: [
        { label: 'Daily Active Users', value: '50M+' },
        { label: 'Communities', value: '100K+' },
        { label: 'Posts/Day', value: 'Millions' },
        { label: 'Comments/Day', value: 'Billions' }
      ],
      keyLearnings: [
        'Community-specific ranking requires flexible, multi-tenant algorithms',
        'Content moderation at scale benefits from ML-assisted workflows',
        'Vote manipulation detection requires sophisticated anomaly detection',
        'Caching is essential for hot content (viral posts, AMAs)'
      ],
      technologies: ['Kafka', 'Flink', 'Spark', 'Druid', 'S3'],
      references: [
        { title: 'Reddit Engineering: Data Science at Reddit', url: 'https://www.reddit.com/r/RedditEng/' },
        { title: 'Reddit Engineering Blog', url: 'https://redditinc.com/blog' }
      ]
    },
    {
      id: 'microsoft',
      company: 'Microsoft',
      industry: 'Technology',
      logo: '🪟',
      color: '#00a4ef',
      title: 'Azure Synapse Analytics',
      subtitle: 'Unified analytics service for enterprises',
      architectureType: 'Unified Batch & Stream (Lakehouse)',
      challenge: 'Microsoft needed to provide enterprise customers with a unified analytics platform that combines data warehousing, big data analytics, and data integration while maintaining compatibility with existing tools and workloads.',
      solution: 'Microsoft built Azure Synapse Analytics, a unified analytics service that brings together data integration, enterprise data warehousing, and big data analytics. It supports both serverless and provisioned resources with T-SQL, Spark, and Data Explorer.',
      implementation: [
        'Azure Synapse pipelines provide data integration and ETL/ELT workflows',
        'Dedicated SQL pools deliver enterprise data warehouse performance',
        'Apache Spark pools enable big data processing with notebook experiences',
        'Serverless SQL enables queries directly on data lake files (Parquet, CSV, JSON)',
        'Azure Data Explorer handles time-series and log analytics'
      ],
      keyMetrics: [
        { label: 'Enterprise Customers', value: '1000s' },
        { label: 'Azure Regions', value: '60+' },
        { label: 'Integrated Services', value: '100+' },
        { label: 'Query Performance', value: 'Petabyte-scale' }
      ],
      keyLearnings: [
        'Unified experiences reduce tool sprawl and training costs',
        'Serverless options enable cost-effective exploration workloads',
        'Deep integrations with existing tools (Power BI, Excel) drive adoption',
        'Enterprise security and compliance features are non-negotiable'
      ],
      technologies: ['Spark', 'Synapse', 'ADLS', 'Power BI'],
      references: [
        { title: 'Azure Synapse Analytics Documentation', url: 'https://docs.microsoft.com/en-us/azure/synapse-analytics/' },
        { title: 'Microsoft Learn: Big Data Architectures', url: 'https://learn.microsoft.com/en-us/azure/architecture/databases/guide/big-data-architectures' }
      ]
    },
    {
      id: 'tesla',
      company: 'Tesla',
      industry: 'Automotive & Energy',
      logo: '🚗',
      color: '#cc0000',
      title: 'Autonomous Driving Data Pipeline',
      subtitle: 'Petabytes of video data for AI training',
      architectureType: 'Batch Architecture + ML Pipelines',
      challenge: 'Tesla collects petabytes of video and sensor data from millions of vehicles daily, requiring massive-scale storage, processing, and ML training infrastructure to improve autonomous driving capabilities.',
      solution: 'Tesla built Dojo, their custom supercomputer, alongside a massive data pipeline that ingests vehicle telemetry, processes video data, and trains neural networks. Their data labeling and training infrastructure processes billions of video frames.',
      implementation: [
        'Custom data ingestion from millions of vehicles via cellular networks',
        'Massive object storage for raw video and processed training data',
        'Dojo supercomputer with custom D1 chips for training at unprecedented scale',
        'Auto-labeling pipelines reduce manual annotation requirements',
        'Shadow mode enables safe real-world testing of new models'
      ],
      keyMetrics: [
        { label: 'Connected Vehicles', value: '5M+' },
        { label: 'Training Data', value: 'Billions of frames' },
        { label: 'Dojo Compute', value: 'Exaflops' },
        { label: 'Miles Driven/Day', value: 'Millions' }
      ],
      keyLearnings: [
        'Proprietary data at scale creates significant competitive advantages',
        'Custom hardware can provide 10x+ efficiency gains for specific workloads',
        'Shadow mode enables safe iteration on safety-critical systems',
        'Edge-to-cloud data pipelines must handle intermittent connectivity'
      ],
      technologies: ['Custom Infrastructure', 'S3', 'Spark'],
      references: [
        { title: 'Tesla AI Day Presentation', url: 'https://www.tesla.com/AI' },
        { title: 'Tesla Dojo Supercomputer', url: 'https://en.wikipedia.org/wiki/Tesla_Dojo' }
      ]
    },
    {
      id: 'anthropic',
      company: 'Anthropic',
      industry: 'AI Research',
      logo: '🧠',
      color: '#d4a574',
      title: 'Large Language Model Training Infrastructure',
      subtitle: 'Constitutional AI training at scale',
      architectureType: 'Batch Architecture + Distributed ML',
      challenge: 'Anthropic needed to build infrastructure for training large language models with a focus on AI safety, requiring massive-scale distributed training across thousands of GPUs while implementing constitutional AI training methods.',
      solution: 'Anthropic built sophisticated ML infrastructure for training Claude models, combining distributed training frameworks, large-scale data processing pipelines, and unique constitutional AI training methodologies.',
      implementation: [
        'Distributed training across thousands of GPUs using custom orchestration',
        'Large-scale data processing pipelines for training data preparation',
        'Constitutional AI (CAI) training infrastructure for safety alignment',
        'Reinforcement Learning from Human Feedback (RLHF) training systems',
        'Evaluation infrastructure for model capability and safety assessments'
      ],
      keyMetrics: [
        { label: 'Model Parameters', value: '100B+' },
        { label: 'Training Compute', value: 'Massive GPU clusters' },
        { label: 'Data Processing', value: 'Petabytes' },
        { label: 'Safety Evaluations', value: 'Continuous' }
      ],
      keyLearnings: [
        'AI safety must be designed into the training pipeline, not added later',
        'Constitutional AI enables scalable alignment without extensive human feedback',
        'Model evaluation infrastructure is as important as training infrastructure',
        'Reproducibility and auditability are critical for responsible AI development'
      ],
      technologies: ['Custom ML Infrastructure', 'S3', 'Spark'],
      references: [
        { title: 'Anthropic Research: Constitutional AI', url: 'https://www.anthropic.com/research' },
        { title: 'Constitutional AI Paper', url: 'https://arxiv.org/abs/2212.08073' }
      ]
    },
    {
      id: 'openai',
      company: 'OpenAI',
      industry: 'AI Research',
      logo: '🤖',
      color: '#00a67e',
      title: 'GPT Training Infrastructure',
      subtitle: 'Scaling language models to trillions of parameters',
      architectureType: 'Batch Architecture + Distributed ML',
      challenge: 'OpenAI needed to train the largest language models in the world, requiring unprecedented scale of distributed training across tens of thousands of GPUs with high utilization and fault tolerance.',
      solution: 'OpenAI built custom training infrastructure in partnership with Microsoft Azure, utilizing massive GPU clusters and custom optimization techniques. Their infrastructure supports training models with hundreds of billions to trillions of parameters.',
      implementation: [
        'Partnership with Microsoft Azure for massive GPU cluster access',
        'Custom distributed training frameworks optimized for transformer architectures',
        'Large-scale web crawling and data processing for training data',
        'RLHF infrastructure for aligning models with human preferences',
        'Scalable inference infrastructure for ChatGPT serving millions of users'
      ],
      keyMetrics: [
        { label: 'GPT-4 Parameters', value: '~1.7T (rumored)' },
        { label: 'ChatGPT Users', value: '100M+' },
        { label: 'Training Compute', value: '10,000+ GPUs' },
        { label: 'API Requests/Day', value: 'Billions' }
      ],
      keyLearnings: [
        'Scaling compute often yields emergent capabilities in large models',
        'Infrastructure must handle both training (batch) and inference (real-time)',
        'Rate limiting and usage policies are essential for responsible deployment',
        'Continuous safety monitoring is required for publicly deployed AI systems'
      ],
      technologies: ['Azure', 'Custom ML Infrastructure', 'Kubernetes'],
      references: [
        { title: 'OpenAI: Scaling Laws for Neural Language Models', url: 'https://openai.com/research/scaling-laws-for-neural-language-models' },
        { title: 'GPT-4 Technical Report', url: 'https://openai.com/research/gpt-4' }
      ]
    },
    {
      id: 'spotify',
      company: 'Spotify',
      industry: 'Music Streaming',
      logo: '🎵',
      color: '#1db954',
      title: 'Personalized Music Discovery',
      subtitle: 'Discover Weekly reaching 500M+ users',
      architectureType: 'Lambda Architecture + ML Pipelines',
      challenge: 'Spotify processes billions of listening events daily to power personalized features like Discover Weekly, Daily Mix, and Wrapped while supporting 500+ million users and 100+ million tracks.',
      solution: 'Spotify built a sophisticated data platform with Google Cloud infrastructure, Apache Beam for unified batch/stream processing, and extensive ML infrastructure. Their architecture processes 600B+ events daily for features like Discover Weekly.',
      implementation: [
        'Google Cloud Dataflow (Apache Beam) unifies batch and stream processing',
        'Apache Kafka handles real-time event streaming from all user interactions',
        'Google BigQuery powers analytics and ML feature computation',
        'Luigi (created at Spotify) orchestrates batch job dependencies',
        'Custom ML platform trains and serves recommendation models at scale'
      ],
      keyMetrics: [
        { label: 'Monthly Users', value: '500M+' },
        { label: 'Tracks', value: '100M+' },
        { label: 'Events/Day', value: '600B+' },
        { label: 'Discover Weekly Users', value: '150M+' }
      ],
      keyLearnings: [
        'Unified batch/stream processing (Beam) simplifies development significantly',
        'User-generated playlists provide valuable collaborative filtering signals',
        'Audio features (tempo, energy) complement behavioral data for recommendations',
        'Personalization at scale requires both offline model training and real-time features'
      ],
      technologies: ['Kafka', 'BigQuery', 'Dataflow', 'GCS', 'Spark'],
      references: [
        { title: 'Spotify Engineering: Discover Weekly Recommendations', url: 'https://engineering.atspotify.com/' },
        { title: 'Luigi: Workflow Orchestration', url: 'https://github.com/spotify/luigi' }
      ]
    }
  ];

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

  // Helper function to calculate progress
  const calculateProgress = () => {
    const totalLevels = curriculumData.phases.reduce((acc, phase) => acc + phase.levels.length, 0);
    return totalLevels > 0 ? Math.round((completedLevels.length / totalLevels) * 100) : 0;
  };

  const calculatePhaseProgress = (phaseId) => {
    const phase = curriculumData.phases.find(p => p.id === phaseId);
    if (!phase) return 0;
    const phaseCompletedLevels = phase.levels.filter(level => completedLevels.includes(level.id));
    return phase.levels.length > 0 ? Math.round((phaseCompletedLevels.length / phase.levels.length) * 100) : 0;
  };

  const isLevelCompleted = (levelId) => completedLevels.includes(levelId);

  const toggleLevelCompletion = (levelId) => {
    setCompletedLevels(prev => {
      if (prev.includes(levelId)) {
        return prev.filter(id => id !== levelId);
      } else {
        return [...prev, levelId];
      }
    });
  };

  // Render Curriculum Section
  const renderCurriculumSection = () => {
    const currentPhase = curriculumData.phases.find(p => p.id === activePhase);
    const currentLevel = selectedLevel ? currentPhase?.levels.find(l => l.id === selectedLevel) : null;
    const progress = calculateProgress();
    const phaseProgress = calculatePhaseProgress(activePhase);

    return (
      <div id="curriculum-section" style={{ animation: 'fadeInSlideDown 0.5s ease-out' }}>
        {/* Curriculum Header */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px', color: '#f59e0b' }}>
                {curriculumData.title}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '16px' }}>
                {curriculumData.subtitle}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                {progress}%
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Overall Progress</div>
            </div>
          </div>
          {/* Overall Progress Bar */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '8px',
            height: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #f59e0b, #d97706)',
              height: '100%',
              width: `${progress}%`,
              borderRadius: '8px',
              transition: 'width 0.5s ease-out',
              animation: 'progressFill 1s ease-out'
            }} />
          </div>
        </div>

        {/* Phase Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {curriculumData.phases.map(phase => {
            const isActive = activePhase === phase.id;
            const pProgress = calculatePhaseProgress(phase.id);
            const colors = phaseColors[phase.id];

            return (
              <button
                key={phase.id}
                onClick={() => {
                  setActivePhase(phase.id);
                  setSelectedLevel(null);
                }}
                style={{
                  padding: '12px 20px',
                  minWidth: '160px',
                  background: isActive
                    ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`
                    : colors.light,
                  border: `2px solid ${isActive ? colors.primary : colors.border}`,
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = `${colors.primary}33`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = colors.light;
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px' }}>{phaseIcons[phase.icon]}</span>
                  <span>Phase {phase.id}</span>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '8px' }}>{phase.name}</div>
                {/* Mini progress bar */}
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '4px',
                  height: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#ffffff',
                    height: '100%',
                    width: `${pProgress}%`,
                    borderRadius: '4px',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Phase Header */}
        {currentPhase && (
          <div style={{
            background: phaseColors[activePhase].light,
            border: `1px solid ${phaseColors[activePhase].border}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px' }}>{phaseIcons[currentPhase.icon]}</span>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: phaseColors[activePhase].primary }}>
                  Phase {currentPhase.id}: {currentPhase.name}
                </h3>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>{currentPhase.subtitle}</p>
              </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '15px', marginBottom: '12px' }}>
              <strong style={{ color: phaseColors[activePhase].primary }}>Goal:</strong> {currentPhase.goal}
            </p>
            {/* Phase Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                flex: 1,
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '6px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: phaseColors[activePhase].primary,
                  height: '100%',
                  width: `${phaseProgress}%`,
                  borderRadius: '6px',
                  transition: 'width 0.5s'
                }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: phaseColors[activePhase].primary }}>
                {phaseProgress}%
              </span>
            </div>
          </div>
        )}

        {/* Levels Grid and Detail Panel */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Levels Grid */}
          <div style={{ flex: selectedLevel ? '0 0 350px' : '1', minWidth: '300px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentPhase?.levels.map((level, idx) => {
                const isCompleted = isLevelCompleted(level.id);
                const isSelected = selectedLevel === level.id;
                const hasBossFight = !!level.bossFight;
                const hasMicroTask = !!level.microTask;

                return (
                  <div
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    style={{
                      background: isSelected
                        ? `${phaseColors[activePhase].primary}22`
                        : 'rgba(15, 23, 42, 0.8)',
                      border: `2px solid ${isSelected ? phaseColors[activePhase].primary : isCompleted ? '#10b981' : 'rgba(71, 85, 105, 0.3)'}`,
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      animation: `levelUnlock 0.4s ease-out ${idx * 0.1}s both`
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = phaseColors[activePhase].primary;
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = isCompleted ? '#10b981' : 'rgba(71, 85, 105, 0.3)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{
                            background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : phaseColors[activePhase].light,
                            border: `1px solid ${isCompleted ? '#10b981' : phaseColors[activePhase].border}`,
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: isCompleted ? '#10b981' : phaseColors[activePhase].primary
                          }}>
                            Level {level.id}
                          </span>
                          {isCompleted && (
                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={16} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#ffffff' }}>
                          {level.name}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '12px' }}>
                          {level.concept.substring(0, 120)}...
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {hasBossFight && (
                            <span style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Sparkles size={12} /> Boss Fight
                            </span>
                          )}
                          {hasMicroTask && (
                            <span style={{
                              background: 'rgba(6, 182, 212, 0.15)',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#06b6d4',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Zap size={12} /> Micro-Task
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={20} color={isSelected ? phaseColors[activePhase].primary : '#64748b'} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level Detail Panel */}
          {currentLevel && (
            <div style={{
              flex: '1',
              minWidth: '400px',
              background: 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${phaseColors[activePhase].border}`,
              borderRadius: '12px',
              padding: '24px',
              animation: 'fadeInScale 0.3s ease-out',
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto'
            }}>
              {/* Level Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <span style={{
                    background: phaseColors[activePhase].light,
                    border: `1px solid ${phaseColors[activePhase].border}`,
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: phaseColors[activePhase].primary,
                    marginBottom: '8px',
                    display: 'inline-block'
                  }}>
                    Level {currentLevel.id}
                  </span>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginTop: '8px' }}>
                    {currentLevel.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLevel(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '8px'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Concept Section */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#60a5fa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={16} /> Concept
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7' }}>
                  {currentLevel.concept}
                </p>
              </div>

              {/* Why It Matters */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} /> Why This Matters
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7' }}>
                  {currentLevel.whyItMatters}
                </p>
              </div>

              {/* Analogy */}
              {currentLevel.analogy && (
                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#a78bfa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} /> Think of it like...
                  </h4>
                  <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', fontStyle: 'italic' }}>
                    "{currentLevel.analogy}"
                  </p>
                </div>
              )}

              {/* Code Example */}
              {currentLevel.codeExample && (
                <div style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#fbbf24', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ScrollText size={16} /> Code Example ({currentLevel.codeExample.language})
                  </h4>
                  <pre style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '6px',
                    padding: '16px',
                    overflow: 'auto',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    color: '#e2e8f0',
                    fontFamily: 'monospace'
                  }}>
                    <code>{currentLevel.codeExample.code}</code>
                  </pre>
                </div>
              )}

              {/* References */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={16} /> Learning Resources
                </h4>
                <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                  {currentLevel.references.map((ref, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#10b981',
                          textDecoration: 'none',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#34d399'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#10b981'}
                      >
                        <ChevronRight size={14} />
                        {ref.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Boss Fight */}
              {currentLevel.bossFight && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#ef4444',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <Sparkles size={20} /> BOSS FIGHT: {currentLevel.bossFight.name}
                  </h4>
                  <p style={{ color: '#fca5a5', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }}>
                    {currentLevel.bossFight.description}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <h5 style={{ fontSize: '12px', fontWeight: '600', color: '#f87171', marginBottom: '6px' }}>INPUT</h5>
                      <p style={{ color: '#fecaca', fontSize: '13px' }}>{currentLevel.bossFight.input}</p>
                    </div>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <h5 style={{ fontSize: '12px', fontWeight: '600', color: '#f87171', marginBottom: '6px' }}>EXPECTED OUTPUT</h5>
                      <p style={{ color: '#fecaca', fontSize: '13px' }}>{currentLevel.bossFight.expectedOutput}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Micro Task */}
              {currentLevel.microTask && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.1) 100%)',
                  border: '2px solid rgba(6, 182, 212, 0.4)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#06b6d4',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <Zap size={20} /> MICRO-TASK: {currentLevel.microTask.name}
                  </h4>
                  <p style={{ color: '#67e8f9', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }}>
                    {currentLevel.microTask.description}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <h5 style={{ fontSize: '12px', fontWeight: '600', color: '#22d3ee', marginBottom: '6px' }}>INPUT</h5>
                      <p style={{ color: '#a5f3fc', fontSize: '13px' }}>{currentLevel.microTask.input}</p>
                    </div>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <h5 style={{ fontSize: '12px', fontWeight: '600', color: '#22d3ee', marginBottom: '6px' }}>EXPECTED OUTPUT</h5>
                      <p style={{ color: '#a5f3fc', fontSize: '13px' }}>{currentLevel.microTask.expectedOutput}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mark Complete Button */}
              <button
                onClick={() => toggleLevelCompletion(currentLevel.id)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: isLevelCompleted(currentLevel.id)
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                  border: `2px solid ${isLevelCompleted(currentLevel.id) ? '#10b981' : 'rgba(16, 185, 129, 0.5)'}`,
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isLevelCompleted(currentLevel.id) ? (
                  <>
                    <Check size={20} strokeWidth={3} /> Level Complete!
                  </>
                ) : (
                  <>
                    <Check size={20} /> Mark as Complete
                  </>
                )}
              </button>
            </div>
          )}
        </div>
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

          {/* Navigation Section */}
          <div style={{ marginBottom: '24px' }}>
            {/* Two-column navigation layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '32px',
              alignItems: 'start'
            }}>
              {/* Architecture Patterns Group */}
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <h3 style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}>
                    Architecture Patterns
                  </h3>
                  <p style={{ fontSize: '12px', color: '#475569' }}>
                    Select a data architecture to explore
                  </p>
                </div>
                <div style={{
                  display: 'inline-flex',
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '12px',
                  padding: '4px',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}>
              {Object.keys(architectures).filter(key => key !== 'blockchain').map(key => {
                const isActive = activeArchitecture === key && !showAdditionalInfo && !showHandsOn && !showCurriculum && !showCaseStudies;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveArchitecture(key);
                      setSelectedComponent(null);
                      setShowAdditionalInfo(false);
                      setShowHandsOn(false);
                      setShowCurriculum(false);
                      setShowCaseStudies(false);
                    }}
                    style={{
                      padding: '10px 20px',
                      background: isActive ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#94a3b8';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {architectures[key].name}
                  </button>
                );
              })}
                </div>
              </div>

              {/* Learning Resources Group */}
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <h3 style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}>
                    Learning Resources
                  </h3>
                  <p style={{ fontSize: '12px', color: '#475569' }}>
                    Explore guides, tutorials, and real-world examples
                  </p>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px'
                }}>
              {/* Additional Info Card */}
              <button
                onClick={() => {
                  setShowAdditionalInfo(!showAdditionalInfo);
                  setShowHandsOn(false);
                  setShowCurriculum(false);
                  setShowCaseStudies(false);
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
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 12px',
                  background: showAdditionalInfo
                    ? 'rgba(139, 92, 246, 0.2)'
                    : 'rgba(30, 41, 59, 0.4)',
                  border: showAdditionalInfo
                    ? '1px solid rgba(139, 92, 246, 0.5)'
                    : '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  color: showAdditionalInfo ? '#a78bfa' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!showAdditionalInfo) {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                    e.currentTarget.style.color = '#a78bfa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showAdditionalInfo) {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Info</span>
              </button>

              {/* Hands-on Card */}
              <button
                onClick={() => {
                  setShowHandsOn(!showHandsOn);
                  setShowAdditionalInfo(false);
                  setShowCurriculum(false);
                  setShowCaseStudies(false);
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
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 12px',
                  background: showHandsOn
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(30, 41, 59, 0.4)',
                  border: showHandsOn
                    ? '1px solid rgba(16, 185, 129, 0.5)'
                    : '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  color: showHandsOn ? '#10b981' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!showHandsOn) {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                    e.currentTarget.style.color = '#10b981';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showHandsOn) {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
                <span>Hands-on</span>
              </button>

              {/* Curriculum Card */}
              <button
                onClick={() => {
                  setShowCurriculum(!showCurriculum);
                  setShowAdditionalInfo(false);
                  setShowHandsOn(false);
                  setShowCaseStudies(false);
                  if (!showCurriculum) {
                    setTimeout(() => {
                      const curriculumSection = document.getElementById('curriculum-section');
                      if (curriculumSection) {
                        curriculumSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 12px',
                  background: showCurriculum
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(30, 41, 59, 0.4)',
                  border: showCurriculum
                    ? '1px solid rgba(245, 158, 11, 0.5)'
                    : '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  color: showCurriculum ? '#f59e0b' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!showCurriculum) {
                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                    e.currentTarget.style.color = '#f59e0b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showCurriculum) {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
                <span>Curriculum</span>
              </button>

              {/* Case Studies Card */}
              <button
                onClick={() => {
                  setShowCaseStudies(!showCaseStudies);
                  setShowAdditionalInfo(false);
                  setShowHandsOn(false);
                  setShowCurriculum(false);
                  if (!showCaseStudies) {
                    setTimeout(() => {
                      const caseStudiesSection = document.getElementById('case-studies-section');
                      if (caseStudiesSection) {
                        caseStudiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 12px',
                  background: showCaseStudies
                    ? 'rgba(236, 72, 153, 0.2)'
                    : 'rgba(30, 41, 59, 0.4)',
                  border: showCaseStudies
                    ? '1px solid rgba(236, 72, 153, 0.5)'
                    : '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  color: showCaseStudies ? '#ec4899' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!showCaseStudies) {
                    e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.3)';
                    e.currentTarget.style.color = '#ec4899';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showCaseStudies) {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <span>Case Studies</span>
              </button>
                </div>
              </div>
            </div>
          </div>

          {!showAdditionalInfo && !showHandsOn && !showCurriculum && !showCaseStudies && (
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
                    <li>Build real-time dashboards with Next.js 16 and Turbopack</li>
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
                          <code>./scripts/start.sh</code>
                        </pre>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Initial setup: 15-20 minutes (Docker downloads), subsequent starts: 30-60 seconds</span>
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#f59e0b' }}>Access dashboard:</strong> Open{' '}
                        <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'underline' }}>
                          http://localhost:3001
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
                        <li>Exploring the Next.js dashboard (ingestion rate, countdown timer, data preview)</li>
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
                      <strong style={{ color: '#6366f1' }}>EXERCISES.md:</strong>{' '}
                      <a
                        href="https://github.com/maruthiprithivi/big_data_architecture/blob/main/docs/EXERCISES.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#10b981', textDecoration: 'underline' }}
                      >
                        Complete exercise instructions
                      </a>
                    </p>
                    <p style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#6366f1' }}>SAMPLE_QUERIES.md:</strong>{' '}
                      <a
                        href="https://github.com/maruthiprithivi/big_data_architecture/blob/main/docs/SAMPLE_QUERIES.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#10b981', textDecoration: 'underline' }}
                      >
                        SQL query examples
                      </a>
                    </p>
                    <p style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#6366f1' }}>GLOSSARY.md:</strong>{' '}
                      <a
                        href="https://github.com/maruthiprithivi/big_data_architecture/blob/main/docs/GLOSSARY.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#10b981', textDecoration: 'underline' }}
                      >
                        Blockchain terminology reference
                      </a>
                    </p>
                    <p style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#6366f1' }}>API Documentation:</strong>{' '}
                      <a
                        href="http://localhost:8000/docs"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#10b981', textDecoration: 'underline' }}
                      >
                        Interactive Swagger UI at localhost:8000/docs
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {showCurriculum && renderCurriculumSection()}

          {showCaseStudies && (
            <div
              id="case-studies-section"
              style={{
                animation: 'fadeInScale 0.3s ease-out forwards'
              }}
            >
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  padding: '32px',
                  marginBottom: '24px'
                }}
              >
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px', color: '#ec4899' }}>
                    Real-World Big Data Case Studies
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.7', maxWidth: '900px' }}>
                    Learn how industry leaders like Netflix, Uber, Airbnb, Google, and more have built and scaled their big data architectures.
                    These case studies provide insights into real production systems processing billions of events daily,
                    offering valuable lessons in architecture patterns, technology choices, and operational best practices.
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                  gap: '24px'
                }}>
                  {caseStudies.map((study) => (
                    <div
                      key={study.id}
                      style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: `2px solid ${study.color}33`,
                        borderRadius: '16px',
                        padding: '24px',
                        transition: 'all 0.3s',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${study.color}66`;
                        e.currentTarget.style.boxShadow = `0 8px 32px ${study.color}22`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${study.color}33`;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            fontSize: '32px',
                            width: '56px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `${study.color}22`,
                            borderRadius: '12px',
                            border: `1px solid ${study.color}44`
                          }}>
                            {study.logo}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginBottom: '2px' }}>
                              {study.company}
                            </h3>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{study.industry}</span>
                          </div>
                        </div>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: `${study.color}22`,
                          color: study.color,
                          border: `1px solid ${study.color}44`,
                          whiteSpace: 'nowrap'
                        }}>
                          {study.architectureType}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>
                        {study.title}
                      </h4>
                      <p style={{ fontSize: '14px', color: study.color, marginBottom: '16px', fontWeight: '500' }}>
                        {study.subtitle}
                      </p>

                      {/* Key Metrics */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '12px',
                        marginBottom: '20px',
                        padding: '16px',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '12px'
                      }}>
                        {study.keyMetrics.map((metric, idx) => (
                          <div key={idx} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: study.color }}>{metric.value}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{metric.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Challenge */}
                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#fbbf24', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>🎯</span> Challenge
                        </h5>
                        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                          {study.challenge}
                        </p>
                      </div>

                      {/* Solution */}
                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>💡</span> Solution
                        </h5>
                        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                          {study.solution}
                        </p>
                      </div>

                      {/* Implementation Details */}
                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#60a5fa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>🔧</span> Implementation
                        </h5>
                        <ul style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.8', paddingLeft: '16px', margin: 0 }}>
                          {study.implementation.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Key Learnings */}
                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#a78bfa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>📚</span> Key Learnings
                        </h5>
                        <ul style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.8', paddingLeft: '16px', margin: 0 }}>
                          {study.keyLearnings.map((learning, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{learning}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Technologies */}
                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#f472b6', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>🛠️</span> Technologies
                        </h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {study.technologies.map((tech, idx) => {
                            const url = technologyUrls[tech];
                            const techStyle = {
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '500',
                              background: 'rgba(59, 130, 246, 0.15)',
                              color: '#60a5fa',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              textDecoration: 'none',
                              transition: 'all 0.2s'
                            };
                            return url ? (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={techStyle}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                {tech}
                              </a>
                            ) : (
                              <span key={idx} style={techStyle}>{tech}</span>
                            );
                          })}
                        </div>
                      </div>

                      {/* References */}
                      <div>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>🔗</span> References
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {study.references.map((ref, idx) => (
                            <a
                              key={idx}
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '12px',
                                color: '#60a5fa',
                                textDecoration: 'none',
                                transition: 'color 0.2s',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#93c5fd'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
                            >
                              <ChevronRight size={12} />
                              {ref.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Section */}
                <div style={{
                  marginTop: '40px',
                  padding: '32px',
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  borderRadius: '16px'
                }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#ec4899' }}>
                    Common Patterns Across Case Studies
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🔄</span> Event-Driven Architecture
                      </h4>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                        Nearly all case studies leverage Apache Kafka as a central event backbone. Event-driven patterns enable loose coupling,
                        real-time processing, and replay capabilities for reprocessing historical data.
                      </p>
                    </div>

                    <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚡</span> Hybrid Batch + Stream
                      </h4>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                        Most companies combine batch processing (Spark) for ML training and historical analysis with stream processing (Flink/Kafka Streams)
                        for real-time features, following Lambda or Kappa architecture patterns.
                      </p>
                    </div>

                    <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#60a5fa', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🗄️</span> Separation of Storage & Compute
                      </h4>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                        Cloud data lakes (S3, GCS, ADLS) separate storage from compute, enabling independent scaling, cost optimization,
                        and flexibility in choosing processing engines for different workloads.
                      </p>
                    </div>

                    <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#a78bfa', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🤖</span> ML-Integrated Pipelines
                      </h4>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                        Data pipelines are designed with ML in mind: feature stores bridge batch training and real-time inference,
                        while experimentation platforms enable rapid iteration on models and algorithms.
                      </p>
                    </div>

                    <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#ec4899', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📊</span> Real-Time OLAP
                      </h4>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                        Apache Druid, Pinot, and ClickHouse appear frequently for real-time analytics, providing sub-second query latency
                        on streaming data for dashboards and user-facing features.
                      </p>
                    </div>

                    <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fbbf24', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🔒</span> Data Governance at Scale
                      </h4>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                        As data volumes grow, governance becomes critical. Companies invest in data catalogs, schema registries,
                        data contracts, and access controls to maintain data quality and compliance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
