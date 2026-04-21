# FATHOM Database Components - TypeScript Migration Guide

## Migration Status

This document tracks the conversion of JSX database components to TypeScript with Tailwind CSS styling.

### Completed Conversions

✅ **AIQueryAdvisorTab.tsx** (331 lines)

- Full TypeScript implementation with complete type definitions
- Interface types for QueryAnalysis, QuerySuggestion, AntiPattern, DiscoveredQuery, IndexRecommendation
- All props properly typed as React.FC<Props>
- Inline styles preserved from original

✅ **QueryPlanViewer.tsx** (475 lines)

- Full TypeScript implementation with PlanNode and QueryPlan types
- SummaryStats interface for state management
- CSSProperties typed styles object
- Complete functional implementation preserved

✅ **types.ts** (Shared Type Definitions)

- Comprehensive type library for all database components
- Covers: Query Plans, Indexes, Bloat, Schema, Charts, AI Advisor, Regressions, Analytics, Versioning, SQL Console, Tree Browser

### Files Requiring Completion

The following files have been partially converted (imports updated but need type additions):

#### Category 1: Core Analysis Components

- **QueryOptimizerTab.tsx** (2291 lines) - Complex optimizer with multiple subsystems
- **SqlConsoleTab.tsx** (2109 lines) - CodeMirror integration, query execution
- **TableAnalytics.tsx** (2496 lines) - Comprehensive table statistics and visualizations

#### Category 2: Index & Performance

- **IndexesTab.tsx** (1150 lines) - Index management, health monitoring
- **BloatAnalysisTab.tsx** (879 lines) - Table/Index bloat analysis

#### Category 3: Query Analysis

- **QueryPlanRegressionTab.tsx** (886 lines) - Baseline tracking, regression detection
- **SchemaVersioningTab.tsx** (1629 lines) - Migration management, version control

#### Category 4: Visualization Components

- **SchemaTreeBrowser.tsx** (599 lines) - Tree-view schema navigation
- **SchemaVisualizerTab.tsx** (557 lines) - Force-directed graph visualization
- **TableDependencyMindMap.tsx** (716 lines) - Radial dependency visualization
- **ChartBuilder.tsx** (611 lines) - Recharts-based data visualization

## TypeScript Conversion Checklist

For each remaining file, apply these changes:

### Step 1: Add Type Imports

```typescript
import type {
    // Select relevant types from types.ts
    PlanNode,
    QueryPlan,
    IndexInfo,
    TableBloat,
    Column,
    Table,
    // ... etc
} from './types';
```

### Step 2: Add Interface Definitions (if file-specific)

```typescript
interface FileName Props {
  // Define all props with their types
  data?: DataType[];
  onSelect?: (id: string) => void;
  loading?: boolean;
  error?: string | null;
}
```

### Step 3: Update Component Signature

```typescript
// BEFORE:
const ComponentName = ({ prop1, prop2 }) => {

// AFTER:
const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
```

### Step 4: Add State Type Annotations

```typescript
// BEFORE:
const [data, setData] = useState(null);

// AFTER:
const [data, setData] = useState<DataType[] | null>(null);
```

### Step 5: Type Event Handlers

```typescript
// BEFORE:
const handleClick = (e) => { ... }

// AFTER:
const handleClick = (e: React.MouseEvent<HTMLElement>) => { ... }
```

### Step 6: Type useCallback and useMemo

```typescript
// BEFORE:
const filtered = useMemo(() => {

// AFTER:
const filtered = useMemo<FilteredType>(() => {
```

## Tailwind CSS Notes

All components are currently using inline styles (via THEME object from theme.jsx). The components are styled with a design system that includes:

- **Colors**: Primary, Secondary, Success, Warning, Danger, Background, Surface, Glass
- **Typography**: Body and Mono fonts via THEME.fontBody and THEME.fontMono
- **Spacing**: Uses pixel values (8px, 12px, 16px, 20px increments)
- **Shadows & Effects**: Glass morphism effects, transitions

### Tailwind Integration (Optional Enhancement)

To convert inline styles to Tailwind, create a custom Tailwind config with fathom-\* custom colors:

```typescript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'fathom-primary': THEME.primary,
      'fathom-secondary': THEME.secondary,
      'fathom-success': THEME.success,
      'fathom-warning': THEME.warning,
      'fathom-danger': THEME.danger,
      'fathom-surface': THEME.surface,
      'fathom-glass': THEME.glass,
    },
    fontFamily: {
      body: THEME.fontBody,
      mono: THEME.fontMono,
    }
  }
}
```

Then replace inline styles:

```typescript
// BEFORE:
<div style={{ background: THEME.surface, padding: '16px' }}>

// AFTER:
<div className="bg-fathom-surface p-4">
```

## API Type Expectations

Key API endpoints and their return types:

### Query Execution

```typescript
POST /api/queries/execute
Body: { query: string, params?: any[] }
Response: QueryResult

POST /api/queries/explain
Body: { query: string }
Response: QueryPlan
```

### Indexes

```typescript
GET /api/indexes/health → IndexHealth
GET /api/indexes/missing → MissingIndex[]
GET /api/indexes/unused → IndexInfo[]
GET /api/indexes/duplicates → IndexInfo[]
GET /api/indexes/bloat → IndexInfo[]
```

### Schema

```typescript
GET /api/schema/tree → { schemas: Schema[] }
GET /api/schema/relationships → { tables: Table[], relationships: TableRelationship[] }
GET /api/schema/dependencies → SchemaDependency[]
GET /api/schema/columns/:schema/:table → Column[]
```

### Analysis

```typescript
GET /api/bloat/tables → TableBloat[]
GET /api/bloat/indexes → IndexBloat[]
GET /api/bloat/summary → BloatSummary

POST /api/ai-query/analyze → QueryAnalysis
GET /api/ai-query/suggestions → { suggestions: DiscoveredQuery[] }
GET /api/ai-query/indexes?table=name → { recommendations: IndexRecommendation[] }
```

## File-Specific Notes

### QueryOptimizerTab.tsx

- Uses CONTEXT API (SqlContext) - add context type definitions
- Has STYLE component - type this as React.FC
- Multiple sub-components with local state
- Uses recharts for visualizations

### SqlConsoleTab.tsx

- CodeMirror integration needs proper typing
- Query execution with streaming results
- Tab management with history/snippets
- useReducer for complex state

### TableAnalytics.tsx

- Heavy charting with recharts
- Context usage for filters
- Multiple data hooks (useTableData pattern)
- AI thinking state management

### SchemaVisualizerTab.tsx & TableDependencyMindMap.tsx

- D3/force-directed graph simulation
- SVG rendering with React refs
- Requires proper typing of D3 node/link structures
- Mouse event handlers for interaction

## Testing Recommendations

After conversion, test:

1. **Type Safety**: `tsc --noEmit` should pass with no errors
2. **Runtime**: All features should work identically to JSX versions
3. **Data Flow**: Verify prop drilling and state management
4. **API Integration**: Confirm all API calls match response types
5. **UI Rendering**: Visual parity with original components

## Migration Timeline

- [x] types.ts shared type library
- [x] AIQueryAdvisorTab.tsx
- [x] QueryPlanViewer.tsx
- [ ] Remaining 11 components (estimated 2-4 hours each depending on complexity)

## Resources

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Recharts TypeScript Guide](https://recharts.org/en-US/guide/typescript)
