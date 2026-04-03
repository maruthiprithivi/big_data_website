import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Database, Inbox, Cpu, Activity, HardDrive, Zap,
  Globe, Cloud, GitMerge, LayoutDashboard, ScrollText,
  ChevronRight, Check, Sparkles, Info, ChevronDown, ChevronUp, X,
  Table2, Layers, Link, Star, Snowflake, Box,
  ArrowRight, Eye, EyeOff
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
      batch: 1340,
      star: 960,
      snowflake: 1100,
      mapreduce: 1100,
      spark: 1100
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

  // Schema tooltip state
  const [hoveredSchemaComponent, setHoveredSchemaComponent] = useState(null);
  // Hovered FK-PK connection line state
  const [hoveredConnection, setHoveredConnection] = useState(null);

  // Case Studies section state
  const [showCaseStudies, setShowCaseStudies] = useState(false);
  const [completedLevels, setCompletedLevels] = useState(() => {
    const saved = localStorage.getItem('curriculumCompletedLevels');
    return saved ? JSON.parse(saved) : [];
  });

  // MapReduce interactive states
  const [mapReduceStep, setMapReduceStep] = useState(0); // 0 = show all, 1-7 = specific step
  const [showMapReduceExample, setShowMapReduceExample] = useState(false);
  const showDataTransform = true; // always show contextual step annotations

  // Spark interactive states
  const [sparkStep, setSparkStep] = useState(0);

  // MapReduce vs Spark comparison state
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonHighlight, setComparisonHighlight] = useState(null); // null or 'speed'|'fault'|'data'|'model'

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
    'Looker': 'https://cloud.google.com/looker',
    'YARN': 'https://hadoop.apache.org/docs/stable/hadoop-yarn/hadoop-yarn-site/YARN.html',
    'ZooKeeper': 'https://zookeeper.apache.org/',
    'HDFS': 'https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html',
    'InputFormat': 'https://hadoop.apache.org/docs/stable/api/org/apache/hadoop/mapreduce/InputFormat.html',
    'Combiner': 'https://hadoop.apache.org/docs/stable/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html',
    'Partitioner': 'https://hadoop.apache.org/docs/stable/api/org/apache/hadoop/mapreduce/Partitioner.html',
    'Merge Sort': 'https://en.wikipedia.org/wiki/Merge_sort',
    'Aggregation': 'https://hadoop.apache.org/docs/stable/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html#Reducer',
    'Parquet': 'https://parquet.apache.org/',
    'Hive': 'https://hive.apache.org/',
    'Hadoop Streaming': 'https://hadoop.apache.org/docs/stable/hadoop-streaming/HadoopStreaming.html',
    'Java': 'https://docs.oracle.com/en/java/',
    'Python': 'https://www.python.org/',
    'HTTP': 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    'Spark SQL': 'https://spark.apache.org/sql/',
    'Spark Streaming': 'https://spark.apache.org/streaming/',
    'MLlib': 'https://spark.apache.org/mllib/',
    'GraphX': 'https://spark.apache.org/graphx/',
    'PySpark': 'https://spark.apache.org/docs/latest/api/python/',
    'Scala': 'https://www.scala-lang.org/',
    'Delta Lake': 'https://delta.io/',
    'Catalyst': 'https://databricks.com/glossary/catalyst-optimizer',
    'Tungsten': 'https://databricks.com/glossary/tungsten',
    'RDD': 'https://spark.apache.org/docs/latest/rdd-programming-guide.html',
    'DataFrame': 'https://spark.apache.org/docs/latest/sql-programming-guide.html',
    'Mesos': 'https://mesos.apache.org/',
    'Kubernetes': 'https://kubernetes.io/',
    'Databricks': 'https://www.databricks.com/'
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
          box-shadow: 0 0 0 0 rgba(74, 122, 155, 0.4);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(74, 122, 155, 0);
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
    log: ScrollText,
    fact: Table2,
    dimension: Layers,
    bridge: Link,
    star: Star,
    snowflake: Snowflake,
    aggregate: Box
  };

  const colorScheme = {
    database:  { fill: '#4A5FE3', selected: '#3A4FD3' },
    queue:     { fill: '#C07FD4', selected: '#B06FC4' },
    cluster:   { fill: '#E8654A', selected: '#D8553A' },
    stream:    { fill: '#2A9D99', selected: '#1A8D89' },
    warehouse: { fill: '#4A5FE3', selected: '#3A4FD3' },
    cache:     { fill: '#C07FD4', selected: '#B06FC4' },
    api:       { fill: '#4A5FE3', selected: '#3A4FD3' },
    cloud:     { fill: '#2A9D99', selected: '#1A8D89' },
    pipeline:  { fill: '#C07FD4', selected: '#B06FC4' },
    dashboard: { fill: '#E8654A', selected: '#D8553A' },
    log:       { fill: '#2A9D99', selected: '#1A8D89' },
    fact:      { fill: '#E8654A', selected: '#D8553A' },
    dimension: { fill: '#4A5FE3', selected: '#3A4FD3' },
    bridge:    { fill: '#C07FD4', selected: '#B06FC4' },
    star:      { fill: '#E8654A', selected: '#D8553A' },
    snowflake: { fill: '#2A9D99', selected: '#1A8D89' },
    aggregate: { fill: '#4A5FE3', selected: '#3A4FD3' },
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
    },
    starSchema: {
      name: 'Star Schema',
      difficulty: 'Beginner',
      tagline: 'Denormalized Dimensional Modeling',
      description: 'Star Schema is the most widely used dimensional modeling pattern in data warehousing, introduced by Ralph Kimball. It organizes data into a central fact table surrounded by denormalized dimension tables, forming a star-like shape. The fact table stores quantitative measurements (metrics/events) with foreign keys pointing to dimension tables that provide descriptive context (who, what, when, where, why). Its simplicity makes it the go-to choice for business intelligence, OLAP cubes, and analytical queries where query performance matters more than storage efficiency.',
      layout: 'star',
      overview: {
        text: 'In a Star Schema, the fact table sits at the center and contains the numeric measures of a business process (revenue, quantity, clicks) along with foreign keys to each dimension table. Dimension tables are denormalized—meaning all descriptive attributes are stored in a single flat table rather than being split across multiple normalized tables. For example, a dim_product table contains product_name, category_name, brand_name, and subcategory all in one row, even though category and brand could be separate entities. This denormalization eliminates complex JOINs at query time, enabling fast aggregations. The trade-off is data redundancy: "Electronics" might be stored thousands of times in dim_product. Star schemas are the foundation of tools like Tableau, Power BI, and Looker, which assume this structure for drag-and-drop analytics. Most modern cloud data warehouses (Snowflake, BigQuery, Redshift) are optimized for star schema query patterns.',
        scenario: 'E-Commerce Sales Analytics - Shopify-Scale',
        scenarioDescription: 'An online retail platform tracks every purchase across millions of merchants. The fact_sales table records each transaction with amount, quantity, discount, and tax. Surrounding dimension tables provide context: dim_customer (demographics, segment, lifetime value), dim_product (name, category, brand, price tier), dim_date (day, week, month, quarter, fiscal year, holiday flag), and dim_store (merchant name, region, platform plan). Business analysts use Tableau to answer questions like "What was the revenue by product category per quarter in the West region?" — a query that requires joining the fact table with three dimensions, made fast by the star schema\'s denormalized design.',
        components: [
          { name: 'Fact Table (fact_sales)', metric: 'Millions of transaction rows with sale_amount, quantity, discount, tax, and foreign keys to every dimension' },
          { name: 'Dimension: Customer', metric: 'Denormalized customer profiles with name, email, segment, city, state, country in one flat table' },
          { name: 'Dimension: Product', metric: 'Product catalog with embedded category, brand, and subcategory attributes — no separate lookups needed' },
          { name: 'Dimension: Date', metric: 'Pre-computed date attributes: day_of_week, is_holiday, fiscal_quarter, season for fast time-based analysis' },
          { name: 'Dimension: Store', metric: 'Merchant details with region, plan tier, and join date — denormalized for single-JOIN access' }
        ]
      },
      useCases: [
        'Business intelligence dashboards and reporting',
        'OLAP cube construction and slice-and-dice analysis',
        'Self-service analytics for business users',
        'Data warehouse foundations (Kimball methodology)',
        'Aggregation-heavy queries (SUM, COUNT, AVG by dimensions)'
      ],
      advantages: [
        'Simple and intuitive — easy for business users to understand',
        'Fewer JOINs required — typically one JOIN per dimension',
        'Fast query performance due to denormalized dimensions',
        'Well-supported by all BI tools (Tableau, Power BI, Looker)',
        'Straightforward ETL development with clear patterns',
        'Optimized for read-heavy analytical workloads'
      ],
      challenges: [
        'Data redundancy — dimension attributes duplicated across rows',
        'Not ideal for many-to-many relationships without bridge tables',
        'Dimension updates require careful handling (SCD Type 1/2/3)',
        'Large dimension tables can grow unwieldy without governance',
        'Storage overhead from denormalization (less of an issue with modern columnar storage)'
      ],
      gotchas: [
        'Don\'t put measures in dimension tables — facts hold numbers, dimensions hold context',
        'Avoid "junk dimensions" by grouping low-cardinality flags into a single dimension',
        'Date dimensions should ALWAYS be a separate table, not just a date column in the fact',
        'Surrogate keys (auto-increment IDs) are preferred over natural keys in dimensions for SCD handling',
        'Conformed dimensions (shared across multiple fact tables) are critical for cross-process analysis',
        'Don\'t over-normalize your dimensions — that turns your star into a snowflake, losing the performance benefit'
      ],
      designExamples: {
        good: [
          {
            title: 'Correct: Surrogate keys + denormalized dimensions',
            description: 'Fact table uses integer surrogate keys (date_key, product_key) instead of natural keys. Dimensions are flat with all attributes embedded.',
            columns: [
              { table: 'fact_sales', cols: ['sale_id (PK)', 'date_key (FK)', 'product_key (FK)', 'customer_key (FK)', 'quantity', 'amount'] },
              { table: 'dim_product', cols: ['product_key (PK)', 'product_name', 'category_name', 'brand_name', 'price_tier'] }
            ],
            why: 'Surrogate keys are stable (won\'t change), small (INT vs VARCHAR), and support SCD Type 2. Denormalized dims = 1 JOIN per dimension.'
          },
          {
            title: 'Correct: Separate date dimension table',
            description: 'A pre-built dim_date table with pre-computed attributes, referenced by FK from the fact table.',
            columns: [
              { table: 'fact_sales', cols: ['...', 'date_key (FK)'] },
              { table: 'dim_date', cols: ['date_key (PK)', 'full_date', 'day_of_week', 'is_holiday', 'fiscal_quarter', 'season'] }
            ],
            why: 'Pre-computed date attributes avoid expensive DATE functions in queries. Fiscal calendars and holidays are impossible to derive from a raw date.'
          },
          {
            title: 'Correct: Conformed dimensions shared across facts',
            description: 'dim_customer and dim_date are reused by both fact_sales and fact_returns, enabling cross-process analysis.',
            columns: [
              { table: 'fact_sales', cols: ['...', 'customer_key (FK)', 'date_key (FK)'] },
              { table: 'fact_returns', cols: ['...', 'customer_key (FK)', 'date_key (FK)'] }
            ],
            why: 'Conformed dimensions let you JOIN fact_sales and fact_returns on the same customer_key, enabling queries like "return rate by customer segment."'
          }
        ],
        bad: [
          {
            title: 'Wrong: Storing measures in dimension tables',
            description: 'Putting numeric measures (revenue, quantity) in a dimension table instead of the fact table.',
            columns: [
              { table: 'dim_product (BAD)', cols: ['product_key (PK)', 'product_name', 'total_revenue', 'units_sold'] }
            ],
            why: 'Measures in dimensions can\'t be aggregated across time or other dimensions. Revenue belongs in fact_sales, not dim_product.',
            fix: 'Move all numeric measures to the fact table. Dimensions should only contain descriptive context (who, what, when, where).'
          },
          {
            title: 'Wrong: Using natural keys instead of surrogate keys',
            description: 'Using email or SSN as primary key in dimensions instead of auto-increment integer.',
            columns: [
              { table: 'dim_customer (BAD)', cols: ['email (PK)', 'name', 'city', 'segment'] },
              { table: 'fact_sales (BAD)', cols: ['...', 'email (FK)'] }
            ],
            why: 'Natural keys change (users update emails), are large (VARCHAR JOINs are slow), and break SCD Type 2 tracking.',
            fix: 'Always use auto-increment surrogate keys (customer_key INT). Store the natural key as a regular attribute for lookup.'
          },
          {
            title: 'Wrong: Date as a column instead of a dimension',
            description: 'Storing sale_date as a raw DATE/TIMESTAMP column in the fact table with no date dimension.',
            columns: [
              { table: 'fact_sales (BAD)', cols: ['sale_id', 'sale_date (DATE)', 'product_id', 'amount'] }
            ],
            why: 'Every query needs EXTRACT(MONTH FROM sale_date), CASE WHEN for holidays, fiscal year logic, etc. This is slow and inconsistent.',
            fix: 'Create a dim_date table with pre-computed attributes. Replace sale_date with date_key (FK) referencing dim_date.'
          },
          {
            title: 'Avoid: Over-normalizing into a snowflake',
            description: 'Splitting dim_product into dim_product → dim_category → dim_brand when you don\'t need to.',
            columns: [
              { table: 'dim_product (OVER-NORMALIZED)', cols: ['product_key', 'product_name', 'category_key (FK)', 'brand_key (FK)'] },
              { table: 'dim_category', cols: ['category_key (PK)', 'category_name'] },
              { table: 'dim_brand', cols: ['brand_key (PK)', 'brand_name'] }
            ],
            why: 'This turns your star into a snowflake, adding 2 extra JOINs. In a star schema, category_name and brand_name should be embedded in dim_product.',
            fix: 'Keep dimensions flat in a star schema. Only normalize (snowflake) when you have deep hierarchies or strict governance requirements.'
          }
        ]
      },
      learningResources: [
        { title: 'Kimball Group: Dimensional Modeling Techniques', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/' },
        { title: 'AWS: Star Schema Benchmark for Data Warehouses', url: 'https://docs.aws.amazon.com/redshift/latest/dg/c_best-practices-star-schema.html' },
        { title: 'Holistics: Star Schema in Modern Data Stack', url: 'https://www.holistics.io/blog/how-we-structure-our-data-team-at-holistics/' }
      ],
      components: [
        { id: 'fact-sales', name: 'Fact: Sales', shape: 'fact', description: 'Central fact table', details: 'Stores granular transaction events: sale_id, date_key, product_key, customer_key, store_key, quantity, amount, discount, tax. Each row is one sale event. Grain: one row per line item per transaction.', technologies: ['Snowflake', 'BigQuery', 'Redshift'] },
        { id: 'dim-customer', name: 'Dim: Customer', shape: 'dimension', description: 'Customer dimension', details: 'Denormalized customer attributes: customer_key, name, email, phone, city, state, country, segment, lifetime_value, signup_date. Stores all customer context in a single flat row.', technologies: ['PostgreSQL', 'Snowflake', 'dbt'] },
        { id: 'dim-product', name: 'Dim: Product', shape: 'dimension', description: 'Product dimension', details: 'Denormalized product catalog: product_key, product_name, category_name, subcategory, brand_name, price_tier, weight, is_active. Category and brand are embedded, not separate tables.', technologies: ['PostgreSQL', 'Snowflake', 'dbt'] },
        { id: 'dim-date', name: 'Dim: Date', shape: 'dimension', description: 'Date dimension', details: 'Pre-computed calendar: date_key, full_date, day_of_week, month, quarter, year, fiscal_year, is_holiday, is_weekend, season. Enables fast time-based slicing without date functions in queries.', technologies: ['SQL', 'dbt', 'Airflow'] },
        { id: 'dim-store', name: 'Dim: Store', shape: 'dimension', description: 'Store/Location dimension', details: 'Store or merchant attributes: store_key, store_name, region, city, state, country, store_type, manager, open_date. Provides geographic and organizational context for sales analysis.', technologies: ['PostgreSQL', 'Snowflake', 'dbt'] }
      ],
      connections: [
        { from: 'fact-sales', to: 'dim-customer', type: 'fk' },
        { from: 'fact-sales', to: 'dim-product', type: 'fk' },
        { from: 'fact-sales', to: 'dim-date', type: 'fk' },
        { from: 'fact-sales', to: 'dim-store', type: 'fk' }
      ]
    },
    snowflakeSchema: {
      name: 'Snowflake Schema',
      difficulty: 'Intermediate',
      tagline: 'Normalized Dimensional Modeling',
      description: 'Snowflake Schema extends the Star Schema by normalizing dimension tables into multiple related sub-tables, creating a structure that resembles a snowflake. Instead of storing all product attributes in one flat dim_product table, the snowflake schema splits them into separate dim_product, dim_category, dim_subcategory, and dim_brand tables linked by foreign keys. This reduces data redundancy at the cost of more complex queries requiring additional JOINs. The snowflake pattern is named for its branching, crystalline appearance when drawn as an entity-relationship diagram.',
      layout: 'snowflake',
      overview: {
        text: 'In a Snowflake Schema, the central fact table remains the same as in a star schema, but dimension tables are normalized into third normal form (3NF) or similar. A dim_product table no longer contains category_name directly — instead, it holds a category_key that references a separate dim_category table, which in turn might reference a dim_department table. This cascading normalization creates "branches" extending outward from each dimension. The benefits are reduced storage (each category name stored exactly once) and easier dimension maintenance (updating a category name requires changing one row instead of thousands). The drawbacks are more complex queries (additional JOINs), potentially slower performance on large datasets, and harder comprehension for business users. Snowflake schemas are more common in enterprise data warehouses with strict data governance requirements, and in environments where ETL processes benefit from normalized staging areas. Modern columnar warehouses like Snowflake (the product, not the schema pattern) can often handle the extra JOINs efficiently with their optimizers.',
        scenario: 'Healthcare Analytics - Hospital Network',
        scenarioDescription: 'A nationwide hospital network tracks patient encounters across hundreds of facilities. The fact_encounters table stores each patient visit with diagnosis codes, procedures performed, charges, and length of stay. The dimension tables are heavily normalized: dim_patient links to dim_insurance_provider and dim_geographic_region; dim_physician links to dim_department which links to dim_hospital; dim_diagnosis links to dim_diagnosis_category which links to dim_diagnosis_group (ICD hierarchy). This normalization is critical in healthcare where regulatory compliance demands data consistency — changing a department name must propagate correctly across all reports, and insurance provider details must be maintained in exactly one place.',
        components: [
          { name: 'Fact Table (fact_encounters)', metric: 'Patient encounter events: admission, diagnosis codes, procedures, charges, length of stay, and foreign keys to normalized dimensions' },
          { name: 'Dimension: Patient', metric: 'Patient demographics linked to separate insurance and geographic tables — not embedded' },
          { name: 'Dimension: Physician → Department → Hospital', metric: 'Three-level normalization: physician references department, department references hospital facility' },
          { name: 'Dimension: Diagnosis → Category → Group', metric: 'ICD code hierarchy maintained as separate related tables for regulatory compliance' },
          { name: 'Dimension: Date', metric: 'Shared conformed date dimension (same as star schema — dates rarely need further normalization)' }
        ]
      },
      useCases: [
        'Enterprise data warehouses with strict governance requirements',
        'Healthcare, finance, and regulatory reporting systems',
        'Environments needing minimal data redundancy',
        'Complex hierarchical dimensions (org charts, product taxonomies, geographic hierarchies)',
        'Systems where dimension maintenance is frequent and must be consistent'
      ],
      advantages: [
        'Eliminates data redundancy through normalization',
        'Easier dimension maintenance — update once, reflected everywhere',
        'Better data integrity with enforced foreign key relationships',
        'Efficient storage for high-cardinality dimension hierarchies',
        'Supports complex hierarchical analysis (drill-down/roll-up)',
        'Cleaner staging/loading process for ETL pipelines'
      ],
      challenges: [
        'More complex queries requiring multiple JOINs per dimension path',
        'Slower query performance due to additional JOIN operations',
        'Harder for business users to understand and navigate',
        'BI tools may require additional configuration for normalized dimensions',
        'More complex ETL logic to maintain referential integrity across sub-tables',
        'Debugging query results is harder with deeply nested dimension paths'
      ],
      gotchas: [
        'Don\'t normalize everything — date dimensions and junk dimensions should stay flat',
        'Each additional normalization level adds a JOIN — 3 levels deep means 3 JOINs just for one dimension',
        'BI tools like Tableau may struggle with snowflake patterns; you may need to create denormalized views',
        'The "Snowflake" warehouse product is NOT the same as snowflake schema — don\'t confuse them in interviews',
        'Consider hybrid approaches: normalize only dimensions with deep hierarchies, keep flat dimensions as stars',
        'Bridge tables are needed for many-to-many relationships (e.g., patient has multiple diagnoses per encounter)',
        'Test query performance early — the JOIN penalty varies greatly between database engines'
      ],
      designExamples: {
        good: [
          {
            title: 'Correct: Normalize only deep hierarchies',
            description: 'Physician → Department → Hospital is 3 levels deep. Each level is a separate table with its own PK, making maintenance clean.',
            columns: [
              { table: 'dim_physician', cols: ['physician_key (PK)', 'name', 'specialty', 'department_key (FK)'] },
              { table: 'dim_department', cols: ['department_key (PK)', 'dept_name', 'hospital_key (FK)'] },
              { table: 'dim_hospital', cols: ['hospital_key (PK)', 'hospital_name', 'city', 'state'] }
            ],
            why: 'Renaming a department requires updating ONE row. In a star schema, you\'d update thousands of physician rows. Hierarchical drill-down (Hospital → Department → Physician) is natural.'
          },
          {
            title: 'Correct: Keep date dimension flat even in snowflake',
            description: 'dim_date stays denormalized with all attributes in one table — no separate dim_month or dim_year tables.',
            columns: [
              { table: 'dim_date (FLAT - correct)', cols: ['date_key (PK)', 'full_date', 'month', 'quarter', 'year', 'is_holiday', 'fiscal_year'] }
            ],
            why: 'Date attributes are static and finite. Normalizing month into a separate table adds a JOIN with zero benefit. Keep dates flat.'
          },
          {
            title: 'Correct: Use bridge tables for many-to-many',
            description: 'A patient can have multiple diagnoses per encounter. Use a bridge table to model this correctly.',
            columns: [
              { table: 'bridge_encounter_diagnosis', cols: ['encounter_key (FK)', 'diagnosis_key (FK)', 'rank', 'is_primary'] },
              { table: 'fact_encounters', cols: ['encounter_id (PK)', 'patient_key (FK)', 'date_key (FK)'] }
            ],
            why: 'Bridge tables handle M:N relationships cleanly. Without them, you\'d duplicate fact rows (inflating metrics) or lose diagnosis detail.'
          }
        ],
        bad: [
          {
            title: 'Wrong: Normalizing everything blindly',
            description: 'Splitting every attribute into its own table, including low-cardinality fields like gender or admission_type.',
            columns: [
              { table: 'dim_patient (OVER-NORMALIZED)', cols: ['patient_key', 'name', 'gender_key (FK)', 'region_key (FK)', 'insurance_key (FK)'] },
              { table: 'dim_gender (UNNECESSARY)', cols: ['gender_key (PK)', 'gender_name'] }
            ],
            why: 'Gender has 3-4 values. A separate table adds a JOIN for almost no storage savings. Only normalize dimensions with real hierarchies (>2 levels) or frequently changing values.',
            fix: 'Keep low-cardinality attributes embedded in the parent dimension. Reserve normalization for attributes with many values or deep hierarchies.'
          },
          {
            title: 'Wrong: Too many levels of normalization',
            description: 'Creating 5+ levels deep: Physician → Department → Hospital → HealthSystem → Region → Country.',
            columns: [
              { table: 'Query requires (BAD)', cols: ['fact → physician → dept → hospital → system → region → country', '= 6 JOINs for one attribute!'] }
            ],
            why: 'Each normalization level adds a JOIN. At 5+ levels, query performance degrades severely and debugging becomes painful.',
            fix: 'Cap normalization at 2-3 levels. Beyond that, consider denormalizing the deepest levels or creating materialized views.'
          },
          {
            title: 'Wrong: Forgetting referential integrity',
            description: 'Not enforcing FK constraints between normalized tables, allowing orphaned records.',
            columns: [
              { table: 'dim_physician (BAD)', cols: ['physician_key', 'name', 'department_key = 999 (NO MATCHING ROW!)'] }
            ],
            why: 'Without FK constraints, department_key=999 can reference a non-existent department. Reports break silently — wrong counts, missing data, NULL joins.',
            fix: 'Always enforce FK constraints in your database. Use NOT NULL on FK columns. Validate referential integrity in your ETL pipeline.'
          },
          {
            title: 'Avoid: Assuming BI tools handle snowflake natively',
            description: 'Expecting Tableau or Power BI to navigate your 3-level normalized physician hierarchy automatically.',
            columns: [
              { table: 'Tableau expects', cols: ['dim_physician with hospital_name embedded (star-like)'] },
              { table: 'You have', cols: ['dim_physician → dim_department → dim_hospital (snowflake)'] }
            ],
            why: 'Most BI tools are optimized for star schemas. Snowflake patterns often require creating denormalized views (CREATE VIEW dim_physician_full AS ...) for the BI layer.',
            fix: 'Create denormalized views on top of your snowflake tables. The physical model stays normalized; the BI layer sees a virtual star.'
          }
        ]
      },
      learningResources: [
        { title: 'Kimball Group: Dimensional Modeling Techniques', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/' },
        { title: 'Snowflake (Product) Docs: Data Modeling Best Practices', url: 'https://docs.snowflake.com/en/user-guide/data-modeling-best-practices' },
        { title: 'Splunk: Normalization vs Denormalization Guide', url: 'https://www.splunk.com/en_us/blog/learn/data-normalization.html' }
      ],
      components: [
        { id: 'fact-encounters', name: 'Fact: Encounters', shape: 'fact', description: 'Central fact table', details: 'Stores patient encounter events: encounter_id, patient_key, physician_key, diagnosis_key, date_key, procedure_codes, charges, length_of_stay, admission_type. Grain: one row per patient per encounter.', technologies: ['Snowflake', 'BigQuery', 'Redshift'] },
        { id: 'dim-patient', name: 'Dim: Patient', shape: 'dimension', description: 'Patient dimension', details: 'Patient demographics: patient_key, name, dob, gender, insurance_key, region_key. References normalized sub-tables instead of embedding insurance and geographic details.', technologies: ['PostgreSQL', 'Snowflake'] },
        { id: 'dim-insurance', name: 'Sub: Insurance', shape: 'bridge', description: 'Insurance sub-dimension', details: 'Normalized insurance provider details: insurance_key, provider_name, plan_type, coverage_level, network_tier. Maintained in one place — updates propagate to all patients.', technologies: ['PostgreSQL', 'Snowflake'] },
        { id: 'dim-physician', name: 'Dim: Physician', shape: 'dimension', description: 'Physician dimension', details: 'Physician attributes: physician_key, name, specialty, department_key. References the department sub-table for organizational context.', technologies: ['PostgreSQL', 'Snowflake'] },
        { id: 'dim-department', name: 'Sub: Department', shape: 'bridge', description: 'Department sub-dimension', details: 'Department details: department_key, department_name, hospital_key, floor, capacity. Links physicians to their organizational units.', technologies: ['PostgreSQL', 'Snowflake'] },
        { id: 'dim-hospital', name: 'Sub: Hospital', shape: 'aggregate', description: 'Hospital sub-dimension', details: 'Hospital facility: hospital_key, hospital_name, city, state, bed_count, trauma_level. The deepest level of the physician hierarchy.', technologies: ['PostgreSQL', 'Snowflake'] },
        { id: 'dim-diagnosis', name: 'Dim: Diagnosis', shape: 'dimension', description: 'Diagnosis dimension', details: 'ICD diagnosis codes: diagnosis_key, icd_code, description, category_key. References category sub-table for the ICD hierarchy.', technologies: ['PostgreSQL', 'Snowflake'] },
        { id: 'dim-dx-category', name: 'Sub: Dx Category', shape: 'bridge', description: 'Diagnosis category', details: 'Diagnosis category grouping: category_key, category_name, group_key. Provides mid-level ICD hierarchy for roll-up reporting.', technologies: ['PostgreSQL', 'Snowflake'] },
        { id: 'dim-date', name: 'Dim: Date', shape: 'dimension', description: 'Date dimension', details: 'Shared conformed date dimension: date_key, full_date, day_of_week, month, quarter, year, fiscal_year, is_holiday. Typically stays flat even in snowflake schemas.', technologies: ['SQL', 'dbt'] }
      ],
      connections: [
        { from: 'fact-encounters', to: 'dim-patient', type: 'fk' },
        { from: 'fact-encounters', to: 'dim-physician', type: 'fk' },
        { from: 'fact-encounters', to: 'dim-diagnosis', type: 'fk' },
        { from: 'fact-encounters', to: 'dim-date', type: 'fk' },
        { from: 'dim-patient', to: 'dim-insurance', type: 'normalize' },
        { from: 'dim-physician', to: 'dim-department', type: 'normalize' },
        { from: 'dim-department', to: 'dim-hospital', type: 'normalize' },
        { from: 'dim-diagnosis', to: 'dim-dx-category', type: 'normalize' }
      ]
    },
    mapreduce: {
      name: 'MapReduce',
      difficulty: 'Intermediate',
      tagline: 'Distributed Data Processing Framework',
      description: 'MapReduce is the foundational distributed processing model introduced by Google in 2004 and implemented in Apache Hadoop. It breaks large data processing tasks into two primary phases — Map and Reduce — allowing massive datasets to be processed in parallel across thousands of commodity servers. A client submits a job; the framework splits input data into chunks distributed across servers, applies the Map function to each chunk independently (producing intermediate key-value pairs), shuffles and sorts those pairs by key, then applies the Reduce function to aggregate results. This model enabled companies like Yahoo, Facebook, and LinkedIn to process petabytes of data reliably on commodity hardware.',
      layout: 'mapreduce',
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
        'Only two stages (Map then Reduce) — complex pipelines require chaining multiple jobs',
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
    },
    spark: {
      name: 'Apache Spark',
      difficulty: 'Advanced',
      tagline: 'Unified In-Memory Analytics Engine',
      description: 'Apache Spark is a unified analytics engine for large-scale data processing, originally developed at UC Berkeley\'s AMPLab in 2009. Unlike MapReduce which writes intermediate results to disk, Spark keeps data in-memory across operations using Resilient Distributed Datasets (RDDs), achieving up to 100x faster performance for iterative algorithms. Spark provides a rich API for batch processing, SQL queries, streaming, machine learning (MLlib), and graph processing (GraphX) — all in a single framework.',
      layout: 'spark',
      overview: {
        text: 'Spark follows a Driver-Executor architecture. The Driver program creates a SparkContext, builds a DAG (Directed Acyclic Graph) of transformations, and the DAG Scheduler splits it into stages at shuffle boundaries. The Cluster Manager (YARN, Mesos, or Kubernetes) allocates Executors across worker nodes. Each Executor runs tasks in parallel on data partitions held in memory. Transformations are lazy — they build up a computation plan. Actions trigger execution. If a partition is lost, Spark recomputes it from lineage (the chain of transformations) rather than replicating data. This combination of in-memory computation, lazy evaluation, and lineage-based fault tolerance makes Spark dramatically faster than MapReduce for multi-pass algorithms like machine learning and graph processing.',
        scenario: 'Real-Time Recommendation Engine — Netflix-Scale',
        scenarioDescription: 'A streaming service processes 500M daily viewing events to update user recommendations in near real-time. Spark Structured Streaming ingests events from Kafka, joins them with user profile data cached in memory, runs collaborative filtering (MLlib ALS) on the combined dataset, and writes updated recommendation vectors to a serving store. The entire pipeline — ingest, transform, ML scoring, and output — runs as a single Spark application, reusing in-memory DataFrames across stages instead of writing to disk between steps.',
        components: [
          { name: 'Driver Program', metric: 'Creates SparkContext, builds DAG, coordinates execution' },
          { name: 'Cluster Manager', metric: 'YARN/Mesos/K8s allocates Executors across the cluster' },
          { name: 'DAG Scheduler', metric: 'Splits job into stages at shuffle boundaries, optimizes pipeline' },
          { name: 'Data Source', metric: 'HDFS, S3, Kafka, JDBC — reads data into distributed partitions' },
          { name: 'RDD / DataFrame', metric: 'Immutable distributed collections held in memory across Executors' },
          { name: 'Transformations', metric: 'Lazy operations: map, filter, join, groupBy build the DAG' },
          { name: 'Shuffle (Exchange)', metric: 'Data redistribution between stages — only point data hits disk' },
          { name: 'Actions & Output', metric: 'collect(), save(), count() — trigger DAG execution and produce results' }
        ]
      },
      useCases: [
        'Interactive SQL queries on large datasets (Spark SQL)',
        'Real-time stream processing (Structured Streaming)',
        'Machine learning pipelines (MLlib)',
        'Graph analytics (GraphX)',
        'ETL and data lake transformations',
        'Iterative algorithms (PageRank, K-Means)'
      ],
      advantages: [
        'Up to 100x faster than MapReduce via in-memory processing',
        'Unified API for batch, streaming, SQL, ML, and graph',
        'Lazy evaluation enables whole-stage optimization',
        'Lineage-based fault tolerance — no data replication overhead',
        'Rich ecosystem: DataFrames, Datasets, Catalyst optimizer, Tungsten engine',
        'Supports Python, Scala, Java, R, and SQL interfaces'
      ],
      challenges: [
        'High memory requirements — can run out of memory with large shuffles',
        'Complex tuning — shuffle partitions, memory fractions, serialization',
        'Not ideal for single-record low-latency lookups',
        'Driver is a single point of failure (mitigated by checkpointing)',
        'Shuffle stages still write to disk — network intensive',
        'Steep learning curve for advanced optimization (Catalyst, Tungsten)'
      ],
      learningResources: [
        { title: 'Apache Spark Official Documentation', url: 'https://spark.apache.org/docs/latest/' },
        { title: 'Spark: The Definitive Guide (O\'Reilly)', url: 'https://www.oreilly.com/library/view/spark-the-definitive/9781491912201/' },
        { title: 'UC Berkeley AMPLab: Original Spark Paper (NSDI 2012)', url: 'https://www.usenix.org/conference/nsdi12/technical-sessions/presentation/zaharia' }
      ],
      components: [
        { id: 'spark-driver', name: 'Driver Program', shape: 'cloud', description: 'Application entry point', details: 'The Driver runs the user\'s main() function, creates the SparkContext/SparkSession, defines transformations and actions on RDDs/DataFrames, and coordinates the overall execution. It runs on one node and communicates with the Cluster Manager to request Executors.', technologies: ['Scala', 'PySpark', 'Java'] },
        { id: 'spark-cluster-mgr', name: 'Cluster Manager', shape: 'api', description: 'Resource allocation', details: 'Manages cluster resources and allocates Executors. Can be YARN (Hadoop ecosystem), Apache Mesos, Kubernetes, or Spark\'s built-in Standalone mode. Negotiates CPU cores and memory for each Executor container.', technologies: ['YARN', 'Kubernetes', 'Mesos'] },
        { id: 'spark-dag', name: 'DAG Scheduler', shape: 'pipeline', description: 'Execution planning', details: 'Converts the logical execution plan (chain of RDD transformations) into a physical execution plan as a DAG of stages. Stages are split at shuffle boundaries. Within each stage, tasks are pipelined (map→filter→map run in a single pass). The Catalyst optimizer further optimizes DataFrame/SQL queries.', technologies: ['Catalyst', 'Tungsten'] },
        { id: 'spark-source', name: 'Data Source', shape: 'database', description: 'Input data', details: 'Spark reads from diverse sources: HDFS files, S3 objects, Kafka topics, JDBC databases, Delta Lake tables. Data is loaded into distributed partitions. DataFrameReader supports formats like Parquet, JSON, CSV, ORC, and Avro.', technologies: ['HDFS', 'S3', 'Kafka', 'Delta Lake'] },
        { id: 'spark-rdd', name: 'RDD / DataFrame', shape: 'cache', description: 'In-memory data', details: 'Resilient Distributed Datasets are immutable, partitioned collections that can be cached in memory across the cluster. DataFrames add schema and the Catalyst optimizer. Datasets (typed DataFrames) provide compile-time type safety. Data stays in memory between operations — the key advantage over MapReduce.', technologies: ['RDD', 'DataFrame', 'Spark SQL'] },
        { id: 'spark-transform', name: 'Transformations', shape: 'cluster', description: 'Lazy computation', details: 'Transformations (map, filter, flatMap, join, groupBy, union) are lazy — they define a computation plan but don\'t execute until an action is called. This allows Spark to optimize the entire pipeline. Narrow transformations (map, filter) don\'t require shuffles; wide transformations (groupBy, join) do.', technologies: ['Spark', 'Scala', 'PySpark'] },
        { id: 'spark-shuffle', name: 'Shuffle Exchange', shape: 'stream', description: 'Stage boundary', details: 'When a wide transformation (join, groupBy, repartition) is encountered, Spark must redistribute data across partitions — a shuffle. This is the only point where Spark writes to disk (shuffle files). The DAG Scheduler creates a new stage at each shuffle boundary. Optimizing shuffle is critical for Spark performance.', technologies: ['Spark', 'Partitioner'] },
        { id: 'spark-output', name: 'Actions & Output', shape: 'warehouse', description: 'Trigger execution', details: 'Actions (collect, count, save, show, foreach) trigger the actual execution of the DAG. Results are either returned to the Driver (collect), written to storage (save to HDFS/S3/Delta Lake), or pushed to external systems. Each action triggers a complete DAG execution from source to output.', technologies: ['HDFS', 'S3', 'Delta Lake', 'Databricks'] }
      ],
      connections: [
        { from: 'spark-driver', to: 'spark-cluster-mgr', type: 'query' },
        { from: 'spark-driver', to: 'spark-dag', type: 'query' },
        { from: 'spark-source', to: 'spark-rdd', type: 'batch' },
        { from: 'spark-rdd', to: 'spark-transform', type: 'stream' },
        { from: 'spark-transform', to: 'spark-shuffle', type: 'stream' },
        { from: 'spark-shuffle', to: 'spark-rdd', type: 'stream' },
        { from: 'spark-transform', to: 'spark-output', type: 'batch' }
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
        color: "#4A7A9B",
        colorLight: "rgba(74, 122, 155, 0.15)",
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
        color: "#4A7A56",
        colorLight: "rgba(74, 122, 86, 0.15)",
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
        color: "#9E7824",
        colorLight: "rgba(158, 120, 36, 0.15)",
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
        color: "#7A5A9E",
        colorLight: "rgba(122, 90, 158, 0.15)",
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
        color: "#9E5A3C",
        colorLight: "rgba(158, 90, 60, 0.15)",
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
    1: { primary: '#4A7A9B', light: 'rgba(74, 122, 155, 0.15)', border: 'rgba(74, 122, 155, 0.3)' },
    2: { primary: '#4A7A56', light: 'rgba(74, 122, 86, 0.15)', border: 'rgba(74, 122, 86, 0.3)' },
    3: { primary: '#9E7824', light: 'rgba(158, 120, 36, 0.15)', border: 'rgba(158, 120, 36, 0.3)' },
    4: { primary: '#7A5A9E', light: 'rgba(122, 90, 158, 0.15)', border: 'rgba(122, 90, 158, 0.3)' },
    5: { primary: '#9E5A3C', light: 'rgba(158, 90, 60, 0.15)', border: 'rgba(158, 90, 60, 0.3)' }
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
    stream:    '#2A9D99',
    batch:     '#E8654A',
    query:     '#4A5FE3',
    fk:        '#C07FD4',
    normalize: '#4A5FE3',
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
    const isSelected = selectedComponent?.id === component.id;

    return (
      <div
        onClick={() => onClick(component)}
        className="cohere-node"
        style={{
          background: isSelected ? colors.selected : colors.fill,
          width: '140px',
          height: '72px',
          padding: '8px 10px',
          flexShrink: 0,
          outline: isSelected ? '3px solid rgba(0,0,0,0.25)' : 'none',
          outlineOffset: isSelected ? '2px' : '0',
        }}
      >
        <span style={{ color: 'white', fontSize: '12px', fontWeight: '700', textAlign: 'center', lineHeight: 1.25, display: 'block', width: '100%' }}>
          {component.name}
        </span>
      </div>
    );
  };

  // Schema-specific tooltips for educational context
  const schemaTooltips = {
    'fact-sales': { title: 'Fact Table', tip: 'The central table storing measurable events (transactions). Contains numeric values (amount, quantity) and foreign keys to every dimension. Grain: one row per line item.' },
    'dim-customer': { title: 'Customer Dimension', tip: 'Denormalized: all customer attributes in ONE flat table. City, state, country are embedded — no separate geography table. Trade-off: "New York" stored thousands of times.' },
    'dim-product': { title: 'Product Dimension', tip: 'Denormalized: category_name and brand_name stored directly. In a snowflake, these would be separate tables. Star keeps it simple — one JOIN gets everything.' },
    'dim-date': { title: 'Date Dimension', tip: 'Always a separate table, never just a date column. Pre-computed attributes (is_holiday, fiscal_quarter) avoid expensive date functions in queries.' },
    'dim-store': { title: 'Store Dimension', tip: 'Location and organizational context. In star schema, region and country are embedded. In snowflake, they would be normalized into separate hierarchy tables.' },
    'fact-encounters': { title: 'Fact Table', tip: 'Patient encounter events at the center. Each row is one visit with diagnosis codes, charges, and foreign keys to normalized dimension hierarchies.' },
    'dim-patient': { title: 'Patient Dimension (Normalized)', tip: 'Unlike star schema, insurance details are NOT embedded here. Instead, insurance_key references a separate dim_insurance table — this is normalization in action.' },
    'dim-insurance': { title: 'Insurance Sub-Dimension', tip: 'Normalized out of dim_patient. Provider name stored once, not duplicated across every patient row. Update the provider name in one place — it propagates everywhere.' },
    'dim-physician': { title: 'Physician Dimension (Normalized)', tip: 'References dim_department via department_key instead of embedding department_name. This creates the branching "snowflake" shape.' },
    'dim-department': { title: 'Department Sub-Dimension', tip: 'Second level of normalization. Links to dim_hospital — creating a 3-level hierarchy: Physician → Department → Hospital. Each level is a separate JOIN.' },
    'dim-hospital': { title: 'Hospital Sub-Dimension (Level 3)', tip: 'Deepest normalization level. To get a physician\'s hospital name, you need: fact → dim_physician → dim_department → dim_hospital. That\'s 3 JOINs for one attribute!' },
    'dim-diagnosis': { title: 'Diagnosis Dimension (Normalized)', tip: 'ICD codes reference a category hierarchy. Critical in healthcare where regulatory compliance demands consistent code groupings.' },
    'dim-dx-category': { title: 'Diagnosis Category Sub-Dimension', tip: 'Groups ICD codes into categories for roll-up reporting. Normalization ensures category names are consistent across all diagnoses.' },
    'dim-date-snow': { title: 'Date Dimension (Stays Flat)', tip: 'Even in snowflake schemas, date dimensions typically remain denormalized. There\'s no benefit to normalizing month into a separate table.' }
  };

  const SchemaComponentCard = ({ component, onClick, tooltipPosition = 'top' }) => {
    const colors = colorScheme[component.shape] || colorScheme.database;
    const tooltip = schemaTooltips[component.id];
    const isHovered = hoveredSchemaComponent === component.id;
    const isSelected = selectedComponent?.id === component.id;

    return (
      <div
        style={{ position: 'relative', display: 'inline-flex' }}
        onMouseEnter={() => setHoveredSchemaComponent(component.id)}
        onMouseLeave={() => setHoveredSchemaComponent(null)}
      >
        {/* Tooltip */}
        {isHovered && tooltip && (
          <div style={{
            position: 'absolute',
            [tooltipPosition === 'bottom' ? 'top' : 'bottom']: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            [tooltipPosition === 'bottom' ? 'marginTop' : 'marginBottom']: '12px',
            width: '260px',
            background: 'rgba(0,0,0,0.92)',
            color: 'white',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            lineHeight: '1.5',
            zIndex: 100,
            pointerEvents: 'none',
            fontFamily: 'var(--font-sans)',
          }}>
            <div style={{ fontWeight: '700', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.6)' }}>{tooltip.title}</div>
            {tooltip.tip}
          </div>
        )}
        <div
          onClick={() => onClick && onClick(component)}
          className="cohere-node"
          style={{
            background: isSelected ? colors.selected : colors.fill,
            width: '130px',
            height: '60px',
            padding: '6px 8px',
            flexShrink: 0,
            outline: isSelected ? '3px solid rgba(0,0,0,0.25)' : 'none',
            outlineOffset: '2px',
          }}
        >
          <span style={{ color: 'white', fontSize: '11px', fontWeight: '700', textAlign: 'center', lineHeight: 1.25, display: 'block', width: '100%' }}>
            {component.name}
          </span>
        </div>
      </div>
    );
  };

  const ConnectionArrow = ({ type }) => {
    const color = connectionColors[type] || '#2C2A28';
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', minWidth: '64px', height: '72px' }}>
        <svg width="64" height="2" style={{ overflow: 'visible' }} className="cohere-arrow-svg">
          <defs>
            <marker id={`arr-h-${type}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <polygon points="0,0 6,3 0,6" fill={color} />
            </marker>
          </defs>
          <line x1="0" y1="1" x2="56" y2="1"
            stroke={color} strokeWidth="1.5" strokeDasharray="5,4"
            markerEnd={`url(#arr-h-${type})`} />
        </svg>
      </div>
    );
  };

  const VerticalConnectionArrow = ({ type, direction = 'down' }) => {
    const color = connectionColors[type] || '#2C2A28';
    const isUp = direction === 'up';
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0', minHeight: '64px', width: '140px' }}>
        <svg width="2" height="64" style={{ overflow: 'visible' }} className="cohere-arrow-svg">
          <defs>
            <marker id={`arr-v-${type}-${direction}`} markerWidth="8" markerHeight="8" refX="3" refY="3" orient={isUp ? '270deg' : '90deg'}>
              <polygon points="0,0 6,3 0,6" fill={color} />
            </marker>
          </defs>
          <line x1="1" y1={isUp ? 56 : 0} x2="1" y2={isUp ? 0 : 56}
            stroke={color} strokeWidth="1.5" strokeDasharray="5,4"
            markerEnd={`url(#arr-v-${type}-${direction})`} />
        </svg>
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
    const color = connectionColors[type] || '#2C2A28';
    const markerId = `arr-lbend-${type}-${direction}`;
    // direction: 'batch-down' goes right then down; 'stream-down' same
    const SVG_W = 96, SVG_H = 96;
    const d = direction === 'batch-down' || direction === 'stream-down'
      ? `M 4 4 L ${SVG_W - 4} 4 L ${SVG_W - 4} ${SVG_H - 4}`
      : `M 4 4 L 4 ${SVG_H - 4} L ${SVG_W - 4} ${SVG_H - 4}`;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '96px', height: '96px', flexShrink: 0 }}>
        <svg width={SVG_W} height={SVG_H} style={{ overflow: 'visible' }}>
          <defs>
            <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <polygon points="0,0 6,3 0,6" fill={color} />
            </marker>
          </defs>
          <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="5,4"
            strokeLinecap="round" strokeLinejoin="round"
            markerEnd={`url(#${markerId})`} />
        </svg>
      </div>
    );
  };

  const MergeToCenterArrow = ({ type }) => {
    const color = connectionColors[type] || '#2C2A28';
    const SVG_W = 300, SVG_H = 80;
    // Two source points merge to center bottom
    const cx = SVG_W / 2;
    const topPath = `M ${cx * 0.25} 0 Q ${cx * 0.25} ${SVG_H * 0.6}, ${cx} ${SVG_H}`;
    const bottomPath = `M ${cx * 1.75} 0 Q ${cx * 1.75} ${SVG_H * 0.6}, ${cx} ${SVG_H}`;
    const markerId = `arr-merge-${type}`;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <svg width={SVG_W} height={SVG_H} style={{ overflow: 'visible' }}>
          <defs>
            <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <polygon points="0,0 6,3 0,6" fill={color} />
            </marker>
          </defs>
          <path d={topPath} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="5,4" strokeLinecap="round" markerEnd={`url(#${markerId})`} />
          <path d={bottomPath} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="5,4" strokeLinecap="round" />
        </svg>
      </div>
    );
  };

  // MapReduce: Fan-out arrow (1 source splits down to N targets)
  const MapReduceFanOutArrow = ({ color = '#E8654A', count = 3, cardGap = 40 }) => {
    const cardWidth = 120;
    const SVG_W = (count * cardWidth) + ((count - 1) * cardGap);
    const SVG_H = 80;
    const centerX = SVG_W / 2;
    const spacing = cardWidth + cardGap;
    const startOffset = centerX - ((count - 1) / 2) * spacing;
    const markerId = `fanout-arr-${count}`;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <svg width={SVG_W} height={SVG_H} style={{ overflow: 'visible' }}>
          <defs>
            <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <polygon points="0,0 6,3 0,6" fill={color} />
            </marker>
          </defs>
          {Array.from({ length: count }).map((_, i) => {
            const targetX = startOffset + i * spacing;
            const d = `M ${centerX} 0 Q ${centerX} ${SVG_H * 0.5}, ${targetX} ${SVG_H + 8}`;
            return (
              <path key={i} d={d} stroke={color} strokeWidth="1.5" fill="none"
                strokeDasharray="5,4" strokeLinecap="round"
                markerEnd={`url(#${markerId})`} />
            );
          })}
        </svg>
      </div>
    );
  };

  // MapReduce: Fan-in arrow (multiple sources merge to 1 target)
  const MapReduceFanInArrow = ({ color = '#4A5FE3', sourceCount = 3 }) => {
    const cardWidth = 120;
    const SVG_W = (sourceCount * cardWidth) + ((sourceCount - 1) * 40);
    const SVG_H = 80;
    const centerX = SVG_W / 2;
    const spacing = cardWidth + 40;
    const startOffset = centerX - ((sourceCount - 1) / 2) * spacing;
    const markerId = `fanin-arr-${sourceCount}`;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <svg width={SVG_W} height={SVG_H} style={{ overflow: 'visible' }}>
          <defs>
            <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <polygon points="0,0 6,3 0,6" fill={color} />
            </marker>
          </defs>
          {Array.from({ length: sourceCount }).map((_, i) => {
            const sourceX = startOffset + i * spacing;
            const d = `M ${sourceX} 0 Q ${sourceX} ${SVG_H * 0.5}, ${centerX} ${SVG_H + 8}`;
            return (
              <path key={i} d={d} stroke={color} strokeWidth="1.5" fill="none"
                strokeDasharray="5,4" strokeLinecap="round"
                markerEnd={i === Math.floor(sourceCount / 2) ? `url(#${markerId})` : undefined} />
            );
          })}
        </svg>
      </div>
    );
  };

  // MapReduce: Shuffle cross-connect arrows (3 sources to 2 targets with crossing paths)
  const MapReduceShuffleArrows = () => {
    const sourceCount = 3;
    const targetCount = 2;
    const cardWidth = 120;
    const SVG_W = (sourceCount * cardWidth) + ((sourceCount - 1) * 40);
    const SVG_H = 100;
    const spacing = cardWidth + 40;
    const centerX = SVG_W / 2;
    const srcOffset = centerX - ((sourceCount - 1) / 2) * spacing;
    const tgtOffset = centerX - ((targetCount - 1) / 2) * spacing;
    const shuffleColor = '#C07FD4';
    const markerId = 'shuffle-arr';

    const paths = [];
    let idx = 0;
    for (let s = 0; s < sourceCount; s++) {
      for (let t = 0; t < targetCount; t++) {
        const sx = srcOffset + s * spacing;
        const tx = tgtOffset + t * spacing;
        const shuffleD = `M ${sx} 0 C ${sx} ${SVG_H * 0.4}, ${tx} ${SVG_H * 0.6}, ${tx} ${SVG_H + 8}`;
        paths.push(
          <path key={idx} d={shuffleD} stroke={shuffleColor} strokeWidth="1.5" fill="none"
            strokeDasharray="5,4" strokeLinecap="round" opacity="0.75"
            markerEnd={s === 0 && t === 0 ? `url(#${markerId})` : undefined} />
        );
        idx++;
      }
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <svg width={SVG_W} height={SVG_H} style={{ overflow: 'visible' }}>
          <defs>
            <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <polygon points="0,0 6,3 0,6" fill={shuffleColor} />
            </marker>
          </defs>
          {paths}
        </svg>
      </div>
    );
  };

  // MapReduce: Mini-card for parallel tasks (smaller than ComponentCard)
  const MapReduceMiniCard = ({ label, color, isActive = true, onClick, exampleText }) => {
    const dimmed = mapReduceStep > 0 && !isActive;
    return (
      <div
        onClick={onClick}
        className="cohere-node"
        style={{
          background: color,
          width: '120px',
          height: '56px',
          padding: '6px 8px',
          opacity: dimmed ? 0.35 : 1,
          cursor: onClick ? 'pointer' : 'default',
          flexShrink: 0,
        }}
      >
        <span style={{ color: 'white', fontSize: '11px', fontWeight: '700', textAlign: 'center', lineHeight: 1.25, display: 'block', width: '100%' }}>
          {label}
        </span>
        {exampleText && !dimmed && (
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: '2px', lineHeight: 1.2 }}>
            {exampleText}
          </div>
        )}
      </div>
    );
  };

  // MapReduce step labels with data transformation details
  const mapReduceSteps = [
    { label: 'Show All', description: 'View complete MapReduce pipeline' },
    { label: 'Submit', description: 'Client submits job to ResourceManager' },
    { label: 'Locate', description: 'ResourceManager queries NameNode for data locations' },
    { label: 'Split', description: 'Input data split into chunks for parallel processing' },
    { label: 'Map', description: 'Parallel map() execution on each input split' },
    { label: 'Shuffle', description: 'Intermediate data redistributed and sorted by key' },
    { label: 'Reduce', description: 'Reduce function aggregates values per key' },
    { label: 'Output', description: 'Final results written to HDFS' }
  ];

  // Comprehensive data transformation details for each step
  const dataTransformStages = {
    1: {
      title: 'Job Submission',
      before: { label: 'User Code', data: ['WordCount.jar', 'input: /data/logs/', 'output: /results/counts/'] },
      operation: { label: 'Submit to Cluster', detail: 'Client packages JAR + config and sends to ResourceManager via RPC' },
      after: { label: 'Job Queued', data: ['job_202601_0001 ACCEPTED', 'Requested: 3 mappers, 2 reducers', 'Priority: NORMAL'] },
      insight: 'The client never processes data itself — it only submits the job definition and waits for results.',
      color: '#4A7A9B'
    },
    2: {
      title: 'Data Location Discovery',
      before: { label: 'Job Request', data: ['Need blocks for: /data/logs/*', '3 files, ~384MB total'] },
      operation: { label: 'NameNode Lookup', detail: 'ResourceManager queries NameNode metadata to find which DataNodes hold each block' },
      after: { label: 'Block Location Map', data: ['Block 1 (128MB) → Node-A, Node-C', 'Block 2 (128MB) → Node-B, Node-A', 'Block 3 (128MB) → Node-C, Node-B'] },
      insight: 'Data locality: Mappers are assigned to nodes where the data already lives, avoiding network transfer.',
      color: '#4A7A56'
    },
    3: {
      title: 'Input Splitting',
      before: { label: 'Raw Files on HDFS', data: ['/data/logs/access_jan.log (128MB)', '/data/logs/access_feb.log (128MB)', '/data/logs/access_mar.log (128MB)'] },
      operation: { label: 'InputFormat.getSplits()', detail: 'TextInputFormat splits files at line boundaries, one split per HDFS block (128MB default)' },
      after: { label: '3 Input Splits Created', data: ['Split-0: "hello world hello"', 'Split-1: "foo hello world"', 'Split-2: "bar world foo"'] },
      insight: 'Each split maps to exactly one Map task. More splits = more parallelism but more overhead.',
      color: '#4A7A9B'
    },
    4: {
      title: 'Map Phase — Parallel Transformation',
      before: { label: 'Input Splits (raw text)', data: ['Split-0: "hello world hello"', 'Split-1: "foo hello world"', 'Split-2: "bar world foo"'] },
      operation: { label: 'map(key, value) → emit(word, 1)', detail: 'Each mapper reads one split line-by-line, tokenizes words, emits (word, 1) for each token' },
      after: { label: 'Intermediate Key-Value Pairs', data: ['Mapper-0: (hello,1)(world,1)(hello,1)', 'Mapper-1: (foo,1)(hello,1)(world,1)', 'Mapper-2: (bar,1)(world,1)(foo,1)'] },
      insight: 'Mappers run independently — no communication between them. Each processes only its local split.',
      color: '#9E5A3C'
    },
    5: {
      title: 'Shuffle & Sort — The Network Storm',
      before: { label: 'Scattered KV Pairs (3 mappers)', data: ['M0: (hello,1)(world,1)(hello,1)', 'M1: (foo,1)(hello,1)(world,1)', 'M2: (bar,1)(world,1)(foo,1)'] },
      operation: { label: 'Hash Partition → Transfer → Merge Sort', detail: 'Each key is hashed to a reducer partition. Pairs are sent across the network and merge-sorted by key.' },
      after: { label: 'Grouped & Sorted by Key', data: ['→ Reducer-0: bar→[1], foo→[1,1], hello→[1,1,1]', '→ Reducer-1: world→[1,1,1]'] },
      insight: 'This is the most expensive step — all intermediate data crosses the network. The "shuffle" is why MapReduce is disk-heavy.',
      color: '#9E7824'
    },
    6: {
      title: 'Reduce Phase — Aggregation',
      before: { label: 'Grouped Values per Key', data: ['Reducer-0: bar→[1], foo→[1,1], hello→[1,1,1]', 'Reducer-1: world→[1,1,1]'] },
      operation: { label: 'reduce(key, values) → sum(values)', detail: 'Each reducer receives all values for its key range and applies the user-defined reduce function' },
      after: { label: 'Aggregated Results', data: ['Reducer-0: (bar,1) (foo,2) (hello,3)', 'Reducer-1: (world,3)'] },
      insight: 'Each reducer sees ALL values for a given key — this is guaranteed by the shuffle. sum([1,1,1]) = 3',
      color: '#9E7824'
    },
    7: {
      title: 'Output to HDFS',
      before: { label: 'Reducer Output (in memory)', data: ['Reducer-0: (bar,1) (foo,2) (hello,3)', 'Reducer-1: (world,3)'] },
      operation: { label: 'OutputFormat.write()', detail: 'Each reducer writes results to HDFS as a separate part file (one file per reducer)' },
      after: { label: 'HDFS Output Files', data: ['part-r-00000: bar\\t1, foo\\t2, hello\\t3', 'part-r-00001: world\\t3', 'Total: 4 unique words counted'] },
      insight: 'Results are split across part files. Use "hadoop fs -cat /results/*" or downstream tools (Hive) to read them.',
      color: '#4A7A56'
    }
  };

  // Data Transform Panel Component
  const DataTransformPanel = ({ stageData }) => {
    if (!stageData) return null;
    return (
      <div style={{
        margin: '0 0 20px 0',
        padding: '20px',
        background: 'rgba(245,243,239,0.8)',
        border: `1px solid ${stageData.color}44`,
        borderRadius: '16px',
        animation: 'fadeInScale 0.3s ease-out'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: stageData.color, marginBottom: '16px', textAlign: 'center' }}>
          {stageData.title}
        </div>

        {/* Before → Operation → After flow */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* BEFORE */}
          <div style={{
            flex: '1', minWidth: '200px', maxWidth: '280px',
            background: 'rgba(235,232,228,0.6)', borderRadius: '12px', padding: '14px',
            border: '1px solid rgba(235,231,225,1)'
          }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
              Input
            </div>
            <div style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: '11px', lineHeight: '1.8' }}>
              {stageData.before.data.map((line, i) => (
                <div key={i} style={{ color: 'var(--text-body)', padding: '2px 0' }}>{line}</div>
              ))}
            </div>
          </div>

          {/* ARROW + OPERATION */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '140px', gap: '8px' }}>
            <div style={{
              background: `${stageData.color}22`,
              border: `1px solid ${stageData.color}66`,
              borderRadius: '10px',
              padding: '10px 16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: stageData.color }}>{stageData.operation.label}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '20px', height: '2px', background: stageData.color }} />
              <ArrowRight size={16} color={stageData.color} />
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '180px', lineHeight: '1.4' }}>
              {stageData.operation.detail}
            </div>
          </div>

          {/* AFTER */}
          <div style={{
            flex: '1', minWidth: '200px', maxWidth: '280px',
            background: `${stageData.color}11`, borderRadius: '12px', padding: '14px',
            border: `1px solid ${stageData.color}33`
          }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: stageData.color, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
              Output
            </div>
            <div style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: '11px', lineHeight: '1.8' }}>
              {stageData.after.data.map((line, i) => (
                <div key={i} style={{ color: 'var(--text-body)', padding: '2px 0' }}>{line}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Insight */}
        <div style={{
          marginTop: '14px',
          padding: '10px 16px',
          background: 'rgba(158, 120, 36, 0.08)',
          border: '1px solid rgba(158, 120, 36, 0.2)',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#C8A84E',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          <strong>Key Insight:</strong> {stageData.insight}
        </div>
      </div>
    );
  };

  // Reset step when switching away from mapreduce
  useEffect(() => {
    if (activeArchitecture !== 'mapreduce') {
      setMapReduceStep(0);
      setShowMapReduceExample(false);
    }
  }, [activeArchitecture]);

  const renderMapReduceLayout = () => {
    const comps = currentArch.components;
    const client = comps.find(c => c.id === 'mr-client');
    const jobtracker = comps.find(c => c.id === 'mr-jobtracker');
    const namenode = comps.find(c => c.id === 'mr-namenode');
    const input = comps.find(c => c.id === 'mr-input');
    const map = comps.find(c => c.id === 'mr-map');
    const shuffle = comps.find(c => c.id === 'mr-shuffle');
    const reduce = comps.find(c => c.id === 'mr-reduce');
    const output = comps.find(c => c.id === 'mr-output');

    const step = mapReduceStep;
    const isStepActive = (steps) => step === 0 || steps.includes(step);

    // Word count example data per stage
    const exampleData = {
      input1: '"hello world hello"',
      input2: '"foo hello world"',
      input3: '"bar world foo"',
      map1: '(hello,1)(world,1)(hello,1)',
      map2: '(foo,1)(hello,1)(world,1)',
      map3: '(bar,1)(world,1)(foo,1)',
      reduce1: 'hello→[1,1,1]=3\nfoo→[1,1]=2\nbar→[1]=1',
      reduce2: 'world→[1,1,1]=3',
      output: 'bar:1, foo:2\nhello:3, world:3'
    };

    // Inline data flow labels that appear on arrows
    const InlineDataLabel = ({ text, color = '#94a3b8', visible = true }) => {
      if (!visible || !showDataTransform || step === 0) return null;
      return (
        <div style={{
          position: 'absolute', right: '-180px', top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(200,195,188,0.7)', borderRadius: '6px', padding: '4px 8px',
          fontSize: '9px', color: color, fontFamily: 'Monaco, Consolas, monospace',
          whiteSpace: 'nowrap', border: `1px solid ${color}33`, zIndex: 5,
          animation: 'fadeInScale 0.3s ease-out'
        }}>
          {text}
        </div>
      );
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', position: 'relative' }}>

        {/* Step selector */}
        <div style={{
          display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px', flexWrap: 'wrap'
        }}>
          {mapReduceSteps.map((s, i) => (
            <button key={i}
              onClick={() => setMapReduceStep(i)}
              title={s.description}
              style={{
                padding: '5px 14px',
                background: step === i ? '#0075de' : '#ffffff',
                border: `1px solid ${step === i ? '#0075de' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '20px',
                color: step === i ? '#ffffff' : 'rgba(0,0,0,0.5)',
                fontSize: '12px', fontWeight: step === i ? '600' : '400',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: step === i ? '0 1px 4px rgba(0,117,222,0.25)' : 'none'
              }}
            >
              {i === 0 ? 'All' : `Step ${i}`}
            </button>
          ))}
          <button
            onClick={() => setShowMapReduceExample(!showMapReduceExample)}
            style={{
              padding: '5px 14px', marginLeft: '8px',
              background: showMapReduceExample ? 'rgba(0,117,222,0.08)' : '#ffffff',
              border: `1px solid ${showMapReduceExample ? 'rgba(0,117,222,0.3)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '20px',
              color: showMapReduceExample ? '#0075de' : 'rgba(0,0,0,0.5)',
              fontSize: '12px', fontWeight: '400', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            Word Count Example
          </button>
        </div>

        {/* Step description */}
        {step > 0 && (
          <div style={{
            marginBottom: '16px', padding: '8px 16px',
            background: 'rgba(0,117,222,0.06)', border: '1px solid rgba(0,117,222,0.15)',
            borderRadius: '8px', color: 'rgba(0,0,0,0.85)', fontSize: '13px', textAlign: 'center'
          }}>
            <strong style={{ color: '#0075de' }}>Step {step}:</strong> {mapReduceSteps[step]?.description}
          </div>
        )}

        {/* Phase labels alongside the diagram */}
        <div style={{ position: 'relative', width: '100%' }}>

          {/* Row 1: Client */}
          <div style={{
            display: 'flex', justifyContent: 'center', position: 'relative',
            opacity: isStepActive([1]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <ComponentCard component={client} onClick={setSelectedComponent} />
            {step === 1 && showDataTransform && (
              <div style={{
                position: 'absolute', left: '50%', marginLeft: '110px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(200,195,188,0.7)', borderRadius: '8px', padding: '6px 10px',
                fontSize: '10px', color: '#8AAACE', fontFamily: 'Monaco, Consolas, monospace',
                border: '1px solid rgba(59,130,246,0.3)', animation: 'fadeInScale 0.3s ease-out',
                whiteSpace: 'nowrap'
              }}>
                WordCount.jar + /data/logs/*
              </div>
            )}
          </div>

          {/* Arrow: Client → ResourceManager */}
          <div style={{
            display: 'flex', justifyContent: 'center', padding: '4px 0', position: 'relative',
            opacity: isStepActive([1]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <VerticalConnectionArrow type="query" direction="down" />
            {step === 1 && showDataTransform && (
              <div style={{
                position: 'absolute', left: '50%', marginLeft: '40px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '9px', color: 'var(--text-muted)', fontStyle: 'italic'
              }}>
                submit job via RPC
              </div>
            )}
          </div>

          {/* Row 2: ResourceManager + NameNode */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0px', position: 'relative',
            opacity: isStepActive([1, 2]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <ComponentCard component={jobtracker} onClick={setSelectedComponent} />
            <div style={{ position: 'relative' }}>
              <ConnectionArrow type="query" />
              {step === 2 && showDataTransform && (
                <div style={{
                  position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '-18px',
                  fontSize: '9px', color: '#4A7A56', fontFamily: 'Monaco, Consolas, monospace',
                  whiteSpace: 'nowrap'
                }}>
                  "Where are blocks for /data/logs/*?"
                </div>
              )}
            </div>
            <ComponentCard component={namenode} onClick={setSelectedComponent} />
          </div>

          {/* Arrow: ResourceManager → Input Splits (fan out to 3) */}
          <div style={{
            padding: '8px 0',
            opacity: isStepActive([2, 3]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <MapReduceFanOutArrow color={connectionColors.batch} count={3} />
          </div>

          {/* Row 3: Input Splits (3x mini cards) */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '40px',
            opacity: isStepActive([3]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            {[
              { label: 'Split 1', ex: exampleData.input1 },
              { label: 'Split 2', ex: exampleData.input2 },
              { label: 'Split 3', ex: exampleData.input3 }
            ].map((s, i) => (
              <MapReduceMiniCard
                key={i}
                label={s.label}
                icon={ScrollText}
                color="#4A5FE3"
                isActive={isStepActive([3])}
                onClick={() => setSelectedComponent(input)}
                exampleText={showMapReduceExample ? s.ex : undefined}
              />
            ))}
          </div>

          {/* Arrows: Split → Map (vertical, 3x parallel) */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '40px', padding: '0',
            opacity: isStepActive([3, 4]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
                <VerticalConnectionArrow type="batch" direction="down" />
              </div>
            ))}
          </div>

          {/* Phase label: MAP PHASE */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px',
            opacity: isStepActive([4]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <div style={{
              padding: '4px 16px',
              background: 'rgba(232,101,74,0.08)',
              border: '1px solid rgba(232,101,74,0.25)',
              borderRadius: '20px',
              color: '#E8654A',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>Map Phase — Parallel Execution</div>
          </div>

          {/* Row 4: Map Tasks (3x mini cards) */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '40px',
            opacity: isStepActive([4]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            {[
              { label: 'Mapper 1', ex: exampleData.map1 },
              { label: 'Mapper 2', ex: exampleData.map2 },
              { label: 'Mapper 3', ex: exampleData.map3 }
            ].map((m, i) => (
              <MapReduceMiniCard
                key={i}
                label={m.label}
                icon={Cpu}
                color="#E8654A"
                isActive={isStepActive([4])}
                onClick={() => setSelectedComponent(map)}
                exampleText={showMapReduceExample ? m.ex : undefined}
              />
            ))}
          </div>

          {/* Phase label: SHUFFLE & SORT */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0 4px 0',
            opacity: isStepActive([5]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <div style={{
              padding: '4px 16px',
              background: 'rgba(192,127,212,0.08)',
              border: '1px solid rgba(192,127,212,0.25)',
              borderRadius: '20px',
              color: '#C07FD4',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>Shuffle & Sort — Network Transfer</div>
          </div>

          {/* Shuffle cross-connect arrows */}
          <div style={{
            padding: '8px 0',
            opacity: isStepActive([5]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <MapReduceShuffleArrows />
          </div>

          {/* Row 5: Shuffle & Sort wide card */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            opacity: isStepActive([5]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <div
              onClick={() => setSelectedComponent(shuffle)}
              className="cohere-node"
              style={{
                background: selectedComponent?.id === shuffle?.id ? '#B06FC4' : '#C07FD4',
                width: '320px', minHeight: '64px', padding: '10px 20px',
                cursor: 'pointer', flexDirection: 'column',
                outline: selectedComponent?.id === shuffle?.id ? '3px solid rgba(0,0,0,0.2)' : 'none',
                outlineOffset: '2px'
              }}
            >
              <div style={{ color: 'white', fontSize: '13px', fontWeight: '700', textAlign: 'center' }}>
                Shuffle &amp; Sort
              </div>
              <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '10px', textAlign: 'center', marginTop: '3px' }}>
                Partition by key → Transfer → Merge sort
              </div>
              {showMapReduceExample && (
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', textAlign: 'center', marginTop: '3px', fontFamily: 'monospace' }}>
                  Group: hello→[1,1,1], world→[1,1,1]
                </div>
              )}
            </div>
          </div>

          {/* Phase label: REDUCE PHASE */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0 4px 0',
            opacity: isStepActive([6]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <div style={{
              padding: '4px 16px',
              background: 'rgba(42,157,153,0.08)',
              border: '1px solid rgba(42,157,153,0.25)',
              borderRadius: '20px',
              color: '#2A9D99',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>Reduce Phase — Aggregation</div>
          </div>

          {/* Arrows: Shuffle → Reducers (fan out to 2) */}
          <div style={{
            padding: '8px 0',
            opacity: isStepActive([5, 6]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <MapReduceFanOutArrow color={connectionColors.stream} count={2} />
          </div>

          {/* Row 6: Reduce Tasks (2x mini cards) */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '40px',
            opacity: isStepActive([6]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            {[
              { label: 'Reducer 1', ex: exampleData.reduce1 },
              { label: 'Reducer 2', ex: exampleData.reduce2 }
            ].map((r, i) => (
              <MapReduceMiniCard
                key={i}
                label={r.label}
                icon={Activity}
                color="#2A9D99"
                isActive={isStepActive([6])}
                onClick={() => setSelectedComponent(reduce)}
                exampleText={showMapReduceExample ? r.ex : undefined}
              />
            ))}
          </div>

          {/* Arrows: Reducers → Output (fan in to 1) */}
          <div style={{
            padding: '8px 0',
            opacity: isStepActive([6, 7]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <MapReduceFanInArrow color={connectionColors.batch} sourceCount={2} />
          </div>

          {/* Row 7: HDFS Output */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            opacity: isStepActive([7]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <div style={{ position: 'relative' }}>
              <ComponentCard component={output} onClick={setSelectedComponent} />
              {showMapReduceExample && (
                <div style={{
                  position: 'absolute', top: '50%', left: '100%', marginLeft: '12px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(42,157,153,0.08)', borderRadius: '8px', padding: '6px 10px',
                  fontSize: '11px', color: '#2A9D99', fontFamily: 'monospace',
                  whiteSpace: 'nowrap', border: '1px solid rgba(42,157,153,0.2)'
                }}>
                  {exampleData.output}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  // Spark step labels
  const sparkSteps = [
    { label: 'Show All', description: 'View complete Spark execution pipeline' },
    { label: 'Create', description: 'Driver creates SparkContext and connects to Cluster Manager' },
    { label: 'Plan', description: 'DAG Scheduler builds execution plan from transformations' },
    { label: 'Load', description: 'Data loaded from source into distributed RDD/DataFrame partitions' },
    { label: 'Transform', description: 'Lazy transformations (map, filter, join) build the computation DAG' },
    { label: 'Shuffle', description: 'Wide transformations trigger data exchange between partitions' },
    { label: 'Action', description: 'Actions trigger execution — results collected or written to storage' }
  ];

  // Spark data transformation stages
  const sparkDataTransformStages = {
    1: {
      title: 'SparkContext Creation',
      before: { label: 'User Application', data: ['word_count.py', 'spark = SparkSession.builder\\', '  .appName("WordCount")\\', '  .getOrCreate()'] },
      operation: { label: 'Connect to Cluster', detail: 'Driver connects to YARN/K8s, requests Executor containers with CPU + memory' },
      after: { label: 'Cluster Ready', data: ['SparkContext initialized', '4 Executors allocated (4 cores, 8GB each)', 'Application ID: app-20260101-001'] },
      insight: 'Unlike MapReduce, one SparkContext can run many jobs without re-negotiating resources each time.',
      color: '#4A7A9B'
    },
    2: {
      title: 'DAG Construction & Optimization',
      before: { label: 'User Transformations', data: ['rdd = sc.textFile("/data/logs/*")', '  .flatMap(line => line.split(" "))', '  .map(word => (word, 1))', '  .reduceByKey(_ + _)'] },
      operation: { label: 'Catalyst + DAG Scheduler', detail: 'Builds a DAG of stages, optimizes query plan, pipelines narrow transforms into single stages' },
      after: { label: 'Optimized Execution Plan', data: ['Stage 0: textFile → flatMap → map', '  (pipelined — single pass!)', 'Stage 1: reduceByKey (shuffle)', '  2 stages, 4 tasks each'] },
      insight: 'Spark pipelines multiple transforms into one stage — map→filter→map runs as ONE pass over data, not three.',
      color: '#7A5A9E'
    },
    3: {
      title: 'Data Loading into Memory',
      before: { label: 'Source Data', data: ['/data/logs/jan.log (128MB)', '/data/logs/feb.log (128MB)', '/data/logs/mar.log (128MB)'] },
      operation: { label: 'Parallel Read + Partition', detail: 'Each Executor reads its assigned partitions directly into JVM memory (or off-heap with Tungsten)' },
      after: { label: 'In-Memory RDD Partitions', data: ['Executor-0: Partition 0 → [IN MEMORY]', 'Executor-1: Partition 1 → [IN MEMORY]', 'Executor-2: Partition 2 → [IN MEMORY]', '.cache() keeps data for reuse!'] },
      insight: 'Data lives in memory across operations — no disk writes between steps. This is what makes Spark 100x faster.',
      color: '#3A8080'
    },
    4: {
      title: 'Lazy Transformations (Pipelined)',
      before: { label: 'In-Memory Partitions', data: ['P0: "hello world hello"', 'P1: "foo hello world"', 'P2: "bar world foo"'] },
      operation: { label: 'flatMap → map (pipelined)', detail: 'Narrow transforms execute in a single pass — no shuffle, no disk, no network' },
      after: { label: 'Transformed Partitions (still in memory)', data: ['P0: (hello,1)(world,1)(hello,1)', 'P1: (foo,1)(hello,1)(world,1)', 'P2: (bar,1)(world,1)(foo,1)'] },
      insight: 'These transforms are lazy! Nothing executes until an action (collect, save) is called. Spark just records the plan.',
      color: '#9E5A3C'
    },
    5: {
      title: 'Shuffle Exchange (Stage Boundary)',
      before: { label: 'Partitions by Source', data: ['P0: (hello,1)(world,1)(hello,1)', 'P1: (foo,1)(hello,1)(world,1)', 'P2: (bar,1)(world,1)(foo,1)'] },
      operation: { label: 'Repartition by Key Hash', detail: 'Data redistributed across executors by key — shuffle files written to local disk temporarily' },
      after: { label: 'Partitions by Key', data: ['P0: hello→[1,1,1], foo→[1,1], bar→[1]', 'P1: world→[1,1,1]', '(reduceByKey combines locally first!)'] },
      insight: 'Shuffles are the bottleneck in Spark too — but Spark\'s combiner (map-side reduce) minimizes data transferred.',
      color: '#9E7824'
    },
    6: {
      title: 'Action Triggers Execution',
      before: { label: 'Aggregated Partitions', data: ['P0: (bar,1)(foo,2)(hello,3)', 'P1: (world,3)'] },
      operation: { label: '.saveAsTextFile() or .collect()', detail: 'Action triggers the entire DAG execution — all stages run, results materialized' },
      after: { label: 'Output Results', data: ['part-00000: bar 1, foo 2, hello 3', 'part-00001: world 3', 'Job completed in 2.3s (vs 45s MR)'] },
      insight: 'Only ONE pass through the DAG. MapReduce would need separate jobs chained together for complex pipelines.',
      color: '#4A7A56'
    }
  };

  // Reset Spark step when switching away
  useEffect(() => {
    if (activeArchitecture !== 'spark') {
      setSparkStep(0);
    }
  }, [activeArchitecture]);

  const renderSparkLayout = () => {
    const comps = currentArch.components;
    const driver = comps.find(c => c.id === 'spark-driver');
    const clusterMgr = comps.find(c => c.id === 'spark-cluster-mgr');
    const dag = comps.find(c => c.id === 'spark-dag');
    const source = comps.find(c => c.id === 'spark-source');
    const rdd = comps.find(c => c.id === 'spark-rdd');
    const transform = comps.find(c => c.id === 'spark-transform');
    const shuffle = comps.find(c => c.id === 'spark-shuffle');
    const output = comps.find(c => c.id === 'spark-output');

    const step = sparkStep;
    const isStepActive = (steps) => step === 0 || steps.includes(step);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', position: 'relative' }}>

        {/* Step selector */}
        <div style={{
          display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px', flexWrap: 'wrap'
        }}>
          {sparkSteps.map((s, i) => (
            <button key={i}
              onClick={() => setSparkStep(i)}
              title={s.description}
              style={{
                padding: '5px 14px',
                background: step === i ? '#0075de' : '#ffffff',
                border: `1px solid ${step === i ? '#0075de' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '20px',
                color: step === i ? '#ffffff' : 'rgba(0,0,0,0.5)',
                fontSize: '12px', fontWeight: step === i ? '600' : '400',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: step === i ? '0 1px 4px rgba(0,117,222,0.25)' : 'none'
              }}
            >
              {i === 0 ? 'All' : `Step ${i}`}
            </button>
          ))}
        </div>

        {/* Step description */}
        {step > 0 && (
          <div style={{
            marginBottom: '16px', padding: '8px 16px',
            background: 'rgba(0,117,222,0.06)', border: '1px solid rgba(0,117,222,0.15)',
            borderRadius: '8px', color: 'rgba(0,0,0,0.85)', fontSize: '13px', textAlign: 'center'
          }}>
            <strong style={{ color: '#0075de' }}>Step {step}:</strong> {sparkSteps[step]?.description}
          </div>
        )}

        {/* Phase labels alongside the diagram */}
        <div style={{ position: 'relative', width: '100%' }}>

          {/* Row 1: Driver Program */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            opacity: isStepActive([1]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <ComponentCard component={driver} onClick={setSelectedComponent} />
          </div>

          {/* Arrow: Driver → Cluster Manager + DAG */}
          <div style={{
            display: 'flex', justifyContent: 'center', padding: '4px 0',
            opacity: isStepActive([1, 2]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <MapReduceFanOutArrow color="#7A5A9E" count={2} cardGap={60} />
          </div>

          {/* Row 2: Cluster Manager + DAG Scheduler */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '60px',
            opacity: isStepActive([1, 2]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <ComponentCard component={clusterMgr} onClick={setSelectedComponent} />
            <ComponentCard component={dag} onClick={setSelectedComponent} />
          </div>

          {/* Arrow: down to Data Source */}
          <div style={{
            display: 'flex', justifyContent: 'center', padding: '4px 0',
            opacity: isStepActive([2, 3]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <VerticalConnectionArrow type="batch" direction="down" />
          </div>

          {/* Row 3: Data Source */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            opacity: isStepActive([3]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <ComponentCard component={source} onClick={setSelectedComponent} />
          </div>

          {/* Arrow: Data Source → RDD (fan out to 3 partitions) */}
          <div style={{
            padding: '8px 0',
            opacity: isStepActive([3]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <MapReduceFanOutArrow color="#3A8080" count={3} />
          </div>

          {/* Phase label: IN-MEMORY PARTITIONS */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px',
            opacity: isStepActive([3, 4]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <div style={{
              padding: '4px 16px', background: 'rgba(42,157,153,0.08)',
              border: '1px solid rgba(42,157,153,0.25)', borderRadius: '20px',
              color: '#2A9D99', fontSize: '11px', fontWeight: '700',
              letterSpacing: '2px', textTransform: 'uppercase'
            }}>In-Memory Partitions — No Disk I/O</div>
          </div>

          {/* Row 4: RDD / DataFrame partitions (3x mini cards) */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '40px',
            opacity: isStepActive([3, 4]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            {[
              { label: 'Partition 0', ex: '"hello world hello"' },
              { label: 'Partition 1', ex: '"foo hello world"' },
              { label: 'Partition 2', ex: '"bar world foo"' }
            ].map((p, i) => (
              <MapReduceMiniCard
                key={i} label={p.label} icon={Zap}
                color="#2A9D99"
                isActive={isStepActive([3, 4])}
                onClick={() => setSelectedComponent(rdd)}
                exampleText={showDataTransform && step >= 3 ? p.ex : undefined}
              />
            ))}
          </div>

          {/* Arrow: partitions → Transformations (parallel) */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '40px', padding: '0',
            opacity: isStepActive([4]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
                <VerticalConnectionArrow type="batch" direction="down" />
              </div>
            ))}
          </div>

          {/* Phase label: TRANSFORM PHASE */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px',
            opacity: isStepActive([4]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <div style={{
              padding: '4px 16px', background: 'rgba(232,101,74,0.08)',
              border: '1px solid rgba(232,101,74,0.25)', borderRadius: '20px',
              color: '#E8654A', fontSize: '11px', fontWeight: '700',
              letterSpacing: '2px', textTransform: 'uppercase'
            }}>Transform Phase — Pipelined In One Pass</div>
          </div>

          {/* Row 5: Transformation tasks (3x mini cards) */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '40px',
            opacity: isStepActive([4]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            {[
              { label: 'flatMap→map', ex: '(hello,1)(world,1)(hello,1)' },
              { label: 'flatMap→map', ex: '(foo,1)(hello,1)(world,1)' },
              { label: 'flatMap→map', ex: '(bar,1)(world,1)(foo,1)' }
            ].map((t, i) => (
              <MapReduceMiniCard
                key={i} label={t.label} icon={Cpu}
                color="#E8654A"
                isActive={isStepActive([4])}
                onClick={() => setSelectedComponent(transform)}
                exampleText={showDataTransform && step === 4 ? t.ex : undefined}
              />
            ))}
          </div>

          {/* Phase label: SHUFFLE EXCHANGE */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0 4px 0',
            opacity: isStepActive([5]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <div style={{
              padding: '4px 16px', background: 'rgba(192,127,212,0.08)',
              border: '1px solid rgba(192,127,212,0.25)', borderRadius: '20px',
              color: '#C07FD4', fontSize: '11px', fontWeight: '700',
              letterSpacing: '2px', textTransform: 'uppercase'
            }}>Shuffle Exchange — Stage Boundary</div>
          </div>

          {/* Shuffle cross-connect arrows (reuse MapReduce shuffle arrows) */}
          <div style={{
            padding: '8px 0',
            opacity: isStepActive([5]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <MapReduceShuffleArrows />
          </div>

          {/* Row 6: Shuffle Exchange wide card */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            opacity: isStepActive([5]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <div
              onClick={() => setSelectedComponent(shuffle)}
              className="cohere-node"
              style={{
                background: selectedComponent?.id === shuffle?.id ? '#B06FC4' : '#C07FD4',
                width: '380px', minHeight: '64px', padding: '10px 20px',
                cursor: 'pointer', flexDirection: 'column',
                outline: selectedComponent?.id === shuffle?.id ? '3px solid rgba(0,0,0,0.2)' : 'none',
                outlineOffset: '2px'
              }}
            >
              <div style={{ color: 'white', fontSize: '13px', fontWeight: '700', textAlign: 'center' }}>
                Shuffle Exchange
              </div>
              <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '10px', textAlign: 'center', marginTop: '3px' }}>
                Hash partition → Network transfer → Local disk write (temporary)
              </div>
            </div>
          </div>

          {/* Arrow: Shuffle → Output (fan out to 2 result partitions) */}
          <div style={{
            padding: '8px 0',
            opacity: isStepActive([5, 6]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <MapReduceFanOutArrow color="#4A7A56" count={2} />
          </div>

          {/* Phase label: ACTION & OUTPUT */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px',
            opacity: isStepActive([6]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <div style={{
              padding: '4px 16px', background: 'rgba(74,95,227,0.08)',
              border: '1px solid rgba(74,95,227,0.25)', borderRadius: '20px',
              color: '#4A5FE3', fontSize: '11px', fontWeight: '700',
              letterSpacing: '2px', textTransform: 'uppercase'
            }}>Action & Output — Results Materialized</div>
          </div>

          {/* Row 7: Output partitions (2x mini cards) */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '40px',
            opacity: isStepActive([6]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            {[
              { label: 'Result Part 0', ex: 'bar:1, foo:2, hello:3' },
              { label: 'Result Part 1', ex: 'world:3' }
            ].map((r, i) => (
              <MapReduceMiniCard
                key={i} label={r.label} icon={HardDrive}
                color="#4A5FE3"
                isActive={isStepActive([6])}
                onClick={() => setSelectedComponent(output)}
                exampleText={showDataTransform && step === 6 ? r.ex : undefined}
              />
            ))}
          </div>

          {/* Fan-in to final output */}
          <div style={{
            padding: '8px 0',
            opacity: isStepActive([6]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <MapReduceFanInArrow color="#4A7A56" sourceCount={2} />
          </div>

          {/* Row 8: HDFS/S3 Output */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            opacity: isStepActive([6]) ? 1 : (step > 0 ? 0.25 : 1),
            transition: 'opacity 0.5s'
          }}>
            <div style={{ position: 'relative' }}>
              <ComponentCard component={output} onClick={setSelectedComponent} />
              {step === 6 && (
                <div style={{
                  position: 'absolute', top: '50%', left: '100%', marginLeft: '12px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(74,95,227,0.08)', borderRadius: '8px', padding: '6px 10px',
                  fontSize: '11px', color: '#4A5FE3', fontFamily: 'monospace',
                  whiteSpace: 'nowrap', border: '1px solid rgba(74,95,227,0.2)'
                }}>
                  Completed in 2.3s (vs 45s MapReduce)
                </div>
              )}
            </div>
          </div>

        </div>
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

  // Radial arrow for star/snowflake schemas: draws an SVG line from center to a position
  const RadialArrow = ({ type, angle, length = 120 }) => {
    const color = connectionColors[type] || '#4A7A9B';
    const radians = (angle * Math.PI) / 180;
    const endX = Math.cos(radians) * length;
    const endY = Math.sin(radians) * length;
    const CHEVRON_OFFSET = 14;
    const chevronX = Math.cos(radians) * (length - CHEVRON_OFFSET);
    const chevronY = Math.sin(radians) * (length - CHEVRON_OFFSET);
    const chevronRotation = angle;
    const pathId = `radial-path-${type}-${angle}`;

    return (
      <g>
        <path
          id={pathId}
          d={`M 0 0 L ${endX} ${endY}`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <g transform={`translate(${chevronX}, ${chevronY}) rotate(${chevronRotation})`}>
          <polyline
            points="-6,-6 4,0 -6,6"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    );
  };

  // Chain arrow for snowflake normalization branches (dimension → sub-dimension)
  const ChainArrow = ({ type, angle, innerLength = 120, outerLength = 80 }) => {
    const color = connectionColors[type] || '#7A5A9E';
    const radians = (angle * Math.PI) / 180;
    const startX = Math.cos(radians) * innerLength;
    const startY = Math.sin(radians) * innerLength;
    const endX = Math.cos(radians) * (innerLength + outerLength);
    const endY = Math.sin(radians) * (innerLength + outerLength);
    const CHEVRON_OFFSET = 14;
    const chevronX = Math.cos(radians) * (innerLength + outerLength - CHEVRON_OFFSET);
    const chevronY = Math.sin(radians) * (innerLength + outerLength - CHEVRON_OFFSET);
    const pathId = `chain-path-${type}-${angle}`;

    return (
      <g>
        <path
          id={pathId}
          d={`M ${startX} ${startY} L ${endX} ${endY}`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 4"
        />
        <g transform={`translate(${chevronX}, ${chevronY}) rotate(${angle})`}>
          <polyline
            points="-5,-5 3,0 -5,5"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    );
  };

  // Branch arrow for snowflake: a chain that goes out at a slight angle from the main dimension direction
  const BranchArrow = ({ type, startAngle, branchAngle, innerLength = 120, outerLength = 80 }) => {
    const color = connectionColors[type] || '#7A5A9E';
    const startRadians = (startAngle * Math.PI) / 180;
    const branchRadians = (branchAngle * Math.PI) / 180;
    const startX = Math.cos(startRadians) * innerLength;
    const startY = Math.sin(startRadians) * innerLength;
    const endX = startX + Math.cos(branchRadians) * outerLength;
    const endY = startY + Math.sin(branchRadians) * outerLength;
    const CHEVRON_OFFSET = 14;
    const chevronX = endX - Math.cos(branchRadians) * CHEVRON_OFFSET;
    const chevronY = endY - Math.sin(branchRadians) * CHEVRON_OFFSET;
    const pathId = `branch-path-${type}-${startAngle}-${branchAngle}`;

    return (
      <g>
        <path
          id={pathId}
          d={`M ${startX} ${startY} L ${endX} ${endY}`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 4"
        />
        <g transform={`translate(${chevronX}, ${chevronY}) rotate(${branchAngle})`}>
          <polyline
            points="-5,-5 3,0 -5,5"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    );
  };

  // Helper: calculate Y center of a column row relative to the table's top edge
  const getERColY = (colIndex, isSubTable = false) => {
    if (isSubTable) {
      // ERSubTable: header ~30px, section pad 3px, row stride ~22px
      return 30 + 3 + colIndex * 22 + 11;
    }
    // ERTable: header ~36px, section pad 4px, row stride ~25px
    return 36 + 4 + colIndex * 25 + 12;
  };

  // Helper: build a cubic bezier SVG path between two column connection points
  // sameSide: both endpoints exit from same side of their tables (needs outward bow)
  // bowSide: 'right' bows +x, 'left' bows -x (only used when sameSide is true)
  const buildConnectionPath = (x1, y1, x2, y2, sameSide = false, bowSide = 'right') => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (sameSide) {
      const bow = Math.max(60, Math.min(Math.abs(dy) * 0.45, 140));
      const sign = bowSide === 'right' ? 1 : -1;
      return `M ${x1} ${y1} C ${x1 + sign * bow} ${y1}, ${x2 + sign * bow} ${y2}, ${x2} ${y2}`;
    }
    // Opposite sides — smooth C-curve
    const cpOffset = Math.max(50, Math.min(dist * 0.35, 130));
    const sign = dx > 0 ? 1 : -1;
    return `M ${x1} ${y1} C ${x1 + sign * cpOffset} ${y1}, ${x2 - sign * cpOffset} ${y2}, ${x2} ${y2}`;
  };

  // ER Diagram Table component for schema visuals
  const ERTable = ({ title, type, columns, style: posStyle, onClick, id, highlightedColumns = [] }) => {
    const isFact = type === 'fact';
    const headerBg = isFact ? 'linear-gradient(135deg, #9E7824, #9E7824)' : 'linear-gradient(135deg, #4A7A9B, #2563eb)';
    const borderColor = isFact ? '#9E7824' : '#4A7A9B';
    const glowColor = isFact ? 'rgba(158, 120, 36, 0.3)' : 'rgba(96, 165, 250, 0.2)';

    return (
      <div
        onClick={onClick}
        style={{
          background: 'rgba(245,243,239,0.95)',
          border: `2px solid ${borderColor}`,
          borderRadius: '8px',
          minWidth: '220px',
          cursor: 'pointer',
          boxShadow: `0 4px 20px ${glowColor}`,
          transition: 'all 0.2s ease',
          ...posStyle
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 32px ${glowColor}, 0 0 20px ${glowColor}`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 20px ${glowColor}`; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {/* Table header */}
        <div style={{
          background: headerBg,
          padding: '10px 14px',
          borderRadius: '6px 6px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {isFact ? <Table2 size={16} color="#fff" /> : <Layers size={16} color="#fff" />}
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>{title}</span>
        </div>
        {/* Column rows */}
        <div style={{ padding: '4px 0' }}>
          {columns.map((col, idx) => {
            const isHL = highlightedColumns.includes(col.name);
            return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 14px',
                borderBottom: idx < columns.length - 1 ? '1px solid rgba(235,231,225,1)' : 'none',
                fontSize: '12px',
                background: isHL ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                boxShadow: isHL ? 'inset 0 0 0 1px rgba(96, 165, 250, 0.4)' : 'none',
                borderRadius: isHL ? '4px' : '0',
                transition: 'background 0.2s, box-shadow 0.2s'
              }}
            >
              {col.pk && (
                <span style={{
                  background: isHL ? 'rgba(158, 120, 36, 0.4)' : 'rgba(158, 120, 36, 0.2)',
                  color: '#C8A84E',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontWeight: '700',
                  border: '1px solid rgba(158, 120, 36, 0.4)',
                  flexShrink: 0
                }}>PK</span>
              )}
              {col.fk && (
                <span style={{
                  background: isHL ? 'rgba(74, 122, 155, 0.4)' : 'rgba(74, 122, 155, 0.2)',
                  color: '#4A7A9B',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontWeight: '700',
                  border: '1px solid rgba(74, 122, 155, 0.4)',
                  flexShrink: 0
                }}>FK</span>
              )}
              <span style={{ color: col.pk ? '#9E7824' : col.fk ? '#4A7A9B' : 'var(--text-body)', fontWeight: col.pk || col.fk ? '600' : '400', fontFamily: 'monospace' }}>
                {col.name}
              </span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '11px', fontFamily: 'monospace' }}>{col.type}</span>
            </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStarLayout = () => {
    const comps = currentArch.components;
    const fact = comps.find(c => c.id === 'fact-sales');

    // ER diagram table definitions with PK/FK columns
    const factCols = [
      { name: 'sale_id', type: 'BIGINT', pk: true },
      { name: 'date_key', type: 'INT', fk: true },
      { name: 'product_key', type: 'INT', fk: true },
      { name: 'customer_key', type: 'INT', fk: true },
      { name: 'store_key', type: 'INT', fk: true },
      { name: 'quantity', type: 'INT' },
      { name: 'sale_amount', type: 'DECIMAL' },
      { name: 'discount', type: 'DECIMAL' },
      { name: 'tax', type: 'DECIMAL' }
    ];
    const dimCustomerCols = [
      { name: 'customer_key', type: 'INT', pk: true },
      { name: 'name', type: 'VARCHAR' },
      { name: 'email', type: 'VARCHAR' },
      { name: 'city', type: 'VARCHAR' },
      { name: 'state', type: 'VARCHAR' },
      { name: 'country', type: 'VARCHAR' },
      { name: 'segment', type: 'VARCHAR' }
    ];
    const dimProductCols = [
      { name: 'product_key', type: 'INT', pk: true },
      { name: 'product_name', type: 'VARCHAR' },
      { name: 'category_name', type: 'VARCHAR' },
      { name: 'brand_name', type: 'VARCHAR' },
      { name: 'subcategory', type: 'VARCHAR' },
      { name: 'price_tier', type: 'VARCHAR' }
    ];
    const dimDateCols = [
      { name: 'date_key', type: 'INT', pk: true },
      { name: 'full_date', type: 'DATE' },
      { name: 'day_of_week', type: 'VARCHAR' },
      { name: 'month', type: 'INT' },
      { name: 'quarter', type: 'INT' },
      { name: 'year', type: 'INT' },
      { name: 'is_holiday', type: 'BOOLEAN' }
    ];
    const dimStoreCols = [
      { name: 'store_key', type: 'INT', pk: true },
      { name: 'store_name', type: 'VARCHAR' },
      { name: 'region', type: 'VARCHAR' },
      { name: 'city', type: 'VARCHAR' },
      { name: 'state', type: 'VARCHAR' },
      { name: 'store_type', type: 'VARCHAR' }
    ];

    const SVG_W = 960;
    const SVG_H = 720;

    // Positions for ER diagram layout (fact centered, dims at corners)
    const factPos = { x: 350, y: 240 };
    const dimPositions = [
      { id: 'dim-customer', label: 'dim_customer', cols: dimCustomerCols, x: 20, y: 10, fkLine: { startLabel: 'customer_key' } },
      { id: 'dim-product', label: 'dim_product', cols: dimProductCols, x: 700, y: 10, fkLine: { startLabel: 'product_key' } },
      { id: 'dim-store', label: 'dim_store', cols: dimStoreCols, x: 20, y: 470, fkLine: { startLabel: 'store_key' } },
      { id: 'dim-date', label: 'dim_date', cols: dimDateCols, x: 700, y: 470, fkLine: { startLabel: 'date_key' } }
    ];

    // Column-level FK → PK connection definitions
    const TABLE_W = 220;
    const starConnections = [
      { id: 'customer_key', fkCol: 'customer_key', fkIdx: factCols.findIndex(c => c.name === 'customer_key'), pkIdx: 0, dimKey: 'dim-customer', dimIdx: 0, fromSide: 'left', toSide: 'right' },
      { id: 'product_key', fkCol: 'product_key', fkIdx: factCols.findIndex(c => c.name === 'product_key'), pkIdx: 0, dimKey: 'dim-product', dimIdx: 1, fromSide: 'right', toSide: 'left' },
      { id: 'store_key', fkCol: 'store_key', fkIdx: factCols.findIndex(c => c.name === 'store_key'), pkIdx: 0, dimKey: 'dim-store', dimIdx: 2, fromSide: 'left', toSide: 'right' },
      { id: 'date_key', fkCol: 'date_key', fkIdx: factCols.findIndex(c => c.name === 'date_key'), pkIdx: 0, dimKey: 'dim-date', dimIdx: 3, fromSide: 'right', toSide: 'left' }
    ];

    // Compute highlighted columns for each table based on hovered connection
    const factHighlight = hoveredConnection && hoveredConnection.schema === 'star' ? [hoveredConnection.fkCol] : [];
    const dimHighlights = {};
    dimPositions.forEach(d => { dimHighlights[d.id] = []; });
    if (hoveredConnection && hoveredConnection.schema === 'star') {
      const conn = starConnections.find(c => c.id === hoveredConnection.id);
      if (conn) dimHighlights[conn.dimKey] = [conn.fkCol];
    }

    return (
      <div style={{ position: 'relative', width: `${SVG_W}px`, height: `${SVG_H}px`, margin: '0 auto' }}>
        {/* SVG layer for FK connection lines */}
        <svg
          width={SVG_W}
          height={SVG_H}
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        >
          <defs>
            <filter id="glow-star">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {starConnections.map((conn) => {
            const dim = dimPositions[conn.dimIdx];
            const isHovered = hoveredConnection && hoveredConnection.schema === 'star' && hoveredConnection.id === conn.id;

            // FK row exit point on fact table edge
            const fkY = factPos.y + getERColY(conn.fkIdx);
            const fkX = conn.fromSide === 'left' ? factPos.x : factPos.x + TABLE_W;

            // PK row entry point on dim table edge
            const pkY = dim.y + getERColY(conn.pkIdx);
            const pkX = conn.toSide === 'left' ? dim.x : dim.x + TABLE_W;

            const pathD = buildConnectionPath(fkX, fkY, pkX, pkY);
            const midX = (fkX + pkX) / 2;
            const midY = (fkY + pkY) / 2;
            const labelW = conn.fkCol.length * 7 + 16;

            return (
              <g key={`star-conn-${conn.id}`}>
                {/* Visible path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isHovered ? '#8AAACE' : '#4A7A9B'}
                  strokeWidth={isHovered ? 3 : 1.5}
                  strokeOpacity={isHovered ? 1 : 0.7}
                  filter={isHovered ? 'url(#glow-star)' : 'none'}
                  style={{ transition: 'stroke 0.2s, stroke-width 0.2s, stroke-opacity 0.2s' }}
                />
                {/* Invisible wide hit area for hover */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="14"
                  style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                  onMouseEnter={() => setHoveredConnection({ schema: 'star', id: conn.id, fkCol: conn.fkCol })}
                  onMouseLeave={() => setHoveredConnection(null)}
                />
                {/* Endpoint dots */}
                <circle cx={fkX} cy={fkY} r={isHovered ? 5 : 3.5} fill={isHovered ? '#8AAACE' : '#4A7A9B'} style={{ transition: 'r 0.2s, fill 0.2s' }} />
                <circle cx={pkX} cy={pkY} r={isHovered ? 5 : 3.5} fill={isHovered ? '#8AAACE' : '#4A7A9B'} style={{ transition: 'r 0.2s, fill 0.2s' }} />
                {/* FK label badge at midpoint */}
                <rect
                  x={midX - labelW / 2}
                  y={midY - 11}
                  width={labelW}
                  height="22"
                  rx="6"
                  fill={isHovered ? 'rgba(30, 58, 138, 0.95)' : 'rgba(15, 23, 42, 0.9)'}
                  stroke={isHovered ? '#8AAACE' : 'rgba(96, 165, 250, 0.4)'}
                  strokeWidth="1"
                  style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill={isHovered ? '#bfdbfe' : '#4A7A9B'}
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="monospace"
                  style={{ transition: 'fill 0.2s' }}
                >
                  {conn.fkCol}
                </text>
                {/* Cardinality: N at fact side, 1 at dim side */}
                <text x={fkX + (conn.fromSide === 'left' ? -16 : 8)} y={fkY - 10} fill={isHovered ? '#4A7A9B' : 'var(--text-secondary)'} fontSize="10" fontWeight="600" fontFamily="monospace">N</text>
                <text x={pkX + (conn.toSide === 'left' ? -12 : 6)} y={pkY - 10} fill={isHovered ? '#4A7A9B' : 'var(--text-secondary)'} fontSize="10" fontWeight="600" fontFamily="monospace">1</text>
              </g>
            );
          })}
        </svg>

        {/* Fact table (center) */}
        <div style={{ position: 'absolute', left: factPos.x, top: factPos.y, zIndex: 2 }}>
          <ERTable
            title="fact_sales"
            type="fact"
            id="fact-sales"
            columns={factCols}
            highlightedColumns={factHighlight}
            onClick={() => setSelectedComponent(fact)}
          />
        </div>

        {/* Dimension tables (corners) */}
        {dimPositions.map((dim) => {
          const comp = comps.find(c => c.id === dim.id);
          return (
            <div key={dim.id} style={{ position: 'absolute', left: dim.x, top: dim.y, zIndex: 2 }}>
              <ERTable
                title={dim.label}
                type="dimension"
                id={dim.id}
                columns={dim.cols}
                highlightedColumns={dimHighlights[dim.id] || []}
                onClick={() => setSelectedComponent(comp)}
              />
            </div>
          );
        })}

        {/* Star schema label */}
        <div style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#9E7824',
          fontSize: '13px',
          fontWeight: '600',
          opacity: 0.8
        }}>
          <Star size={16} />
          <span>Star Schema: 1 fact table, 4 denormalized dimensions — each dimension is a single flat table (no sub-tables)</span>
        </div>
      </div>
    );
  };

  // Sub-dimension ER table (purple themed for normalized branches)
  const ERSubTable = ({ title, columns, style: posStyle, onClick, highlightedColumns = [] }) => {
    return (
      <div
        onClick={onClick}
        style={{
          background: 'rgba(245,243,239,0.95)',
          border: '2px solid #7A5A9E',
          borderRadius: '8px',
          minWidth: '190px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(122, 90, 158, 0.2)',
          transition: 'all 0.2s ease',
          ...posStyle
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(122, 90, 158, 0.3), 0 0 20px rgba(122, 90, 158, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(122, 90, 158, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #7A5A9E, #7A5A9E)',
          padding: '8px 12px',
          borderRadius: '6px 6px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Link size={14} color="#fff" />
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>{title}</span>
          <span style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.2)',
            padding: '1px 6px',
            borderRadius: '3px',
            fontSize: '9px',
            color: '#e9d5ff',
            fontWeight: '600'
          }}>3NF</span>
        </div>
        <div style={{ padding: '3px 0' }}>
          {columns.map((col, idx) => {
            const isHL = highlightedColumns.includes(col.name);
            return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderBottom: idx < columns.length - 1 ? '1px solid rgba(235,231,225,1)' : 'none',
                fontSize: '11px',
                background: isHL ? 'rgba(122, 90, 158, 0.15)' : 'transparent',
                boxShadow: isHL ? 'inset 0 0 0 1px rgba(122, 90, 158, 0.4)' : 'none',
                borderRadius: isHL ? '4px' : '0',
                transition: 'background 0.2s, box-shadow 0.2s'
              }}
            >
              {col.pk && <span style={{ background: isHL ? 'rgba(158, 120, 36, 0.4)' : 'rgba(158, 120, 36, 0.2)', color: '#C8A84E', padding: '1px 4px', borderRadius: '3px', fontSize: '8px', fontWeight: '700', border: '1px solid rgba(158, 120, 36, 0.4)', flexShrink: 0 }}>PK</span>}
              {col.fk && <span style={{ background: isHL ? 'rgba(122, 90, 158, 0.4)' : 'rgba(122, 90, 158, 0.2)', color: '#c084fc', padding: '1px 4px', borderRadius: '3px', fontSize: '8px', fontWeight: '700', border: '1px solid rgba(122, 90, 158, 0.4)', flexShrink: 0 }}>FK</span>}
              <span style={{ color: col.pk ? '#9E7824' : col.fk ? '#7A5A9E' : 'var(--text-body)', fontWeight: col.pk || col.fk ? '600' : '400', fontFamily: 'monospace', fontSize: '11px' }}>{col.name}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '10px', fontFamily: 'monospace' }}>{col.type}</span>
            </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSnowflakeLayout = () => {
    const comps = currentArch.components;

    // Snowflake ER tables
    const factCols = [
      { name: 'encounter_id', type: 'BIGINT', pk: true },
      { name: 'patient_key', type: 'INT', fk: true },
      { name: 'physician_key', type: 'INT', fk: true },
      { name: 'diagnosis_key', type: 'INT', fk: true },
      { name: 'date_key', type: 'INT', fk: true },
      { name: 'charges', type: 'DECIMAL' },
      { name: 'length_of_stay', type: 'INT' },
      { name: 'admission_type', type: 'VARCHAR' }
    ];
    const dimPatientCols = [
      { name: 'patient_key', type: 'INT', pk: true },
      { name: 'name', type: 'VARCHAR' },
      { name: 'dob', type: 'DATE' },
      { name: 'gender', type: 'VARCHAR' },
      { name: 'insurance_key', type: 'INT', fk: true }
    ];
    const dimPhysicianCols = [
      { name: 'physician_key', type: 'INT', pk: true },
      { name: 'name', type: 'VARCHAR' },
      { name: 'specialty', type: 'VARCHAR' },
      { name: 'department_key', type: 'INT', fk: true }
    ];
    const dimDiagnosisCols = [
      { name: 'diagnosis_key', type: 'INT', pk: true },
      { name: 'icd_code', type: 'VARCHAR' },
      { name: 'description', type: 'VARCHAR' },
      { name: 'category_key', type: 'INT', fk: true }
    ];
    const dimDateCols = [
      { name: 'date_key', type: 'INT', pk: true },
      { name: 'full_date', type: 'DATE' },
      { name: 'day_of_week', type: 'VARCHAR' },
      { name: 'month', type: 'INT' },
      { name: 'year', type: 'INT' },
      { name: 'is_holiday', type: 'BOOLEAN' }
    ];
    // Sub-dimensions (normalized)
    const subInsuranceCols = [
      { name: 'insurance_key', type: 'INT', pk: true },
      { name: 'provider_name', type: 'VARCHAR' },
      { name: 'plan_type', type: 'VARCHAR' },
      { name: 'coverage_level', type: 'VARCHAR' }
    ];
    const subDeptCols = [
      { name: 'department_key', type: 'INT', pk: true },
      { name: 'dept_name', type: 'VARCHAR' },
      { name: 'hospital_key', type: 'INT', fk: true },
      { name: 'floor', type: 'INT' }
    ];
    const subHospitalCols = [
      { name: 'hospital_key', type: 'INT', pk: true },
      { name: 'hospital_name', type: 'VARCHAR' },
      { name: 'city', type: 'VARCHAR' },
      { name: 'state', type: 'VARCHAR' },
      { name: 'bed_count', type: 'INT' }
    ];
    const subDxCatCols = [
      { name: 'category_key', type: 'INT', pk: true },
      { name: 'category_name', type: 'VARCHAR' },
      { name: 'group_name', type: 'VARCHAR' }
    ];

    const SVG_W = 1100;
    const SVG_H = 920;
    const SNOW_TW = 220;   // ERTable width
    const SNOW_SW = 190;   // ERSubTable width

    // Positions — organized as a clear ER diagram layout
    const tables = {
      fact:       { x: 420, y: 330 },
      patient:    { x: 60,  y: 160 },
      physician:  { x: 780, y: 160 },
      diagnosis:  { x: 420, y: 640 },
      date:       { x: 60,  y: 560 },
      insurance:  { x: 60,  y: 0 },
      department: { x: 780, y: 0 },
      hospital:   { x: 880, y: 340 },
      dxCategory: { x: 420, y: 830 }
    };

    // Column-level connection definitions for snowflake schema
    const snowConnections = [
      // FK connections: fact → dimensions
      { id: 'patient_key', fkCol: 'patient_key', isNorm: false,
        fkIdx: 1, fromPos: tables.fact, fromW: SNOW_TW, fromSub: false,
        pkIdx: 0, toPos: tables.patient, toW: SNOW_TW, toSub: false,
        fromSide: 'left', toSide: 'right' },
      { id: 'physician_key', fkCol: 'physician_key', isNorm: false,
        fkIdx: 2, fromPos: tables.fact, fromW: SNOW_TW, fromSub: false,
        pkIdx: 0, toPos: tables.physician, toW: SNOW_TW, toSub: false,
        fromSide: 'right', toSide: 'left' },
      { id: 'diagnosis_key', fkCol: 'diagnosis_key', isNorm: false,
        fkIdx: 3, fromPos: tables.fact, fromW: SNOW_TW, fromSub: false,
        pkIdx: 0, toPos: tables.diagnosis, toW: SNOW_TW, toSub: false,
        fromSide: 'right', toSide: 'right', sameSide: true, bowSide: 'right' },
      { id: 'date_key', fkCol: 'date_key', isNorm: false,
        fkIdx: 4, fromPos: tables.fact, fromW: SNOW_TW, fromSub: false,
        pkIdx: 0, toPos: tables.date, toW: SNOW_TW, toSub: false,
        fromSide: 'left', toSide: 'right' },
      // Normalization connections: dim → sub-dim
      { id: 'insurance_key', fkCol: 'insurance_key', isNorm: true,
        fkIdx: 4, fromPos: tables.patient, fromW: SNOW_TW, fromSub: false,
        pkIdx: 0, toPos: tables.insurance, toW: SNOW_SW, toSub: true,
        fromSide: 'right', toSide: 'right', sameSide: true, bowSide: 'right' },
      { id: 'department_key', fkCol: 'department_key', isNorm: true,
        fkIdx: 3, fromPos: tables.physician, fromW: SNOW_TW, fromSub: false,
        pkIdx: 0, toPos: tables.department, toW: SNOW_SW, toSub: true,
        fromSide: 'left', toSide: 'left', sameSide: true, bowSide: 'left' },
      { id: 'hospital_key', fkCol: 'hospital_key', isNorm: true,
        fkIdx: 2, fromPos: tables.department, fromW: SNOW_SW, fromSub: true,
        pkIdx: 0, toPos: tables.hospital, toW: SNOW_SW, toSub: true,
        fromSide: 'right', toSide: 'left' },
      { id: 'category_key', fkCol: 'category_key', isNorm: true,
        fkIdx: 3, fromPos: tables.diagnosis, fromW: SNOW_TW, fromSub: false,
        pkIdx: 0, toPos: tables.dxCategory, toW: SNOW_SW, toSub: true,
        fromSide: 'left', toSide: 'left', sameSide: true, bowSide: 'left' }
    ];

    // Compute highlighted columns per table based on hovered connection
    const snowHighlights = {};
    const snowTableKeys = ['fact', 'patient', 'physician', 'diagnosis', 'date', 'insurance', 'department', 'hospital', 'dxCategory'];
    snowTableKeys.forEach(k => { snowHighlights[k] = []; });
    if (hoveredConnection && hoveredConnection.schema === 'snow') {
      const conn = snowConnections.find(c => c.id === hoveredConnection.id);
      if (conn) {
        // Find which table keys match from/to positions
        const fromKey = snowTableKeys.find(k => tables[k] === conn.fromPos);
        const toKey = snowTableKeys.find(k => tables[k] === conn.toPos);
        if (fromKey) snowHighlights[fromKey] = [...snowHighlights[fromKey], conn.fkCol];
        if (toKey) snowHighlights[toKey] = [...snowHighlights[toKey], conn.fkCol];
      }
    }

    return (
      <div style={{ position: 'relative', width: `${SVG_W}px`, height: `${SVG_H}px`, margin: '0 auto' }}>
        {/* SVG for all connections */}
        <svg width={SVG_W} height={SVG_H} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
          <defs>
            <filter id="glow-snow-fk">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-snow-norm">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {snowConnections.map((conn) => {
            const isHovered = hoveredConnection && hoveredConnection.schema === 'snow' && hoveredConnection.id === conn.id;
            const color = conn.isNorm ? '#7A5A9E' : '#4A7A9B';
            const hoverColor = conn.isNorm ? '#c084fc' : '#8AAACE';
            const glowId = conn.isNorm ? 'glow-snow-norm' : 'glow-snow-fk';

            // FK row exit point
            const fkY = conn.fromPos.y + getERColY(conn.fkIdx, conn.fromSub);
            const fkX = conn.fromSide === 'left' ? conn.fromPos.x : conn.fromPos.x + conn.fromW;

            // PK row entry point
            const pkY = conn.toPos.y + getERColY(conn.pkIdx, conn.toSub);
            const pkX = conn.toSide === 'left' ? conn.toPos.x : conn.toPos.x + conn.toW;

            const pathD = buildConnectionPath(fkX, fkY, pkX, pkY, !!conn.sameSide, conn.bowSide || 'right');
            const midX = (fkX + pkX) / 2 + (conn.sameSide ? (conn.bowSide === 'right' ? 40 : -40) : 0);
            const midY = (fkY + pkY) / 2;
            const labelW = conn.fkCol.length * 7 + 16;

            return (
              <g key={`snow-conn-${conn.id}`}>
                {/* Visible path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isHovered ? hoverColor : color}
                  strokeWidth={isHovered ? 3 : 1.5}
                  strokeOpacity={isHovered ? 1 : 0.7}
                  strokeDasharray={conn.isNorm ? '6 4' : 'none'}
                  filter={isHovered ? `url(#${glowId})` : 'none'}
                  style={{ transition: 'stroke 0.2s, stroke-width 0.2s, stroke-opacity 0.2s' }}
                />
                {/* Invisible hit area */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="14"
                  style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                  onMouseEnter={() => setHoveredConnection({ schema: 'snow', id: conn.id, fkCol: conn.fkCol })}
                  onMouseLeave={() => setHoveredConnection(null)}
                />
                {/* Endpoint dots */}
                <circle cx={fkX} cy={fkY} r={isHovered ? 5 : 3.5} fill={isHovered ? hoverColor : color} style={{ transition: 'r 0.2s, fill 0.2s' }} />
                <circle cx={pkX} cy={pkY} r={isHovered ? 5 : 3.5} fill={isHovered ? hoverColor : color} style={{ transition: 'r 0.2s, fill 0.2s' }} />
                {/* Label badge */}
                <rect
                  x={midX - labelW / 2}
                  y={midY - 11}
                  width={labelW}
                  height="22"
                  rx="6"
                  fill={isHovered ? (conn.isNorm ? 'rgba(88, 28, 135, 0.95)' : 'rgba(30, 58, 138, 0.95)') : 'rgba(15, 23, 42, 0.9)'}
                  stroke={isHovered ? hoverColor : `${color}66`}
                  strokeWidth="1"
                  style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill={isHovered ? (conn.isNorm ? '#e9d5ff' : '#bfdbfe') : color}
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="monospace"
                  style={{ transition: 'fill 0.2s' }}
                >
                  {conn.fkCol}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Fact Table */}
        <div style={{ position: 'absolute', left: tables.fact.x, top: tables.fact.y, zIndex: 2 }}>
          <ERTable title="fact_encounters" type="fact" columns={factCols} highlightedColumns={snowHighlights.fact} onClick={() => setSelectedComponent(comps.find(c => c.id === 'fact-encounters'))} />
        </div>

        {/* Direct Dimensions */}
        <div style={{ position: 'absolute', left: tables.patient.x, top: tables.patient.y, zIndex: 2 }}>
          <ERTable title="dim_patient" type="dimension" columns={dimPatientCols} highlightedColumns={snowHighlights.patient} onClick={() => setSelectedComponent(comps.find(c => c.id === 'dim-patient'))} />
        </div>
        <div style={{ position: 'absolute', left: tables.physician.x, top: tables.physician.y, zIndex: 2 }}>
          <ERTable title="dim_physician" type="dimension" columns={dimPhysicianCols} highlightedColumns={snowHighlights.physician} onClick={() => setSelectedComponent(comps.find(c => c.id === 'dim-physician'))} />
        </div>
        <div style={{ position: 'absolute', left: tables.diagnosis.x, top: tables.diagnosis.y, zIndex: 2 }}>
          <ERTable title="dim_diagnosis" type="dimension" columns={dimDiagnosisCols} highlightedColumns={snowHighlights.diagnosis} onClick={() => setSelectedComponent(comps.find(c => c.id === 'dim-diagnosis'))} />
        </div>
        <div style={{ position: 'absolute', left: tables.date.x, top: tables.date.y, zIndex: 2 }}>
          <ERTable title="dim_date" type="dimension" columns={dimDateCols} highlightedColumns={snowHighlights.date} onClick={() => setSelectedComponent(comps.find(c => c.id === 'dim-date'))} />
        </div>

        {/* Sub-dimensions (normalized) */}
        <div style={{ position: 'absolute', left: tables.insurance.x, top: tables.insurance.y, zIndex: 2 }}>
          <ERSubTable title="dim_insurance" columns={subInsuranceCols} highlightedColumns={snowHighlights.insurance} onClick={() => setSelectedComponent(comps.find(c => c.id === 'dim-insurance'))} />
        </div>
        <div style={{ position: 'absolute', left: tables.department.x, top: tables.department.y, zIndex: 2 }}>
          <ERSubTable title="dim_department" columns={subDeptCols} highlightedColumns={snowHighlights.department} onClick={() => setSelectedComponent(comps.find(c => c.id === 'dim-department'))} />
        </div>
        <div style={{ position: 'absolute', left: tables.hospital.x, top: tables.hospital.y, zIndex: 2 }}>
          <ERSubTable title="dim_hospital" columns={subHospitalCols} highlightedColumns={snowHighlights.hospital} onClick={() => setSelectedComponent(comps.find(c => c.id === 'dim-hospital'))} />
        </div>
        <div style={{ position: 'absolute', left: tables.dxCategory.x, top: tables.dxCategory.y, zIndex: 2 }}>
          <ERSubTable title="dim_dx_category" columns={subDxCatCols} highlightedColumns={snowHighlights.dxCategory} onClick={() => setSelectedComponent(comps.find(c => c.id === 'dim-dx-category'))} />
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '24px', height: '2px', background: '#4A7A9B' }} />
            <span style={{ color: '#4A7A9B', fontWeight: '600' }}>FK (Foreign Key)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '24px', height: '2px', background: '#7A5A9E', borderTop: '2px dashed #7A5A9E' }} />
            <span style={{ color: '#7A5A9E', fontWeight: '600' }}>3NF Normalized</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Snowflake size={14} color="#3A8080" />
            <span style={{ color: '#3A8080', fontWeight: '600' }}>Snowflake: Dimensions branch into sub-tables</span>
          </div>
        </div>
      </div>
    );
  };

  // Custom Node Components for React Flow Decision Tree
  const StartNode = ({ data }) => {
    return (
      <div style={{
        padding: '18px 32px',
        background: 'linear-gradient(135deg, #a78bfa 0%, #7A5A9E 100%)',
        border: '3px solid #a78bfa',
        borderRadius: '16px',
        color: 'var(--text-primary)',
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
          ? 'linear-gradient(135deg, rgba(74, 122, 155, 0.5) 0%, rgba(37, 99, 235, 0.4) 100%)'
          : 'linear-gradient(135deg, rgba(74, 122, 155, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%)',
        border: `3px solid ${isExpanded ? '#4A7A9B' : '#4A7A9B'}`,
        borderRadius: '16px',
        color: 'var(--text-primary)',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isExpanded
          ? '0 10px 30px rgba(74, 122, 155, 0.4), 0 0 0 1px rgba(74, 122, 155, 0.2)'
          : '0 6px 16px rgba(74, 122, 155, 0.25)',
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
          style={{ background: '#4A7A9B', width: 12, height: 12, border: '2px solid #fff' }}
        />
        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        <span>{data.label}</span>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#4A7A9B', width: 12, height: 12, border: '2px solid #fff' }}
        />
      </div>
    );
  };

  const ArchitectureNode = ({ data }) => {
    const colors = {
      batch: { gradient: 'linear-gradient(135deg, #22c55e 0%, #4A7A56 100%)', border: '#22c55e', shadow: 'rgba(34, 197, 94, 0.5)' },
      lambda: { gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: '#ef4444', shadow: 'rgba(239, 68, 68, 0.5)' },
      kappa: { gradient: 'linear-gradient(135deg, #4A7A9B 0%, #2563eb 100%)', border: '#4A7A9B', shadow: 'rgba(74, 122, 155, 0.5)' },
      streaming: { gradient: 'linear-gradient(135deg, #9E7824 0%, #9E7824 100%)', border: '#9E7824', shadow: 'rgba(158, 120, 36, 0.5)' }
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
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
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
      style: { stroke: '#4A7A9B', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: 'var(--text-primary)', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#F0EDE8', fillOpacity: 0.95 }
    },
    {
      id: 'realtime-no',
      source: 'realtimeQuestion',
      target: 'batchAnalyticsQuestion',
      label: 'No',
      animated: true,
      style: { stroke: '#4A7A9B', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: 'var(--text-primary)', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#F0EDE8', fillOpacity: 0.95 }
    },
    {
      id: 'realtimeYes-lambda1',
      source: 'realtimeYesQuestion',
      target: 'lambda1',
      label: 'Yes',
      animated: true,
      style: { stroke: '#ef4444', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: 'var(--text-primary)', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#F0EDE8', fillOpacity: 0.95 }
    },
    {
      id: 'realtimeYes-reprocessing',
      source: 'realtimeYesQuestion',
      target: 'reprocessingQuestion',
      label: 'No',
      animated: true,
      style: { stroke: '#4A7A9B', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: 'var(--text-primary)', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#F0EDE8', fillOpacity: 0.95 }
    },
    {
      id: 'batchAnalytics-batch',
      source: 'batchAnalyticsQuestion',
      target: 'batch',
      label: 'Yes',
      animated: true,
      style: { stroke: '#22c55e', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: 'var(--text-primary)', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#F0EDE8', fillOpacity: 0.95 }
    },
    {
      id: 'batchAnalytics-batch2',
      source: 'batchAnalyticsQuestion',
      target: 'batch',
      label: 'No',
      animated: true,
      style: { stroke: '#22c55e', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: 'var(--text-primary)', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#F0EDE8', fillOpacity: 0.95 }
    },
    {
      id: 'reprocessing-kappa',
      source: 'reprocessingQuestion',
      target: 'kappa',
      label: 'Yes',
      animated: true,
      style: { stroke: '#4A7A9B', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: 'var(--text-primary)', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#F0EDE8', fillOpacity: 0.95 }
    },
    {
      id: 'reprocessing-streaming',
      source: 'reprocessingQuestion',
      target: 'streaming',
      label: 'No',
      animated: true,
      style: { stroke: '#9E7824', strokeWidth: 3 },
      type: 'step',
      labelStyle: { fill: 'var(--text-primary)', fontWeight: 600, fontSize: 13 },
      labelBgStyle: { fill: '#F0EDE8', fillOpacity: 0.95 }
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
          background: 'rgba(245,243,239,0.8)',
          
          border: '1px solid rgba(158, 120, 36, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px', color: '#9E7824' }}>
                {curriculumData.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                {curriculumData.subtitle}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9E7824' }}>
                {progress}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Overall Progress</div>
            </div>
          </div>
          {/* Overall Progress Bar */}
          <div style={{
            background: 'rgba(158, 120, 36, 0.1)',
            borderRadius: '8px',
            height: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #9E7824, #9E7824)',
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
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  
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
                    background: 'var(--bg-page)',
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
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{currentPhase.subtitle}</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-body)', fontSize: '15px', marginBottom: '12px' }}>
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
                        : 'rgba(245,243,239,0.8)',
                      border: `2px solid ${isSelected ? phaseColors[activePhase].primary : isCompleted ? '#4A7A56' : 'rgba(235,231,225,1)'}`,
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
                        e.currentTarget.style.borderColor = isCompleted ? '#4A7A56' : 'rgba(235,231,225,1)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{
                            background: isCompleted ? 'rgba(74, 122, 86, 0.2)' : phaseColors[activePhase].light,
                            border: `1px solid ${isCompleted ? '#4A7A56' : phaseColors[activePhase].border}`,
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: isCompleted ? '#4A7A56' : phaseColors[activePhase].primary
                          }}>
                            Level {level.id}
                          </span>
                          {isCompleted && (
                            <span style={{ color: '#4A7A56', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={16} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                          {level.name}
                        </h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
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
                              background: 'rgba(58, 128, 128, 0.15)',
                              border: '1px solid rgba(58, 128, 128, 0.3)',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#3A8080',
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
              background: 'var(--bg-panel)',
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
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '8px' }}>
                    {currentLevel.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLevel(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '8px'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Concept Section */}
              <div style={{
                background: 'rgba(74, 122, 155, 0.1)',
                border: '1px solid rgba(74, 122, 155, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4A7A9B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={16} /> Concept
                </h4>
                <p style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.7' }}>
                  {currentLevel.concept}
                </p>
              </div>

              {/* Why It Matters */}
              <div style={{
                background: 'rgba(158, 120, 36, 0.1)',
                border: '1px solid rgba(158, 120, 36, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#9E7824', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} /> Why This Matters
                </h4>
                <p style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.7' }}>
                  {currentLevel.whyItMatters}
                </p>
              </div>

              {/* Analogy */}
              {currentLevel.analogy && (
                <div style={{
                  background: 'rgba(122, 90, 158, 0.1)',
                  border: '1px solid rgba(122, 90, 158, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#a78bfa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} /> Think of it like...
                  </h4>
                  <p style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.7', fontStyle: 'italic' }}>
                    "{currentLevel.analogy}"
                  </p>
                </div>
              )}

              {/* Code Example */}
              {currentLevel.codeExample && (
                <div style={{
                  background: 'rgba(235,232,228,0.8)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#C8A84E', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ScrollText size={16} /> Code Example ({currentLevel.codeExample.language})
                  </h4>
                  <pre style={{
                    background: 'rgba(200,195,188,0.3)',
                    borderRadius: '6px',
                    padding: '16px',
                    overflow: 'auto',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    color: 'var(--text-body)',
                    fontFamily: 'monospace'
                  }}>
                    <code>{currentLevel.codeExample.code}</code>
                  </pre>
                </div>
              )}

              {/* References */}
              <div style={{
                background: 'rgba(74, 122, 86, 0.1)',
                border: '1px solid rgba(74, 122, 86, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4A7A56', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                          color: '#4A7A56',
                          textDecoration: 'none',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#4A7A56'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#4A7A56'}
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
                  background: 'linear-gradient(135deg, rgba(58, 128, 128, 0.15) 0%, rgba(8, 145, 178, 0.1) 100%)',
                  border: '2px solid rgba(58, 128, 128, 0.4)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#3A8080',
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
                    ? 'linear-gradient(135deg, #4A7A56 0%, #4A7A56 100%)'
                    : 'linear-gradient(135deg, rgba(74, 122, 86, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                  border: `2px solid ${isLevelCompleted(currentLevel.id) ? '#4A7A56' : 'rgba(74, 122, 86, 0.5)'}`,
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
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
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(74, 122, 86, 0.3)';
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
    <div className="app-shell">

      {/* ── Sidebar Navigation ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-title">Big Data<br/>Architecture<br/>Explorer</div>
          <div className="sidebar-brand-sub">IS459 Reference</div>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-section-label">Architecture</span>
          {[
            { key: 'lambda',    label: 'Lambda',    color: '#E8654A' },
            { key: 'kappa',     label: 'Kappa',     color: '#4A5FE3' },
            { key: 'streaming', label: 'Streaming', color: '#2A9D99' },
            { key: 'batch',     label: 'Batch',     color: '#E8654A' },
            { key: 'mapreduce', label: 'MapReduce', color: '#C07FD4' },
            { key: 'spark',     label: 'Spark',     color: '#4A5FE3' },
          ].map(({ key, label, color }) => {
            const isActive = activeArchitecture === key && !showAdditionalInfo && !showHandsOn && !showCurriculum && !showCaseStudies && !showComparison;
            return (
              <button
                key={key}
                className={`sidebar-item${isActive ? ' active' : ''}`}
                onClick={() => { setActiveArchitecture(key); setSelectedComponent(null); setShowAdditionalInfo(false); setShowHandsOn(false); setShowCurriculum(false); setShowCaseStudies(false); setShowComparison(false); }}
              >
                <span className="sidebar-dot" style={{ background: isActive ? 'var(--blue)' : color }} />
                {label}
              </button>
            );
          })}
        </div>

        <hr className="sidebar-divider" />

        <div className="sidebar-section">
          <span className="sidebar-section-label">Schemas</span>
          {[
            { key: 'starSchema',      label: 'Star Schema',  color: '#E8654A' },
            { key: 'snowflakeSchema', label: 'Snowflake',    color: '#2A9D99' },
          ].map(({ key, label, color }) => {
            const isActive = activeArchitecture === key && !showAdditionalInfo && !showHandsOn && !showCurriculum && !showCaseStudies && !showComparison;
            return (
              <button
                key={key}
                className={`sidebar-item${isActive ? ' active' : ''}`}
                onClick={() => { setActiveArchitecture(key); setSelectedComponent(null); setShowAdditionalInfo(false); setShowHandsOn(false); setShowCurriculum(false); setShowCaseStudies(false); setShowComparison(false); }}
              >
                <span className="sidebar-dot" style={{ background: isActive ? 'var(--blue)' : color }} />
                {label}
              </button>
            );
          })}
        </div>

        <hr className="sidebar-divider" />

        <div className="sidebar-section">
          <span className="sidebar-section-label">Resources</span>
          {[
            { key: 'info',       label: 'Compare & Glossary', action: () => { setShowAdditionalInfo(!showAdditionalInfo); setShowHandsOn(false); setShowCurriculum(false); setShowCaseStudies(false); setShowComparison(false); }, active: showAdditionalInfo },
            { key: 'handson',    label: 'Hands-on Lab',       action: () => { setShowHandsOn(!showHandsOn); setShowAdditionalInfo(false); setShowCurriculum(false); setShowCaseStudies(false); setShowComparison(false); }, active: showHandsOn },
            { key: 'curriculum', label: 'Curriculum',         action: () => { setShowCurriculum(!showCurriculum); setShowAdditionalInfo(false); setShowHandsOn(false); setShowCaseStudies(false); setShowComparison(false); }, active: showCurriculum },
            { key: 'cases',      label: 'Case Studies',       action: () => { setShowCaseStudies(!showCaseStudies); setShowAdditionalInfo(false); setShowHandsOn(false); setShowCurriculum(false); setShowComparison(false); }, active: showCaseStudies },
            { key: 'comparison', label: 'Dist. vs Clustered', action: () => { setShowComparison(!showComparison); setShowAdditionalInfo(false); setShowHandsOn(false); setShowCurriculum(false); setShowCaseStudies(false); }, active: showComparison },
          ].map(({ key, label, action, active }) => (
            <button
              key={key}
              className={`sidebar-item${active ? ' active' : ''}`}
              onClick={action}
            >
              <span className="sidebar-dot" style={{ background: active ? 'var(--blue)' : 'var(--gray-300)' }} />
              {label}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">

        {/* Banner */}
        {showBanner && (
          <div style={{
            background: 'var(--warm-white)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <Info size={16} style={{ color: 'var(--gray-300)', flexShrink: 0 }} />
              <p style={{ color: 'var(--gray-500)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                <strong style={{ color: 'var(--near-black)', fontWeight: '600' }}>Work in Progress:</strong>{' '}
                Content is provided as-is for educational and reference purposes.
              </p>
            </div>
            <button onClick={handleDismissBanner} style={{ background: 'transparent', border: 'none', color: 'var(--gray-300)', cursor: 'pointer', padding: '2px', display: 'flex', borderRadius: '4px' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--near-black)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-300)'}
              aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        )}

          {!showAdditionalInfo && !showHandsOn && !showCurriculum && !showCaseStudies && !showComparison && (
          <>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-1px', color: 'var(--near-black)', lineHeight: 1 }}>
                {currentArch.name}
              </h1>
              <span className={`badge-pill diff-${currentArch.difficulty?.toLowerCase()}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                {currentArch.difficulty}
              </span>
            </div>
            <p style={{ color: 'var(--gray-500)', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{currentArch.tagline}</p>
            <p style={{ color: 'var(--gray-500)', fontSize: '13px', lineHeight: '1.55', maxWidth: '720px' }}>{currentArch.description}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '20px', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gray-300)', textTransform: 'uppercase', letterSpacing: '1.5px', flexShrink: 0 }}>
              Connection types
            </span>
            {Object.entries(connectionColors).map(([type, color]) => {
              const labels = { stream: 'Stream', batch: 'Batch', query: 'Query', fk: 'Foreign Key', normalize: 'Normalize' };
              return (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="28" height="10" style={{ overflow: 'visible' }}>
                    <line x1="0" y1="5" x2="22" y2="5" stroke={color} strokeWidth="1.5" strokeDasharray="4,3" />
                    <polygon points="22,5 16,2 16,8" fill={color} />
                  </svg>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{labels[type] || type}</span>
                </div>
              );
            })}
          </div>

          {showWarning && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(158, 120, 36, 0.2) 0%, rgba(217, 119, 6, 0.15) 100%)',
                border: '2px solid rgba(158, 120, 36, 0.6)',
                borderRadius: '12px',
                padding: '16px 24px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#C8A84E',
                fontSize: '14px',
                fontWeight: '600',
                
                boxShadow: '0 0 20px rgba(158, 120, 36, 0.3)'
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
            className="diagram-canvas"
            style={{
              padding: '32px',
              marginBottom: '24px',
              minHeight: '500px',
              overflow: 'hidden',
              position: 'relative',
              borderRadius: '12px',
              display: 'block',
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
               currentArch.layout === 'star' ? renderStarLayout() :
               currentArch.layout === 'snowflake' ? renderSnowflakeLayout() :
               currentArch.layout === 'mapreduce' ? renderMapReduceLayout() :
               currentArch.layout === 'spark' ? renderSparkLayout() :
               renderLinearLayout()}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              marginTop: '48px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(235,231,225,1)',
              justifyContent: 'center'
            }}>
              <Info size={16} />
              <span>Click on any component to view details</span>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(245,243,239,0.6)',
              
              border: '1px solid rgba(235,231,225,1)',
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
                color: '#4A7A9B'
              }}>
                Overview
              </h3>
              <p style={{ color: 'var(--text-body)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
                {currentArch.overview.text}
              </p>

              <div style={{
                background: 'rgba(74, 122, 155, 0.1)',
                border: '1px solid rgba(74, 122, 155, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Sparkles size={20} color="#4A7A9B" />
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#4A7A9B' }}>
                    Example Scenario: {currentArch.overview.scenario}
                  </h4>
                </div>
                <p style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.7', marginBottom: '8px' }}>
                  {currentArch.overview.scenarioDescription}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontStyle: 'italic' }}>
                  Note: This is a fictional example based on patterns observed in the market to illustrate real-world applications.
                </p>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-body)', marginBottom: '12px' }}>
                Components in This Scenario
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {currentArch.overview.components.map((comp, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(235,232,228,0.6)',
                      border: '1px solid rgba(74, 122, 155, 0.3)',
                      borderRadius: '8px',
                      padding: '12px 16px'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-body)', marginBottom: '4px' }}>
                      {comp.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
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
                    <span style={{ color: 'var(--text-body)', fontSize: '15px' }}>{useCase}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#4A7A56'
              }}>
                Advantages
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentArch.advantages.map((advantage, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Check size={18} color="#4A7A56" />
                    <span style={{ color: 'var(--text-body)', fontSize: '15px' }}>{advantage}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#C8A84E'
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
                      background: '#C8A84E',
                      flexShrink: 0
                    }} />
                    <span style={{ color: 'var(--text-body)', fontSize: '15px' }}>{challenge}</span>
                  </div>
                ))}
              </div>
            </div>

            {currentArch.gotchas && currentArch.gotchas.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#ef4444'
              }}>
                Gotchas & Common Mistakes
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px', fontStyle: 'italic' }}>
                Pitfalls that trip up beginners and experienced engineers alike
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentArch.gotchas.map((gotcha, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    padding: '12px 16px'
                  }}>
                    <div style={{
                      marginTop: '2px',
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#ef4444'
                    }}>
                      !
                    </div>
                    <span style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.6' }}>{gotcha}</span>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Design Examples: Good & Bad patterns with visual table examples */}
            {currentArch.designExamples && (
            <div style={{ marginBottom: '32px' }}>
              {/* Good Examples */}
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Check size={24} color="#22c55e" />
                Good Design Patterns
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px', fontStyle: 'italic' }}>
                Follow these patterns for a well-designed schema
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {currentArch.designExamples.good.map((example, idx) => (
                  <div key={`good-${idx}`} style={{
                    background: 'rgba(34, 197, 94, 0.06)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    borderRadius: '12px',
                    padding: '20px',
                    borderLeft: '4px solid #22c55e'
                  }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#4ade80', marginBottom: '8px' }}>
                      {example.title}
                    </div>
                    <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>
                      {example.description}
                    </p>
                    {/* Visual table representation */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {example.columns.map((tbl, tIdx) => (
                        <div key={tIdx} style={{
                          background: 'rgba(245,243,239,0.8)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '8px',
                          minWidth: '200px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            background: 'rgba(34, 197, 94, 0.15)',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#4ade80',
                            fontFamily: 'monospace',
                            borderBottom: '1px solid rgba(34, 197, 94, 0.2)'
                          }}>
                            {tbl.table}
                          </div>
                          {tbl.cols.map((col, cIdx) => (
                            <div key={cIdx} style={{
                              padding: '4px 12px',
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              color: col.includes('PK') ? '#9E7824' : col.includes('FK') ? '#4A7A9B' : 'var(--text-body)',
                              fontWeight: col.includes('PK') || col.includes('FK') ? '600' : '400',
                              borderBottom: cIdx < tbl.cols.length - 1 ? '1px solid rgba(71, 85, 105, 0.15)' : 'none'
                            }}>
                              {col}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.08)',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      fontSize: '12px',
                      color: '#86efac',
                      lineHeight: '1.5'
                    }}>
                      <strong>Why this works:</strong> {example.why}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bad Examples */}
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <X size={24} color="#ef4444" />
                Anti-Patterns to Avoid
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px', fontStyle: 'italic' }}>
                Common mistakes that lead to performance issues, data quality problems, or maintenance headaches
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {currentArch.designExamples.bad.map((example, idx) => (
                  <div key={`bad-${idx}`} style={{
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '12px',
                    padding: '20px',
                    borderLeft: '4px solid #ef4444'
                  }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#f87171', marginBottom: '8px' }}>
                      {example.title}
                    </div>
                    <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>
                      {example.description}
                    </p>
                    {/* Visual table representation */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {example.columns.map((tbl, tIdx) => (
                        <div key={tIdx} style={{
                          background: 'rgba(245,243,239,0.8)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          minWidth: '200px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#f87171',
                            fontFamily: 'monospace',
                            borderBottom: '1px solid rgba(239, 68, 68, 0.2)'
                          }}>
                            {tbl.table}
                          </div>
                          {tbl.cols.map((col, cIdx) => (
                            <div key={cIdx} style={{
                              padding: '4px 12px',
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              color: col.includes('PK') ? '#9E7824' : col.includes('FK') ? '#4A7A9B' : col.includes('BAD') || col.includes('NO MATCHING') || col.includes('UNNECESSARY') ? '#e11d48' : 'var(--text-body)',
                              fontWeight: col.includes('PK') || col.includes('FK') ? '600' : '400',
                              borderBottom: cIdx < tbl.cols.length - 1 ? '1px solid rgba(71, 85, 105, 0.15)' : 'none',
                              textDecoration: col.includes('BAD') || col.includes('NO MATCHING') ? 'line-through' : 'none',
                              textDecorationColor: '#ef4444'
                            }}>
                              {col}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      fontSize: '12px',
                      color: '#fca5a5',
                      lineHeight: '1.5',
                      marginBottom: example.fix ? '8px' : '0'
                    }}>
                      <strong>Why this is wrong:</strong> {example.why}
                    </div>
                    {example.fix && (
                      <div style={{
                        background: 'rgba(74, 122, 155, 0.08)',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        fontSize: '12px',
                        color: '#8AAACE',
                        lineHeight: '1.5'
                      }}>
                        <strong>How to fix:</strong> {example.fix}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            )}

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
                        color: 'var(--text-body)',
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
                        e.currentTarget.style.color = 'var(--text-body)';
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
                  background: 'rgba(245,243,239,0.8)',
                  
                  border: '1px solid rgba(235,231,225,1)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  overflowX: 'auto'
                }}
              >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#4A7A9B' }}>
              Architecture Comparison
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '2px solid rgba(71, 85, 105, 0.5)', fontWeight: '600' }}>Feature</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#9E5A3C', borderBottom: '2px solid rgba(71, 85, 105, 0.5)', fontWeight: '600' }}>Lambda</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#7A5A9E', borderBottom: '2px solid rgba(71, 85, 105, 0.5)', fontWeight: '600' }}>Kappa</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#9E7824', borderBottom: '2px solid rgba(71, 85, 105, 0.5)', fontWeight: '600' }}>Streaming</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#4A7A56', borderBottom: '2px solid rgba(71, 85, 105, 0.5)', fontWeight: '600' }}>Batch</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Difficulty</td>
                  <td style={{ padding: '10px 12px', color: '#ef4444', borderBottom: '1px solid rgba(235,231,225,1)', fontWeight: '600' }}>Advanced</td>
                  <td style={{ padding: '10px 12px', color: '#4A7A9B', borderBottom: '1px solid rgba(235,231,225,1)', fontWeight: '600' }}>Intermediate</td>
                  <td style={{ padding: '10px 12px', color: '#4A7A9B', borderBottom: '1px solid rgba(235,231,225,1)', fontWeight: '600' }}>Intermediate</td>
                  <td style={{ padding: '10px 12px', color: '#22c55e', borderBottom: '1px solid rgba(235,231,225,1)', fontWeight: '600' }}>Beginner</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Complexity</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>High</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Medium</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Low</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Low</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Real-time Support</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Yes</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Yes</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Yes</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>No</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Data Consistency</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>High</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Medium</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Medium</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>High</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Latency</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Low (speed layer)</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Low</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Very Low</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>High (hours/days)</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Processing Layers</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Batch + Speed + Serving</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Stream only</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Stream only</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Batch only</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Data Reprocessing</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Easy (batch layer)</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Possible (replay log)</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Limited</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Easy (re-run ETL)</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Operational Overhead</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>High</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Medium</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Low</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)', borderBottom: '1px solid rgba(235,231,225,1)' }}>Low</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>Best For</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)' }}>Mission-critical systems needing both accuracy and speed</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)' }}>Event-driven systems with replay requirements</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)' }}>Real-time applications with minimal latency needs</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-body)' }}>Reporting, analytics, and historical insights</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              background: 'rgba(245,243,239,0.6)',
              
              border: '1px solid rgba(235,231,225,1)',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '24px'
            }}
          >
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#C8A84E'
            }}>
              Technical Glossary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(235,231,225,1)' }}>
                <h4 style={{ color: '#4A7A9B', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>OLAP</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6' }}>Online Analytical Processing - Database optimized for complex queries and analytics on large datasets.</p>
              </div>
              <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(235,231,225,1)' }}>
                <h4 style={{ color: '#4A7A9B', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>OLTP</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6' }}>Online Transaction Processing - Database optimized for high-volume transactions and data modifications.</p>
              </div>
              <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(235,231,225,1)' }}>
                <h4 style={{ color: '#4A7A9B', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>ETL</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6' }}>Extract, Transform, Load - Process of extracting data from sources, transforming it, and loading into a data warehouse.</p>
              </div>
              <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(235,231,225,1)' }}>
                <h4 style={{ color: '#4A7A9B', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Stateful Processing</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6' }}>Stream processing that maintains state across events, enabling windowing, aggregations, and joins.</p>
              </div>
              <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(235,231,225,1)' }}>
                <h4 style={{ color: '#4A7A9B', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>MapReduce</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6' }}>Programming model for processing large datasets in parallel across distributed clusters.</p>
              </div>
              <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(235,231,225,1)' }}>
                <h4 style={{ color: '#4A7A9B', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Event Log</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6' }}>Immutable, append-only sequence of events that can be replayed for reprocessing.</p>
              </div>
              <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(235,231,225,1)' }}>
                <h4 style={{ color: '#4A7A9B', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Materialized View</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6' }}>Pre-computed query results stored for fast retrieval, continuously updated from source data.</p>
              </div>
              <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(235,231,225,1)' }}>
                <h4 style={{ color: '#4A7A9B', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Partitioning</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6' }}>Dividing data across multiple nodes for parallel processing and scalability.</p>
              </div>
              <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(235,231,225,1)' }}>
                <h4 style={{ color: '#4A7A9B', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Backpressure</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6' }}>Flow control mechanism to prevent overwhelming downstream systems when data arrives faster than it can be processed.</p>
              </div>
              <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(235,231,225,1)' }}>
                <h4 style={{ color: '#4A7A9B', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Data Lake</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6' }}>Centralized repository for storing raw, unstructured data at scale in its native format.</p>
              </div>
              <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(235,231,225,1)' }}>
                <h4 style={{ color: '#4A7A9B', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Windowing</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6' }}>Grouping stream events into finite time or count-based windows for aggregation.</p>
              </div>
              <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(235,231,225,1)' }}>
                <h4 style={{ color: '#4A7A9B', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Columnar Storage</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: '1.6' }}>Data storage format organizing by columns rather than rows, optimized for analytics.</p>
              </div>
            </div>
          </div>

          {/* Decision Flowchart */}
          <div
            style={{
              background: 'rgba(245,243,239,0.6)',
              
              border: '1px solid rgba(235,231,225,1)',
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
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              Click on nodes to expand the decision tree and find the best architecture for your requirements
            </p>

            <div style={{
              background: 'rgba(235,232,228,0.6)',
              border: '1px solid rgba(235,231,225,1)',
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
                  background: 'rgba(245,243,239,0.8)',
                  
                  border: '1px solid rgba(235,231,225,1)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px'
                }}
              >
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#4A7A56' }}>
                  Hands-on Lab: Blockchain Data Ingestion Pipeline
                </h3>

                <div style={{ marginBottom: '24px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '12px' }}>
                    Build a real-time blockchain data pipeline that demonstrates big data architecture patterns through practical implementation.
                  </p>
                </div>

                <div style={{
                  background: 'rgba(122, 90, 158, 0.1)',
                  border: '1px solid rgba(122, 90, 158, 0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#a78bfa' }}>
                    Understanding Blockchain Data Pipelines
                  </h4>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: 'var(--text-body)', fontSize: '15px', marginBottom: '12px', lineHeight: '1.6' }}>
                      {architectures.blockchain.overview.text}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.6' }}>
                      {architectures.blockchain.overview.scenarioDescription}
                    </p>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#c4b5fd' }}>
                      Use Cases in Production
                    </h5>
                    <ul style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
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
                      <ul style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
                        {architectures.blockchain.advantages.map((advantage, index) => (
                          <li key={index} style={{ marginBottom: '4px' }}>{advantage}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#c4b5fd' }}>
                        Challenges
                      </h5>
                      <ul style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
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
                      background: 'linear-gradient(135deg, rgba(158, 120, 36, 0.2) 0%, rgba(217, 119, 6, 0.15) 100%)',
                      border: '2px solid rgba(158, 120, 36, 0.6)',
                      borderRadius: '12px',
                      padding: '16px 24px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#C8A84E',
                      fontSize: '14px',
                      fontWeight: '600',
                      
                      boxShadow: '0 0 20px rgba(158, 120, 36, 0.3)'
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
                    background: 'rgba(245,243,239,0.8)',
                    
                    border: '1px solid rgba(235,231,225,1)',
                    borderRadius: '12px',
                    marginBottom: '32px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', paddingTop: '24px', color: '#4A7A56', textAlign: 'center' }}>
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

                <div style={{ background: 'rgba(74, 122, 86, 0.1)', border: '1px solid rgba(74, 122, 86, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#4A7A56' }}>
                    What You'll Learn
                  </h4>
                  <ul style={{ color: 'var(--text-body)', fontSize: '14px', marginLeft: '20px', lineHeight: '1.8' }}>
                    <li>Design and implement real-time data ingestion pipelines</li>
                    <li>Work with multi-blockchain architectures (Bitcoin & Solana)</li>
                    <li>Use ClickHouse columnar database for analytical queries</li>
                    <li>Build asynchronous APIs with FastAPI</li>
                    <li>Orchestrate microservices using Docker Compose</li>
                    <li>Build real-time dashboards with Next.js 16 and Turbopack</li>
                    <li>Understand the 5Vs of Big Data through practical examples</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(74, 122, 155, 0.1)', border: '1px solid rgba(74, 122, 155, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#4A7A9B' }}>
                    The 5Vs of Big Data in This Lab
                  </h4>
                  <div style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#4A7A9B' }}>Volume:</strong> Solana generates 20,000+ transactions per block, demonstrating massive data scale</p>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#4A7A9B' }}>Velocity:</strong> Real-time collection with Solana's ~400ms block times vs Bitcoin's ~10 minutes</p>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#4A7A9B' }}>Variety:</strong> Handle heterogeneous blockchain architectures (UTXO vs account-based models)</p>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#4A7A9B' }}>Veracity:</strong> Data validation through blockchain consensus mechanisms</p>
                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#4A7A9B' }}>Value:</strong> Extract insights on network congestion and adoption patterns</p>
                  </div>
                </div>

                <div style={{ background: 'rgba(122, 90, 158, 0.1)', border: '1px solid rgba(122, 90, 158, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#a78bfa' }}>
                    Prerequisites
                  </h4>
                  <div style={{ color: 'var(--text-body)', fontSize: '14px' }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-body)' }}>Required:</p>
                    <ul style={{ marginLeft: '20px', marginBottom: '12px', lineHeight: '1.8' }}>
                      <li>Docker Desktop 20.10+</li>
                      <li>10GB free disk space minimum</li>
                      <li>Internet connectivity</li>
                      <li>Basic command-line knowledge</li>
                    </ul>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-body)' }}>Recommended:</p>
                    <ul style={{ marginLeft: '20px', marginBottom: '12px', lineHeight: '1.8' }}>
                      <li>SQL knowledge (SELECT, WHERE, GROUP BY)</li>
                      <li>Basic REST API familiarity</li>
                      <li>8GB RAM minimum (16GB recommended)</li>
                    </ul>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-body)' }}>Time Estimate:</p>
                    <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                      <li>Exercises 1-6: 1.5-2 hours</li>
                      <li>Exercises 7-9: 1-1.5 hours</li>
                      <li>Extensions: 2-3 hours</li>
                    </ul>
                  </div>
                </div>

                <div style={{ background: 'rgba(158, 120, 36, 0.1)', border: '1px solid rgba(158, 120, 36, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#9E7824' }}>
                    Quick Start Guide
                  </h4>
                  <div style={{ color: 'var(--text-body)', fontSize: '14px' }}>
                    <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                      <li style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#9E7824' }}>Clone the repository:</strong>
                        <pre style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '4px', marginTop: '4px', overflow: 'auto' }}>
                          <code>git clone https://github.com/maruthiprithivi/big_data_architecture.git{'\n'}cd big_data_architecture</code>
                        </pre>
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#9E7824' }}>Configure environment (optional):</strong>
                        <pre style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '4px', marginTop: '4px', overflow: 'auto' }}>
                          <code>cp .env.example .env</code>
                        </pre>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Note: Default settings work for first-time users</span>
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#9E7824' }}>Start services:</strong>
                        <pre style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '4px', marginTop: '4px', overflow: 'auto' }}>
                          <code>./scripts/start.sh</code>
                        </pre>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Initial setup: 15-20 minutes (Docker downloads), subsequent starts: 30-60 seconds</span>
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#9E7824' }}>Access dashboard:</strong> Open{' '}
                        <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer" style={{ color: '#4A7A56', textDecoration: 'underline' }}>
                          http://localhost:3001
                        </a> in your browser
                      </li>
                      <li>
                        <strong style={{ color: '#9E7824' }}>Shutdown:</strong>
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
                  <div style={{ color: 'var(--text-body)', fontSize: '14px' }}>
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
                  <div style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.8' }}>
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
                  <div style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#6366f1' }}>GitHub Repository:</strong>{' '}
                      <a
                        href="https://github.com/maruthiprithivi/big_data_architecture"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#4A7A56', textDecoration: 'underline' }}
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
                        style={{ color: '#4A7A56', textDecoration: 'underline' }}
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
                        style={{ color: '#4A7A56', textDecoration: 'underline' }}
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
                        style={{ color: '#4A7A56', textDecoration: 'underline' }}
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
                        style={{ color: '#4A7A56', textDecoration: 'underline' }}
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
                  background: 'rgba(245,243,239,0.8)',
                  
                  border: '1px solid rgba(235,231,225,1)',
                  borderRadius: '12px',
                  padding: '32px',
                  marginBottom: '24px'
                }}
              >
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px', color: '#9E5A3C' }}>
                    Real-World Big Data Case Studies
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.7', maxWidth: '900px' }}>
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
                        background: 'rgba(235,232,228,0.6)',
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
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '2px' }}>
                              {study.company}
                            </h3>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{study.industry}</span>
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
                      <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-body)', marginBottom: '4px' }}>
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
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{metric.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Challenge */}
                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#C8A84E', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>🎯</span> Challenge
                        </h5>
                        <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                          {study.challenge}
                        </p>
                      </div>

                      {/* Solution */}
                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#4A7A56', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>💡</span> Solution
                        </h5>
                        <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                          {study.solution}
                        </p>
                      </div>

                      {/* Implementation Details */}
                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#4A7A9B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>🔧</span> Implementation
                        </h5>
                        <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '16px', margin: 0 }}>
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
                        <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '16px', margin: 0 }}>
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
                              background: 'rgba(74, 122, 155, 0.15)',
                              color: '#4A7A9B',
                              border: '1px solid rgba(74, 122, 155, 0.3)',
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
                                  e.currentTarget.style.background = 'rgba(74, 122, 155, 0.3)';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'var(--bg-hover)';
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
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                                color: '#4A7A9B',
                                textDecoration: 'none',
                                transition: 'color 0.2s',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#8AAACE'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#4A7A9B'}
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
                  background: 'linear-gradient(135deg, rgba(158, 90, 60, 0.1) 0%, rgba(122, 90, 158, 0.1) 100%)',
                  border: '1px solid rgba(158, 90, 60, 0.3)',
                  borderRadius: '16px'
                }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#9E5A3C' }}>
                    Common Patterns Across Case Studies
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(235,231,225,1)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#9E7824', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🔄</span> Event-Driven Architecture
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                        Nearly all case studies leverage Apache Kafka as a central event backbone. Event-driven patterns enable loose coupling,
                        real-time processing, and replay capabilities for reprocessing historical data.
                      </p>
                    </div>

                    <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(235,231,225,1)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#4A7A56', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚡</span> Hybrid Batch + Stream
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                        Most companies combine batch processing (Spark) for ML training and historical analysis with stream processing (Flink/Kafka Streams)
                        for real-time features, following Lambda or Kappa architecture patterns.
                      </p>
                    </div>

                    <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(235,231,225,1)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#4A7A9B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🗄️</span> Separation of Storage & Compute
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                        Cloud data lakes (S3, GCS, ADLS) separate storage from compute, enabling independent scaling, cost optimization,
                        and flexibility in choosing processing engines for different workloads.
                      </p>
                    </div>

                    <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(235,231,225,1)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#a78bfa', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🤖</span> ML-Integrated Pipelines
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                        Data pipelines are designed with ML in mind: feature stores bridge batch training and real-time inference,
                        while experimentation platforms enable rapid iteration on models and algorithms.
                      </p>
                    </div>

                    <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(235,231,225,1)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#9E5A3C', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📊</span> Real-Time OLAP
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                        Apache Druid, Pinot, and ClickHouse appear frequently for real-time analytics, providing sub-second query latency
                        on streaming data for dashboards and user-facing features.
                      </p>
                    </div>

                    <div style={{ background: 'rgba(235,232,228,0.6)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(235,231,225,1)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#C8A84E', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🔒</span> Data Governance at Scale
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                        As data volumes grow, governance becomes critical. Companies invest in data catalogs, schema registries,
                        data contracts, and access controls to maintain data quality and compliance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MapReduce vs Spark Comparison Section */}
          {showComparison && (
            <div
              id="comparison-section"
              style={{ animation: 'fadeInScale 0.3s ease-out forwards' }}
            >
              <div style={{
                background: 'rgba(245,243,239,0.8)',
                
                border: '1px solid rgba(235,231,225,1)',
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '24px'
              }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
                    <span style={{ color: '#9E5A3C' }}>MapReduce</span>
                    <span style={{ color: 'var(--text-muted)', margin: '0 16px' }}>vs</span>
                    <span style={{ color: '#9E7824' }}>Apache Spark</span>
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    The Distributed Workhorse vs The Clustered Speedster — understanding the nuance
                  </p>
                </div>

                {/* Distributed vs Clustered: The Nuance */}
                <div style={{
                  background: 'rgba(245,243,239,0.6)',
                  border: '1px solid rgba(235,231,225,1)',
                  borderRadius: '16px', padding: '28px', marginBottom: '28px'
                }}>
                  <h3 style={{ color: 'var(--text-body)', fontSize: '17px', fontWeight: '700', marginBottom: '20px', textAlign: 'center' }}>
                    Distributed vs. Clustered Computing: The Nuance
                  </h3>

                  {/* Umbrella concept */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '24px'
                  }}>
                    {/* Distributed = the umbrella */}
                    <div style={{
                      background: 'rgba(122, 90, 158, 0.1)',
                      border: '2px solid rgba(122, 90, 158, 0.4)',
                      borderRadius: '16px', padding: '20px', width: '100%', position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(122, 90, 158, 0.3)', border: '1px solid #7A5A9E',
                        borderRadius: '20px', padding: '4px 16px',
                        fontSize: '11px', fontWeight: '700', color: '#c4b5fd',
                        textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap'
                      }}>
                        Distributed Computing — The Broad Umbrella
                      </div>
                      <p style={{ color: '#c4b5fd', fontSize: '13px', textAlign: 'center', lineHeight: '1.7', marginTop: '8px' }}>
                        Any system where components on <strong>networked computers</strong> communicate and coordinate by <strong>passing messages</strong>.
                      </p>

                      {/* Clustered = a subset inside */}
                      <div style={{
                        background: 'rgba(58, 128, 128, 0.1)',
                        border: '2px solid rgba(58, 128, 128, 0.4)',
                        borderRadius: '12px', padding: '16px', marginTop: '16px', position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                          background: 'rgba(58, 128, 128, 0.3)', border: '1px solid #3A8080',
                          borderRadius: '20px', padding: '3px 14px',
                          fontSize: '10px', fontWeight: '700', color: '#67e8f9',
                          textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap'
                        }}>
                          Clustered Computing — A Specific Type
                        </div>
                        <p style={{ color: '#67e8f9', fontSize: '13px', textAlign: 'center', lineHeight: '1.7', marginTop: '4px' }}>
                          A set of connected nodes working <strong>so closely together</strong> that they can be viewed as a <strong>single system</strong>.
                        </p>

                        {/* Both MR and Spark live here */}
                        <div style={{
                          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px'
                        }}>
                          {/* MapReduce */}
                          <div style={{
                            background: 'rgba(158, 90, 60, 0.1)',
                            border: '1px solid rgba(158, 90, 60, 0.3)',
                            borderRadius: '10px', padding: '14px', textAlign: 'center'
                          }}>
                            <div style={{ color: '#9E5A3C', fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>
                              MapReduce
                            </div>
                            <div style={{
                              background: 'rgba(158, 90, 60, 0.15)', borderRadius: '6px',
                              padding: '4px 10px', display: 'inline-block', marginBottom: '8px',
                              fontSize: '10px', fontWeight: '700', color: '#f9a8d4',
                              textTransform: 'uppercase', letterSpacing: '1px'
                            }}>
                              Disk-Centric
                            </div>
                            <p style={{ color: 'var(--text-body)', fontSize: '11px', lineHeight: '1.6' }}>
                              Runs on a Hadoop cluster, but <em>feels</em> more "distributed" — it breaks jobs into tiny pieces, sends them out, <strong>writes results to disk</strong>, and repeats. A literal distribution of a massive batch job across a vast sea of commodity hardware.
                            </p>
                          </div>

                          {/* Spark */}
                          <div style={{
                            background: 'rgba(158, 120, 36, 0.1)',
                            border: '1px solid rgba(158, 120, 36, 0.3)',
                            borderRadius: '10px', padding: '14px', textAlign: 'center'
                          }}>
                            <div style={{ color: '#9E7824', fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>
                              Apache Spark
                            </div>
                            <div style={{
                              background: 'rgba(158, 120, 36, 0.15)', borderRadius: '6px',
                              padding: '4px 10px', display: 'inline-block', marginBottom: '8px',
                              fontSize: '10px', fontWeight: '700', color: '#fde68a',
                              textTransform: 'uppercase', letterSpacing: '1px'
                            }}>
                              Memory-Centric
                            </div>
                            <p style={{ color: 'var(--text-body)', fontSize: '11px', lineHeight: '1.6' }}>
                              The poster child for "clustered" computing — it treats the cluster like a <strong>single, massive pool of RAM</strong> using RDDs. Data stays in-memory, making it feel like one cohesive <strong>"Supercomputer"</strong> rather than a collection of independent workers.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* The Analogy: Filing Cabinet vs Pool of RAM */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center'
                  }}>
                    {/* Filing Cabinet */}
                    <div style={{
                      background: 'rgba(158, 90, 60, 0.06)',
                      border: '1px dashed rgba(158, 90, 60, 0.3)',
                      borderRadius: '12px', padding: '20px', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗄️</div>
                      <div style={{ color: '#9E5A3C', fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>
                        "Giant Filing Cabinet"
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.6' }}>
                        MapReduce treats the cluster like a filing cabinet — <strong>read a file, process it, put it back, pick up the next</strong>. Every step involves opening a drawer (disk I/O).
                      </p>
                      <div style={{
                        marginTop: '10px', fontFamily: 'Monaco, Consolas, monospace', fontSize: '10px',
                        color: '#f9a8d4', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px',
                        lineHeight: '1.6'
                      }}>
                        Read → Process → Write to disk<br/>
                        Read from disk → Shuffle → Write to disk<br/>
                        Read from disk → Reduce → Write to HDFS
                      </div>
                    </div>

                    {/* VS divider */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                    }}>
                      <div style={{ width: '2px', height: '30px', background: 'rgba(235,231,225,1)' }} />
                      <div style={{
                        padding: '8px 14px', borderRadius: '10px',
                        background: 'rgba(235,232,228,0.8)', border: '1px solid rgba(235,231,225,1)',
                        color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700'
                      }}>VS</div>
                      <div style={{ width: '2px', height: '30px', background: 'rgba(235,231,225,1)' }} />
                    </div>

                    {/* Pool of RAM */}
                    <div style={{
                      background: 'rgba(158, 120, 36, 0.06)',
                      border: '1px dashed rgba(158, 120, 36, 0.3)',
                      borderRadius: '12px', padding: '20px', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧠</div>
                      <div style={{ color: '#9E7824', fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>
                        "Massive Pool of RAM"
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.6' }}>
                        Spark treats the cluster like one giant brain — data stays <strong>in-memory across all nodes</strong>. No filing cabinet drawers to open. The RDD keeps data alive and accessible.
                      </p>
                      <div style={{
                        marginTop: '10px', fontFamily: 'Monaco, Consolas, monospace', fontSize: '10px',
                        color: '#fde68a', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px',
                        lineHeight: '1.6'
                      }}>
                        Read → Transform (in memory)<br/>
                        → Transform (still in memory)<br/>
                        → Shuffle → Transform (back in memory)<br/>
                        → Output
                      </div>
                    </div>
                  </div>

                  {/* Key takeaway */}
                  <div style={{
                    marginTop: '20px', padding: '12px 20px', textAlign: 'center',
                    background: 'rgba(122, 90, 158, 0.08)',
                    border: '1px solid rgba(122, 90, 158, 0.25)',
                    borderRadius: '10px'
                  }}>
                    <div style={{ color: '#c4b5fd', fontSize: '12px', lineHeight: '1.7' }}>
                      <strong>Both run on clusters.</strong> The difference is <em>how</em> they use the cluster. MapReduce treats each node as an independent worker with a shared filing system (HDFS). Spark treats all nodes as parts of one unified computational engine, sharing memory through RDDs.
                    </div>
                  </div>
                </div>

                {/* Interactive highlight buttons */}
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px', flexWrap: 'wrap'
                }}>
                  {[
                    { key: null, label: 'Overview', icon: '📊' },
                    { key: 'speed', label: 'Speed', icon: '⚡' },
                    { key: 'fault', label: 'Fault Tolerance', icon: '🛡️' },
                    { key: 'data', label: 'Data Flow', icon: '🔄' },
                    { key: 'model', label: 'Programming', icon: '💻' }
                  ].map(h => (
                    <button
                      key={h.key || 'overview'}
                      onClick={() => setComparisonHighlight(h.key)}
                      style={{
                        padding: '8px 16px',
                        background: comparisonHighlight === h.key ? 'rgba(58, 128, 128, 0.2)' : 'rgba(235,232,228,0.5)',
                        border: `1px solid ${comparisonHighlight === h.key ? '#3A8080' : 'rgba(235,231,225,1)'}`,
                        borderRadius: '8px',
                        color: comparisonHighlight === h.key ? '#3A8080' : 'var(--text-secondary)',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <span>{h.icon}</span> {h.label}
                    </button>
                  ))}
                </div>

                {/* Side-by-Side Comparison Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>

                  {/* MapReduce Side */}
                  <div style={{
                    background: 'rgba(158, 90, 60, 0.08)',
                    border: '1px solid rgba(158, 90, 60, 0.3)',
                    borderRadius: '16px', padding: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'rgba(158, 90, 60, 0.2)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Cpu size={22} color="#9E5A3C" />
                      </div>
                      <div>
                        <div style={{ color: '#9E5A3C', fontSize: '18px', fontWeight: '700' }}>MapReduce</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>The Distributed Workhorse — Disk-Centric</div>
                      </div>
                    </div>

                    {/* Visual Flow: Disk-heavy pipeline */}
                    <div style={{
                      background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '16px'
                    }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                        Execution Flow
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[
                          { label: 'HDFS Read', color: '#4A7A9B', icon: '💾' },
                          { label: 'Map', color: '#9E5A3C', icon: '🔀' },
                          { label: 'Disk Write', color: '#ef4444', icon: '💾' },
                          { label: 'Shuffle', color: '#9E7824', icon: '🌐' },
                          { label: 'Disk Read', color: '#ef4444', icon: '💾' },
                          { label: 'Reduce', color: '#4A7A56', icon: '📊' },
                          { label: 'HDFS Write', color: '#4A7A9B', icon: '💾' }
                        ].map((s, i) => (
                          <React.Fragment key={i}>
                            <div style={{
                              padding: '4px 8px', borderRadius: '6px',
                              background: `${s.color}22`, border: `1px solid ${s.color}44`,
                              fontSize: '10px', color: s.color, fontWeight: '600',
                              textAlign: 'center', whiteSpace: 'nowrap',
                              opacity: comparisonHighlight === 'data' || !comparisonHighlight ? 1 : 0.3,
                              transition: 'opacity 0.3s'
                            }}>
                              {s.icon} {s.label}
                            </div>
                            {i < 6 && <ChevronRight size={12} color="#475569" />}
                          </React.Fragment>
                        ))}
                      </div>
                      <div style={{
                        marginTop: '10px', textAlign: 'center', fontSize: '10px', color: '#ef4444',
                        opacity: comparisonHighlight === 'speed' || !comparisonHighlight ? 1 : 0.3,
                        transition: 'opacity 0.3s'
                      }}>
                        ⚠ Opens the filing cabinet at every stage — 3 disk round-trips per job
                      </div>
                    </div>

                    {/* Properties */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { label: 'Processing Model', value: 'Batch only (Map → Reduce)', highlight: 'model', color: '#9E5A3C' },
                        { label: 'Speed', value: '~45 seconds (word count on 384MB)', highlight: 'speed', color: '#ef4444' },
                        { label: 'Data Storage', value: 'Disk between every stage', highlight: 'data', color: '#ef4444' },
                        { label: 'Fault Recovery', value: 'Re-run failed task from HDFS', highlight: 'fault', color: '#4A7A56' },
                        { label: 'Multi-Pass', value: 'Requires chaining multiple jobs', highlight: 'model', color: '#9E7824' },
                        { label: 'Latency', value: 'High (JVM start + disk I/O)', highlight: 'speed', color: '#ef4444' }
                      ].map((prop, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 12px', borderRadius: '8px',
                          background: comparisonHighlight === prop.highlight ? 'rgba(58, 128, 128, 0.1)' : 'transparent',
                          border: comparisonHighlight === prop.highlight ? '1px solid rgba(58, 128, 128, 0.3)' : '1px solid transparent',
                          transition: 'all 0.3s',
                          opacity: !comparisonHighlight || comparisonHighlight === prop.highlight ? 1 : 0.4
                        }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{prop.label}</span>
                          <span style={{ fontSize: '12px', color: prop.color, fontWeight: '600', textAlign: 'right' }}>{prop.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spark Side */}
                  <div style={{
                    background: 'rgba(158, 120, 36, 0.08)',
                    border: '1px solid rgba(158, 120, 36, 0.3)',
                    borderRadius: '16px', padding: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'rgba(158, 120, 36, 0.2)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Zap size={22} color="#9E7824" />
                      </div>
                      <div>
                        <div style={{ color: '#9E7824', fontSize: '18px', fontWeight: '700' }}>Apache Spark</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>The Clustered Speedster — Memory-Centric</div>
                      </div>
                    </div>

                    {/* Visual Flow: In-memory pipeline */}
                    <div style={{
                      background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '16px'
                    }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                        Execution Flow
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[
                          { label: 'Source Read', color: '#4A7A9B', icon: '📂' },
                          { label: 'Transform', color: '#9E5A3C', icon: '⚡' },
                          { label: 'In Memory', color: '#4A7A56', icon: '🧠' },
                          { label: 'Shuffle', color: '#9E7824', icon: '🌐' },
                          { label: 'In Memory', color: '#4A7A56', icon: '🧠' },
                          { label: 'Action', color: '#7A5A9E', icon: '🎯' },
                          { label: 'Output', color: '#4A7A9B', icon: '💾' }
                        ].map((s, i) => (
                          <React.Fragment key={i}>
                            <div style={{
                              padding: '4px 8px', borderRadius: '6px',
                              background: `${s.color}22`, border: `1px solid ${s.color}44`,
                              fontSize: '10px', color: s.color, fontWeight: '600',
                              textAlign: 'center', whiteSpace: 'nowrap',
                              opacity: comparisonHighlight === 'data' || !comparisonHighlight ? 1 : 0.3,
                              transition: 'opacity 0.3s'
                            }}>
                              {s.icon} {s.label}
                            </div>
                            {i < 6 && <ChevronRight size={12} color="#475569" />}
                          </React.Fragment>
                        ))}
                      </div>
                      <div style={{
                        marginTop: '10px', textAlign: 'center', fontSize: '10px', color: '#4A7A56',
                        opacity: comparisonHighlight === 'speed' || !comparisonHighlight ? 1 : 0.3,
                        transition: 'opacity 0.3s'
                      }}>
                        ✓ One giant pool of RAM — data stays in-memory, no filing cabinet needed
                      </div>
                    </div>

                    {/* Properties */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { label: 'Processing Model', value: 'Batch + Stream + SQL + ML + Graph', highlight: 'model', color: '#4A7A56' },
                        { label: 'Speed', value: '~2.3 seconds (same word count!)', highlight: 'speed', color: '#4A7A56' },
                        { label: 'Data Storage', value: 'In-memory between stages', highlight: 'data', color: '#4A7A56' },
                        { label: 'Fault Recovery', value: 'Recompute from lineage (DAG)', highlight: 'fault', color: '#9E7824' },
                        { label: 'Multi-Pass', value: 'Single job with chained stages', highlight: 'model', color: '#4A7A56' },
                        { label: 'Latency', value: 'Low (reuse JVM + cached data)', highlight: 'speed', color: '#4A7A56' }
                      ].map((prop, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 12px', borderRadius: '8px',
                          background: comparisonHighlight === prop.highlight ? 'rgba(58, 128, 128, 0.1)' : 'transparent',
                          border: comparisonHighlight === prop.highlight ? '1px solid rgba(58, 128, 128, 0.3)' : '1px solid transparent',
                          transition: 'all 0.3s',
                          opacity: !comparisonHighlight || comparisonHighlight === prop.highlight ? 1 : 0.4
                        }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{prop.label}</span>
                          <span style={{ fontSize: '12px', color: prop.color, fontWeight: '600', textAlign: 'right' }}>{prop.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interactive Visual: Same Word Count — Two Approaches */}
                <div style={{
                  background: 'rgba(245,243,239,0.6)',
                  border: '1px solid rgba(235,231,225,1)',
                  borderRadius: '16px', padding: '24px', marginBottom: '24px'
                }}>
                  <h3 style={{ color: 'var(--text-body)', fontSize: '16px', fontWeight: '700', marginBottom: '6px', textAlign: 'center' }}>
                    Same Task, Different Philosophy: Word Count on 384MB
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>
                    Filing cabinet (read/write/read/write) vs. shared memory (read once, transform in place)
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                    {/* MapReduce approach */}
                    <div style={{ padding: '16px', background: 'rgba(158, 90, 60, 0.05)', borderRadius: '12px', border: '1px solid rgba(158, 90, 60, 0.2)' }}>
                      <div style={{ color: '#9E5A3C', fontSize: '13px', fontWeight: '700', marginBottom: '4px', textAlign: 'center' }}>
                        MapReduce — The Filing Cabinet
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '10px', textAlign: 'center', marginBottom: '12px' }}>
                        Every step opens a drawer (disk I/O)
                      </div>
                      <div style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: '10px', lineHeight: '1.8', color: 'var(--text-body)' }}>
                        <div style={{ color: 'var(--text-muted)' }}>// Step 1: Read from HDFS (disk)</div>
                        <div>InputSplit[] splits = getSplits(job);</div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>// Step 2: Map — write output to disk</div>
                        <div>map(key, val) {'{'} emit(word, 1); {'}'}</div>
                        <div style={{ color: '#ef4444' }}>→ spill to local disk</div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>// Step 3: Shuffle via network + disk</div>
                        <div>sort + partition + transfer</div>
                        <div style={{ color: '#ef4444' }}>→ merge-sort from disk</div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>// Step 4: Reduce — write to HDFS</div>
                        <div>reduce(key, vals) {'{'} sum(vals); {'}'}</div>
                        <div style={{ color: '#ef4444' }}>→ write to HDFS (disk)</div>
                        <div style={{ marginTop: '8px', padding: '6px 10px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '6px', color: '#fca5a5', textAlign: 'center' }}>
                          ~45 seconds | 3x disk I/O | 1 JVM per task
                        </div>
                      </div>
                    </div>

                    {/* Spark approach */}
                    <div style={{ padding: '16px', background: 'rgba(158, 120, 36, 0.05)', borderRadius: '12px', border: '1px solid rgba(158, 120, 36, 0.2)' }}>
                      <div style={{ color: '#9E7824', fontSize: '13px', fontWeight: '700', marginBottom: '4px', textAlign: 'center' }}>
                        Spark — The Supercomputer
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '10px', textAlign: 'center', marginBottom: '12px' }}>
                        Everything stays in one giant pool of RAM
                      </div>
                      <div style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: '10px', lineHeight: '1.8', color: 'var(--text-body)' }}>
                        <div style={{ color: 'var(--text-muted)' }}>// Entire pipeline in one expression:</div>
                        <div>sc.textFile("/data/logs/*")</div>
                        <div>&nbsp; .flatMap(_.split(" "))</div>
                        <div style={{ color: '#4A7A56' }}>&nbsp; // pipelined in memory ↑</div>
                        <div>&nbsp; .map(word =&gt; (word, 1))</div>
                        <div style={{ color: '#4A7A56' }}>&nbsp; // still in memory ↑</div>
                        <div>&nbsp; .reduceByKey(_ + _)</div>
                        <div style={{ color: '#9E7824' }}>&nbsp; // shuffle (only disk write)</div>
                        <div>&nbsp; .saveAsTextFile("/results/")</div>
                        <div style={{ color: '#4A7A56' }}>&nbsp; // one pass through DAG</div>
                        <div style={{ marginTop: '8px', padding: '6px 10px', background: 'rgba(74, 122, 86, 0.15)', borderRadius: '6px', color: '#6ee7b7', textAlign: 'center' }}>
                          ~2.3 seconds | in-memory | reusable JVMs
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Differences Table */}
                <div style={{
                  background: 'rgba(245,243,239,0.6)',
                  border: '1px solid rgba(235,231,225,1)',
                  borderRadius: '16px', padding: '24px', marginBottom: '24px'
                }}>
                  <h3 style={{ color: 'var(--text-body)', fontSize: '16px', fontWeight: '700', marginBottom: '20px', textAlign: 'center' }}>
                    Detailed Comparison
                  </h3>

                  <div style={{ overflow: 'hidden', borderRadius: '12px', border: '1px solid rgba(235,231,225,1)' }}>
                    {/* Table Header */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1.5fr 2fr 2fr',
                      background: 'rgba(235,232,228,0.8)', padding: '12px 16px',
                      borderBottom: '1px solid rgba(235,231,225,1)'
                    }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Aspect</div>
                      <div style={{ color: '#9E5A3C', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>MapReduce</div>
                      <div style={{ color: '#9E7824', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Spark</div>
                    </div>

                    {/* Table Rows */}
                    {[
                      { aspect: 'Year Introduced', mr: '2004 (Google paper)', spark: '2009 (UC Berkeley)', cat: null },
                      { aspect: 'Cluster Personality', mr: 'Independent workers + filing cabinet', spark: 'One "supercomputer" — shared pool of RAM', cat: 'data' },
                      { aspect: 'Processing Type', mr: 'Batch only', spark: 'Batch + Stream + SQL + ML', cat: 'model' },
                      { aspect: 'Data Storage', mr: 'Disk (HDFS) between stages', spark: 'In-memory (RAM) between stages', cat: 'data' },
                      { aspect: 'Speed (batch)', mr: '1x baseline', spark: '10-100x faster', cat: 'speed' },
                      { aspect: 'Fault Tolerance', mr: 'Data replication (3x copies)', spark: 'Lineage recomputation (no copies)', cat: 'fault' },
                      { aspect: 'Execution Model', mr: '2 rigid phases: Map → Reduce', spark: 'DAG of arbitrary stages', cat: 'model' },
                      { aspect: 'Optimization', mr: 'Manual tuning', spark: 'Catalyst optimizer + Tungsten engine', cat: 'model' },
                      { aspect: 'Iterative Algos', mr: 'Terrible (disk per iteration)', spark: 'Excellent (data cached in memory)', cat: 'speed' },
                      { aspect: 'Shuffle', mr: 'Always writes to disk', spark: 'Writes to disk (but minimized)', cat: 'data' },
                      { aspect: 'Language', mr: 'Java (mainly)', spark: 'Scala, Python, Java, R, SQL', cat: 'model' },
                      { aspect: 'Memory Needs', mr: 'Low (disk-based)', spark: 'High (data in RAM)', cat: 'data' },
                      { aspect: 'Best For', mr: 'Simple ETL, proven reliability', spark: 'Complex analytics, ML, real-time', cat: 'model' }
                    ].map((row, i) => (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '1.5fr 2fr 2fr',
                        padding: '10px 16px',
                        background: i % 2 === 0 ? 'rgba(245,243,239,0.4)' : 'rgba(235,232,228,0.4)',
                        borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                        opacity: !comparisonHighlight || comparisonHighlight === row.cat || !row.cat ? 1 : 0.3,
                        transition: 'opacity 0.3s'
                      }}>
                        <div style={{ color: 'var(--text-body)', fontSize: '12px', fontWeight: '600' }}>{row.aspect}</div>
                        <div style={{ color: 'var(--text-body)', fontSize: '12px', textAlign: 'center' }}>{row.mr}</div>
                        <div style={{ color: 'var(--text-body)', fontSize: '12px', textAlign: 'center' }}>{row.spark}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* When to Use Which */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{
                    background: 'rgba(158, 90, 60, 0.08)', border: '1px solid rgba(158, 90, 60, 0.25)',
                    borderRadius: '12px', padding: '20px'
                  }}>
                    <div style={{ color: '#9E5A3C', fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
                      When to Choose MapReduce
                    </div>
                    <ul style={{ color: 'var(--text-body)', fontSize: '12px', lineHeight: '2', paddingLeft: '20px' }}>
                      <li>Budget constraints — runs on minimal memory</li>
                      <li>Simple one-pass ETL jobs (no iteration)</li>
                      <li>Extremely large datasets where disk I/O is acceptable</li>
                      <li>Existing Hadoop ecosystem with heavy HDFS usage</li>
                      <li>Guaranteed reliability over speed</li>
                    </ul>
                  </div>
                  <div style={{
                    background: 'rgba(158, 120, 36, 0.08)', border: '1px solid rgba(158, 120, 36, 0.25)',
                    borderRadius: '12px', padding: '20px'
                  }}>
                    <div style={{ color: '#9E7824', fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
                      When to Choose Spark
                    </div>
                    <ul style={{ color: 'var(--text-body)', fontSize: '12px', lineHeight: '2', paddingLeft: '20px' }}>
                      <li>Iterative algorithms (ML training, PageRank)</li>
                      <li>Interactive SQL queries on large datasets</li>
                      <li>Mixed workloads (batch + stream + ML)</li>
                      <li>Speed is critical — need near real-time results</li>
                      <li>Complex multi-stage pipelines in a single job</li>
                    </ul>
                  </div>
                </div>

                {/* Bottom Summary */}
                <div style={{
                  marginTop: '24px', padding: '16px 20px', textAlign: 'center',
                  background: 'rgba(58, 128, 128, 0.08)',
                  border: '1px solid rgba(58, 128, 128, 0.25)',
                  borderRadius: '12px'
                }}>
                  <div style={{ color: '#22d3ee', fontSize: '13px', lineHeight: '1.8' }}>
                    <strong>The Evolution:</strong> Both MapReduce and Spark are <em>clustered</em> technologies under the <em>distributed computing</em> umbrella — but they treat the cluster differently. MapReduce (2004) pioneered the "distributed workhorse" pattern: break a job into tiny pieces, file results to disk, repeat. Spark (2009) reimagined the cluster as a unified "supercomputer" — one massive pool of RAM where data stays alive between operations. Today Spark has largely replaced MapReduce for most workloads, but understanding MapReduce is essential — it established the fundamental map → shuffle → reduce pattern that all modern distributed systems build upon.
                  </div>
                </div>
              </div>
            </div>
          )}

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
              background: 'rgba(245,243,239,0.95)',
              
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
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {selectedComponent.description}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#4A7A9B', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Details
              </h3>
              <p style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.6' }}>
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
                    background: 'rgba(235,232,228,0.8)',
                    border: '1px solid rgba(122, 90, 158, 0.3)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    color: 'var(--text-body)',
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
                          e.target.style.background = 'rgba(122, 90, 158, 0.2)';
                          e.target.style.borderColor = 'rgba(122, 90, 158, 0.6)';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(235,232,228,0.8)';
                          e.target.style.borderColor = 'rgba(122, 90, 158, 0.3)';
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
              <h3 style={{ color: '#C8A84E', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
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
                      background: 'rgba(235,232,228,0.6)',
                      border: '1px solid rgba(235,231,225,1)',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        padding: '10px 14px',
                        background: 'rgba(245,243,239,0.8)',
                        borderBottom: '1px solid rgba(235,231,225,1)',
                        color: '#C8A84E',
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
                        color: 'var(--text-body)',
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
                background: 'linear-gradient(135deg, #4A7A9B 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--text-primary)',
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
      </main>
    </div>
  );
};

export default BigDataArchitectureExplorer;
