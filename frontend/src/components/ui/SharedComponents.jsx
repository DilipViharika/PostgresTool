// ═══════════════════════════════════════════════════════════════════════════
//  BARREL FILE — Re-exports all UI components and utilities
// ═══════════════════════════════════════════════════════════════════════════
//  This file maintains backward compatibility by re-exporting all components
//  from their respective organized modules. All existing imports continue to work:
//
//    import { WebSocketStatus, AlertBanner } from './components/ui/SharedComponents.jsx'
//
//  New imports can be more specific:
//
//    import { WebSocketStatus } from './components/ui/Badges.jsx'
//    import { AlertBanner } from './components/ui/Alerts.jsx'

// Core Theme, Context, and Hooks
export {
    THEME,
    useNeural,
    NeuralProvider,
    injectKeyframes,
    useAnimatedValue,
    useCopyToClipboard,
    useHover,
    useTypewriter,
    useInterval,
    useCountdown,
    usePrevious,
} from './Hooks.jsx';

// Decorative Primitives
export {
    CornerBrackets,
    ScanlineOverlay,
    HexPattern,
    GridPattern,
    GlowOrb,
    NoiseTexture,
    CircuitLines,
} from './Primitives.jsx';

// Badges and Status Indicators
export {
    ChipBadge,
    TrendChip,
    SeverityBadge,
    RoleBadge,
    LiveStatusBadge,
    StatusDot,
    WebSocketStatus,
    BloatStatusBadge,
} from './Badges.jsx';

// Card Components
export {
    GlassCard,
    MetricCard,
} from './Cards.jsx';

// Charts and Visualization Components
export {
    ResourceGauge,
    NeonProgressBar,
    CacheStatsRing,
    PulseRing,
    HeatCell,
    ConnectionPoolBar,
    RadarMetric,
    CustomTooltip,
} from './Charts.jsx';

// Alert Components
export {
    AlertBanner,
    AlertToast,
} from './Alerts.jsx';

// Data Display Components
export {
    DataTable,
    FilterPills,
    Timeline,
    EmptyState,
    SkeletonLoader,
    LoadingOverlay,
} from './DataDisplay.jsx';

// Form Input Components
export {
    NanoButton,
    MiniButton,
    CopyButton,
    NeonSlider,
    NeonToggle,
    NeuralSelect,
    PillInput,
} from './Inputs.jsx';

// Overlay Components
export {
    LoadingOverlay as OverlayLoadingOverlay,
    SkeletonLoader as OverlaySkeletonLoader,
    EmptyState as OverlayEmptyState,
} from './Overlays.jsx';

// Advanced Components
export {
    Terminal,
    TerminalLine,
    TypewriterText,
    CommandPalette,
    CommandPaletteItem,
    NetworkGraph,
    WaveformBar,
    StatCompare,
    BentoMetric,
    AIAgentView,
    QueryHistoryItem,
    NodeLink,
    SequenceUsageBar,
    ExtensionCard,
    SettingRow,
    HeatmapGrid,
} from './Advanced.jsx';
