# ImportantSubjects Component

A well-organized React component for analyzing exam subjects with modern best practices.

## 📁 File Structure

```
ImportantSubjects/
├── index.tsx                    # Main component
├── types.ts                     # TypeScript interfaces and types
├── constants.ts                 # Static data (colors, icons, etc.)
├── README.md                    # This documentation
├── components/                  # Reusable UI components
│   ├── index.ts                # Component exports
│   ├── SubjectDetailModal.tsx  # Modal for subject details
│   ├── SubjectGroupModal.tsx   # Modal for creating/editing groups
│   ├── StatisticsCards.tsx     # Statistics display cards
│   ├── SubjectCard.tsx         # Individual subject card
│   └── LessonCard.tsx          # Lesson container card
├── hooks/                       # Custom React hooks
│   ├── index.ts                # Hook exports
│   ├── useSubjectGroups.ts     # Subject groups state management
│   └── useSubjectData.ts       # Subject data logic and processing
└── utils/                       # Utility functions
    ├── index.ts                # Utility exports
    └── subjectDataUtils.ts     # Data processing functions
```

## 🎯 Key Features

- **Modern React Patterns**: Uses functional components with hooks
- **Separation of Concerns**: Clear division between UI, logic, and data
- **Reusability**: Modular components and custom hooks
- **Type Safety**: Comprehensive TypeScript interfaces
- **Performance**: Optimized with useMemo for expensive calculations
- **Maintainability**: Well-organized file structure with clear naming

## 🔧 Components

### Main Component (`index.tsx`)
The primary component that orchestrates all functionality using custom hooks and child components.

### UI Components (`components/`)
- **LessonCard**: Container for displaying subjects grouped by lesson
- **SubjectCard**: Individual subject display with progress and metadata
- **StatisticsCards**: Dashboard-style stats overview
- **SubjectDetailModal**: Detailed view of subject performance across exams
- **SubjectGroupModal**: Interface for creating and editing subject groups

### Custom Hooks (`hooks/`)
- **useSubjectGroups**: Manages subject group state with localStorage persistence
- **useSubjectData**: Handles data processing, view management, and memoized calculations

### Utilities (`utils/`)
- **subjectDataUtils**: Pure functions for data transformation and calculations

## 📊 Usage

```tsx
import { ImportantSubjects } from './components/ImportantSubjects';

// Use the component
<ImportantSubjects data={examData} />
```

## 🔄 Data Flow

1. Main component receives exam data via props
2. Custom hooks process and transform data
3. UI components receive processed data and event handlers
4. User interactions flow back through event handlers
5. State updates trigger re-renders with new data

## 🏗️ Architecture Benefits

- **Scalability**: Easy to add new features and components
- **Testing**: Each piece can be tested in isolation
- **Code Reuse**: Hooks and utilities can be used in other components
- **Debugging**: Clear separation makes issues easier to trace
- **Team Development**: Multiple developers can work on different parts

## 🔧 Development

When adding new features:
1. Add types to `types.ts`
2. Add constants to `constants.ts` if needed
3. Create utility functions in `utils/`
4. Create custom hooks for complex logic in `hooks/`
5. Build UI components in `components/`
6. Update exports in index files 