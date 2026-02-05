# Frontend Design Patterns, System Design & Best Practices

**Created:** January 18, 2026  
**Last Updated:** February 6, 2026  
**Purpose:** Comprehensive reference document for all design patterns, system design principles, and best practices followed in AdmissionTimes Frontend  
**Status:** Active Reference Document - JWT Authentication Implemented

---

## 📝 Recent Updates

### February 6, 2026 - JWT Authentication Complete
- ✅ JWT Authentication patterns documented (ES256 tokens)
- ✅ Auto-sync user provisioning implementation
- ✅ Role consistency and database sync patterns
- ✅ Complete authentication architecture in [AUTHENTICATION_ARCHITECTURE.md](../AUTHENTICATION_ARCHITECTURE.md)

---

## 📋 Table of Contents

1. [Architecture Patterns](#architecture-patterns)
2. [Design Patterns](#design-patterns)
3. [SOLID Principles](#solid-principles)
4. [System Design Principles](#system-design-principles)
5. [Code Organization Patterns](#code-organization-patterns)
6. [State Management Patterns](#state-management-patterns)
7. [Component Patterns](#component-patterns)
8. [API Integration Patterns](#api-integration-patterns)
9. [Error Handling Patterns](#error-handling-patterns)
10. [Performance Patterns](#performance-patterns)
11. [Code Quality Practices](#code-quality-practices)
12. [Naming Conventions](#naming-conventions)
13. [Documentation Practices](#documentation-practices)

---

## 🏗️ Architecture Patterns

### 1. Component-Based Architecture

**Purpose:** Build UI as a composition of reusable, independent components.

**Implementation:**
- Components are self-contained units
- Each component has single responsibility
- Components communicate via props and callbacks
- Composition over inheritance

**Structure:**
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── student/        # Student-specific components
│   ├── university/     # University-specific components
│   └── admin/          # Admin-specific components
├── pages/              # Page-level components
├── layouts/            # Layout components
└── contexts/           # Context providers
```

**Benefits:**
- Reusability
- Maintainability
- Testability
- Clear separation of concerns

**Example:**
```typescript
// ✅ Good: Composable components
function StudentDashboard() {
  return (
    <StudentLayout>
      <WelcomeBanner />
      <StatsCards />
      <RecommendedPrograms />
      <UpcomingDeadlines />
    </StudentLayout>
  );
}
```

---

### 2. Container/Presentational Pattern

**Purpose:** Separate data logic from presentation logic.

**Implementation:**
- **Container Components:** Handle data fetching, state management, business logic
- **Presentational Components:** Handle UI rendering, receive data via props

**Example:**
```typescript
// Container Component (Smart)
function StudentDashboardContainer() {
  const { admissions, loading, error } = useStudentData();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <StudentDashboardView admissions={admissions} />;
}

// Presentational Component (Dumb)
function StudentDashboardView({ admissions }: { admissions: Admission[] }) {
  return (
    <div>
      {admissions.map(admission => (
        <AdmissionCard key={admission.id} admission={admission} />
      ))}
    </div>
  );
}
```

**Benefits:**
- Separation of concerns
- Reusable presentational components
- Easier testing
- Clear data flow

---

### 3. Feature-Based Architecture

**Purpose:** Organize code by features/modules rather than file types.

**Implementation:**
- Group related components, hooks, services, types together
- Each feature is self-contained
- Clear feature boundaries

**Structure:**
```
src/
├── features/
│   ├── admissions/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── notifications/
│   └── deadlines/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── pages/
```

**Benefits:**
- Easy to locate feature code
- Clear feature boundaries
- Scalable structure
- Feature isolation

---

### 4. Layered Architecture (Frontend)

**Purpose:** Separate concerns into distinct layers.

**Layer Structure:**
```
┌─────────────────────────────────────┐
│      Presentation Layer             │  UI Components
│  (Components, Pages, Layouts)       │  No business logic
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Application Layer              │  Business Logic
│  (Hooks, Contexts, State)          │  No API calls
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Service Layer                  │  API Integration
│  (API Services, HTTP Client)       │  No UI concerns
└─────────────────────────────────────┘
```

**Dependency Rule:**
- Components depend on Hooks/Contexts
- Hooks/Contexts depend on Services
- Services depend on API Client
- **No reverse dependencies**

---

## 🎨 Design Patterns

### 1. Custom Hooks Pattern

**Purpose:** Extract reusable logic into custom hooks.

**Implementation:**
- Encapsulate stateful logic
- Reusable across components
- Follow naming convention: `use*`

**Example:**
```typescript
// Custom Hook
export function useAdmissions(filters?: AdmissionFilters) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await admissionsService.list(filters);
        setAdmissions(response.data);
      } catch (err) {
        setError('Failed to fetch admissions');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, [filters]);

  return { admissions, loading, error, refetch: fetchAdmissions };
}

// Usage in Component
function AdmissionsList() {
  const { admissions, loading, error } = useAdmissions({ 
    verification_status: 'verified' 
  });
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <AdmissionCards admissions={admissions} />;
}
```

**Benefits:**
- Reusable logic
- Separation of concerns
- Testable hooks
- Clean components

---

### 2. Context Pattern

**Purpose:** Share state across component tree without prop drilling.

**Implementation:**
- Context providers wrap component trees
- Consumers access context via hooks
- Separate contexts for different domains

**Example:**
```typescript
// Context Definition
interface StudentDataContextValue {
  admissions: Admission[];
  notifications: Notification[];
  toggleSaved: (id: string) => void;
  markNotificationRead: (id: string) => void;
}

const StudentDataContext = createContext<StudentDataContextValue | undefined>(undefined);

// Provider Component
export function StudentDataProvider({ children }: { children: ReactNode }) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  // ... state management

  const value: StudentDataContextValue = {
    admissions,
    notifications,
    toggleSaved,
    markNotificationRead,
  };

  return (
    <StudentDataContext.Provider value={value}>
      {children}
    </StudentDataContext.Provider>
  );
}

// Custom Hook for Context
export function useStudentData() {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error('useStudentData must be used within StudentDataProvider');
  }
  return context;
}

// Usage
function StudentDashboard() {
  const { admissions, toggleSaved } = useStudentData();
  // Use context values
}
```

**Benefits:**
- Avoid prop drilling
- Centralized state
- Easy to access
- Type-safe

---

### 3. Higher-Order Component (HOC) Pattern

**Purpose:** Reuse component logic by wrapping components.

**Implementation:**
- HOC takes a component and returns enhanced component
- Share common logic across components
- Compose multiple HOCs

**Example:**
```typescript
// HOC for Authentication
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth();
    
    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" />;
    
    return <Component {...props} />;
  };
}

// Usage
const ProtectedDashboard = withAuth(StudentDashboard);
```

**Benefits:**
- Reusable logic
- Component composition
- Separation of concerns

**Note:** Prefer custom hooks over HOCs when possible (more flexible).

---

### 4. Render Props Pattern

**Purpose:** Share code between components using a prop that is a function.

**Implementation:**
- Component receives a function as prop
- Function receives state/data as arguments
- Component calls function with data

**Example:**
```typescript
// Render Prop Component
function DataFetcher<T>({ 
  url, 
  children 
}: { 
  url: string; 
  children: (data: T, loading: boolean, error: Error | null) => ReactNode;
}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return <>{children(data as T, loading, error)}</>;
}

// Usage
<DataFetcher<Admission[]> url="/api/admissions">
  {(admissions, loading, error) => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    return <AdmissionCards admissions={admissions} />;
  }}
</DataFetcher>
```

**Benefits:**
- Flexible composition
- Share logic
- Dynamic rendering

**Note:** Prefer custom hooks over render props (simpler API).

---

### 5. Compound Components Pattern

**Purpose:** Create components that work together as a unit.

**Implementation:**
- Parent component manages state
- Child components access state via context
- Flexible composition

**Example:**
```typescript
// Compound Component
const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}>({ activeTab: '', setActiveTab: () => {} });

function Tabs({ children, defaultTab }: { children: ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: ReactNode }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  
  return (
    <button
      className={activeTab === id ? 'active' : ''}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== id) return null;
  return <div className="tab-panel">{children}</div>;
}

// Usage
<Tabs defaultTab="profile">
  <TabList>
    <Tab id="profile">Profile</Tab>
    <Tab id="settings">Settings</Tab>
  </TabList>
  <TabPanel id="profile">Profile Content</TabPanel>
  <TabPanel id="settings">Settings Content</TabPanel>
</Tabs>
```

**Benefits:**
- Flexible API
- Intuitive usage
- Composable

---

### 6. Provider Pattern

**Purpose:** Provide shared state/functionality to component tree.

**Implementation:**
- Provider component wraps app/feature
- Context provides shared state
- Consumers access via hooks

**Example:**
```typescript
// Multiple Providers Composition
function App() {
  return (
    <AuthProvider>
      <StudentDataProvider>
        <UniversityDataProvider>
          <Router>
            <Routes>
              {/* Routes */}
            </Routes>
          </Router>
        </UniversityDataProvider>
      </StudentDataProvider>
    </AuthProvider>
  );
}
```

**Benefits:**
- Centralized state
- Easy access
- Type-safe
- Composable

---

### 7. Service Layer Pattern

**Purpose:** Abstract API calls from components.

**Implementation:**
- Service functions encapsulate API calls
- Components use services, not direct API calls
- Centralized error handling
- Type-safe API contracts

**Example:**
```typescript
// Service Layer
export const admissionsService = {
  list: async (params?: AdmissionListParams): Promise<PaginatedResponse<Admission>> => {
    const response = await apiClient.get('/admissions', { params });
    return response.data;
  },
  
  getById: async (id: string): Promise<Admission> => {
    const response = await apiClient.get(`/admissions/${id}`);
    return response.data.data;
  },
  
  create: async (data: CreateAdmissionDTO): Promise<Admission> => {
    const response = await apiClient.post('/admissions', data);
    return response.data.data;
  },
};

// Usage in Component/Hook
function useAdmissions() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  
  useEffect(() => {
    admissionsService.list().then(setAdmissions);
  }, []);
  
  return admissions;
}
```

**Benefits:**
- Separation of concerns
- Reusable API logic
- Centralized error handling
- Easy to test
- Type-safe

---

### 8. Factory Pattern (Component Factory)

**Purpose:** Create components dynamically based on configuration.

**Implementation:**
- Factory function creates components
- Configuration-driven component creation
- Flexible component generation

**Example:**
```typescript
// Component Factory
function createFormField(type: 'text' | 'email' | 'textarea') {
  const components = {
    text: TextInput,
    email: EmailInput,
    textarea: TextAreaInput,
  };
  
  return components[type];
}

// Usage
function DynamicForm({ fields }: { fields: FormField[] }) {
  return (
    <form>
      {fields.map(field => {
        const FieldComponent = createFormField(field.type);
        return <FieldComponent key={field.name} {...field} />;
      })}
    </form>
  );
}
```

**Benefits:**
- Dynamic component creation
- Configuration-driven
- Flexible

---

## 🔧 SOLID Principles (Frontend)

### 1. Single Responsibility Principle (SRP)

**Definition:** A component/hook should have only one reason to change.

**Implementation:**
- Components: Single UI responsibility
- Hooks: Single piece of logic
- Services: Single API domain
- Utils: Single utility function

**Example:**
```typescript
// ✅ Good: Single responsibility
function AdmissionCard({ admission }: { admission: Admission }) {
  return (
    <div>
      <h3>{admission.title}</h3>
      <p>{admission.description}</p>
    </div>
  );
}

// ❌ Bad: Multiple responsibilities
function AdmissionCard({ admission }: { admission: Admission }) {
  const [saved, setSaved] = useState(false);
  
  const handleSave = async () => {
    await saveToWatchlist(admission.id);
    setSaved(true);
    sendAnalytics('admission_saved');
  };
  
  return (
    <div>
      <h3>{admission.title}</h3>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

---

### 2. Open/Closed Principle (OCP)

**Definition:** Open for extension, closed for modification.

**Implementation:**
- Extend components via props/composition
- Use hooks for extending functionality
- Avoid modifying existing components

**Example:**
```typescript
// ✅ Good: Extensible via props
function Button({ 
  children, 
  variant = 'primary',
  size = 'medium',
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Usage - extended without modification
<Button variant="secondary" size="large">Click</Button>

// ❌ Bad: Requires modification
function Button({ children }: { children: ReactNode }) {
  return <button className="btn-primary">{children}</button>;
  // Must modify to add variants
}
```

---

### 3. Liskov Substitution Principle (LSP)

**Definition:** Components should be substitutable without breaking functionality.

**Implementation:**
- Consistent prop interfaces
- Predictable component behavior
- No breaking changes in variants

**Example:**
```typescript
// ✅ Good: Substitutable components
interface CardProps {
  title: string;
  children: ReactNode;
}

function AdmissionCard({ title, children }: CardProps) {
  return <Card title={title}>{children}</Card>;
}

function NotificationCard({ title, children }: CardProps) {
  return <Card title={title}>{children}</Card>;
}

// Both can be used interchangeably
```

---

### 4. Interface Segregation Principle (ISP)

**Definition:** Components should not depend on props they don't use.

**Implementation:**
- Small, focused prop interfaces
- Split large components
- Use composition over large prop lists

**Example:**
```typescript
// ✅ Good: Segregated interfaces
interface CardHeaderProps {
  title: string;
  subtitle?: string;
}

interface CardBodyProps {
  children: ReactNode;
}

interface CardFooterProps {
  actions: ReactNode;
}

function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>;
}

function CardHeader({ title, subtitle }: CardHeaderProps) {
  return (
    <div className="card-header">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

// ❌ Bad: Fat interface
interface CardProps {
  title: string;
  subtitle?: string;
  body: ReactNode;
  actions: ReactNode;
  footer?: ReactNode;
  // Too many props
}
```

---

### 5. Dependency Inversion Principle (DIP)

**Definition:** Depend on abstractions, not concretions.

**Implementation:**
- Components depend on interfaces/types
- Services depend on API contracts
- Use dependency injection

**Example:**
```typescript
// ✅ Good: Depend on abstraction
interface AdmissionService {
  list(): Promise<Admission[]>;
  getById(id: string): Promise<Admission>;
}

function useAdmissions(service: AdmissionService) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  
  useEffect(() => {
    service.list().then(setAdmissions);
  }, [service]);
  
  return admissions;
}

// Can swap implementations
useAdmissions(admissionsService);
useAdmissions(mockAdmissionsService);

// ❌ Bad: Depend on concretion
function useAdmissions() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  
  useEffect(() => {
    fetch('/api/admissions').then(res => res.json()).then(setAdmissions);
    // Direct dependency on fetch API
  }, []);
  
  return admissions;
}
```

---

## 🎯 System Design Principles

### 1. Separation of Concerns

**Principle:** Each component/hook/service should have a single, well-defined responsibility.

**Implementation:**
- Components: UI rendering only
- Hooks: State/logic only
- Services: API calls only
- Utils: Pure functions only

---

### 2. DRY (Don't Repeat Yourself)

**Principle:** Avoid code duplication.

**Implementation:**
- Extract reusable components
- Create custom hooks for shared logic
- Use utility functions
- Share types/interfaces

**Example:**
```typescript
// ✅ Good: Reusable utility
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Usage everywhere
formatDate(admission.deadline);
formatDate(notification.created_at);

// ❌ Bad: Repeated code
const deadline = new Date(admission.deadline).toLocaleDateString(...);
const createdAt = new Date(notification.created_at).toLocaleDateString(...);
```

---

### 3. KISS (Keep It Simple, Stupid)

**Principle:** Prefer simple solutions over complex ones.

**Implementation:**
- Simple component structure
- Clear, readable code
- Avoid over-engineering
- Use built-in React features

---

### 4. YAGNI (You Aren't Gonna Need It)

**Principle:** Don't implement features until needed.

**Implementation:**
- Implement only current requirements
- Avoid speculative abstractions
- Refactor when needed
- Keep components focused

---

### 5. Fail Fast

**Principle:** Detect and report errors as early as possible.

**Implementation:**
- Type checking (TypeScript)
- Prop validation
- Early error returns
- Clear error messages

**Example:**
```typescript
// ✅ Good: Fail fast
function AdmissionCard({ admission }: { admission: Admission }) {
  if (!admission) {
    throw new Error('Admission is required');
  }
  
  return <div>{admission.title}</div>;
}
```

---

### 6. Principle of Least Surprise

**Principle:** Code should behave as expected.

**Implementation:**
- Consistent naming
- Predictable component behavior
- Standard patterns
- Clear documentation

---

## 📁 Code Organization Patterns

### 1. Feature-Based Organization

**Structure:**
```
src/
├── features/
│   ├── admissions/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── notifications/
│   └── deadlines/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
└── pages/
```

**Benefits:**
- Easy to locate feature code
- Clear feature boundaries
- Scalable structure

---

### 2. Domain-Based Organization (Current)

**Structure:**
```
src/
├── components/
│   ├── student/
│   ├── university/
│   ├── admin/
│   └── common/
├── pages/
│   ├── student/
│   ├── university/
│   └── admin/
├── contexts/
├── services/
├── hooks/
└── utils/
```

**Benefits:**
- Clear domain separation
- Easy to find domain code
- Aligned with user roles

---

### 3. Shared Code Organization

**Structure:**
```
src/shared/
├── components/      # Reusable UI components
├── hooks/          # Shared hooks
├── services/       # Shared services
├── utils/          # Utility functions
├── types/          # Shared types
└── constants/      # Shared constants
```

**Benefits:**
- Reusable code
- Consistent utilities
- Shared types

---

## 🔄 State Management Patterns

### 1. Local State Pattern

**Purpose:** Manage component-specific state.

**Implementation:**
- Use `useState` for local state
- Keep state close to where it's used
- Don't lift state unnecessarily

**Example:**
```typescript
function SearchInput() {
  const [query, setQuery] = useState('');
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

---

### 2. Context State Pattern

**Purpose:** Share state across component tree.

**Implementation:**
- Context providers for shared state
- Separate contexts for different domains
- Avoid overusing context

**Example:**
```typescript
// Domain-specific context
export function StudentDataProvider({ children }) {
  const [admissions, setAdmissions] = useState([]);
  // ... state management
  
  return (
    <StudentDataContext.Provider value={{ admissions, ... }}>
      {children}
    </StudentDataContext.Provider>
  );
}
```

---

### 3. Server State Pattern

**Purpose:** Manage data fetched from API.

**Implementation:**
- Use custom hooks for API data
- Handle loading/error states
- Cache and refetch logic
- Optimistic updates

**Example:**
```typescript
function useAdmissions(filters?: Filters) {
  const [data, setData] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await admissionsService.list(filters);
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

  return { data, loading, error };
}
```

---

### 4. Form State Pattern

**Purpose:** Manage form data and validation.

**Implementation:**
- Controlled components
- Form validation
- Error handling
- Submit handling

**Example:**
```typescript
function AdmissionForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit
    await admissionsService.create(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 🧩 Component Patterns

### 1. Controlled Components

**Purpose:** React controls component value via state.

**Implementation:**
- Value controlled by state
- onChange updates state
- Single source of truth

**Example:**
```typescript
function ControlledInput() {
  const [value, setValue] = useState('');
  
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

---

### 2. Uncontrolled Components

**Purpose:** Component manages its own state via refs.

**Implementation:**
- Use refs for values
- Less React overhead
- Use when appropriate

**Example:**
```typescript
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = () => {
    const value = inputRef.current?.value;
    // Use value
  };
  
  return <input ref={inputRef} />;
}
```

---

### 3. Presentational Components

**Purpose:** Pure components that only render UI.

**Implementation:**
- No state/logic
- Receive data via props
- Call callbacks for actions

**Example:**
```typescript
function AdmissionCard({ 
  admission, 
  onSave 
}: { 
  admission: Admission; 
  onSave: (id: string) => void;
}) {
  return (
    <div>
      <h3>{admission.title}</h3>
      <button onClick={() => onSave(admission.id)}>Save</button>
    </div>
  );
}
```

---

### 4. Container Components

**Purpose:** Components that handle data and logic.

**Implementation:**
- Fetch data
- Manage state
- Handle business logic
- Render presentational components

**Example:**
```typescript
function AdmissionsContainer() {
  const { admissions, loading, error } = useAdmissions();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <AdmissionsList admissions={admissions} />;
}
```

---

## 🌐 API Integration Patterns

### 1. Service Layer Pattern

**Purpose:** Abstract API calls from components.

**Implementation:**
- Service functions for each API endpoint
- Centralized error handling
- Type-safe API contracts
- Consistent response handling

**Example:**
```typescript
// Service Layer
export const admissionsService = {
  list: async (params?: ListParams) => {
    const response = await apiClient.get('/admissions', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await apiClient.get(`/admissions/${id}`);
    return response.data.data;
  },
};
```

---

### 2. API Client Pattern

**Purpose:** Centralized HTTP client configuration.

**Implementation:**
- Single axios instance
- Request/response interceptors
- Error handling
- Authentication headers

**Example:**
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors
    return Promise.reject(error);
  }
);
```

---

### 3. JWT Authentication Pattern

**Purpose:** Secure API authentication using JWT tokens with automatic user provisioning.

**Implementation:**
- Supabase Auth for JWT token generation (ES256 algorithm)
- Automatic JWT injection in API requests
- Auto-sync user provisioning in database
- Bidirectional role consistency between auth provider and database
- Automatic token refresh

**Architecture:**
```typescript
// JWT Token Structure (ES256)
interface JWTPayload {
  sub: string;              // Supabase User UUID
  email: string;
  user_metadata: {
    role: 'student' | 'university' | 'admin';
    university_id?: string;
    display_name?: string;
  };
  exp: number;              // Expiration timestamp
  iat: number;              // Issued at timestamp
  iss: string;              // Issuer (Supabase URL)
  aud: string;              // Audience ("authenticated")
}
```

**API Client with JWT:**
```typescript
// src/services/apiClient.ts
import { supabase } from './supabase';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor - Automatic JWT Token Injection
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get fresh JWT token from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token && config.headers) {
      // Attach JWT token to Authorization header
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
      
      if (import.meta.env.VITE_DEBUG_API === 'true') {
        console.log('🔐 [API] JWT token attached to request');
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - sign out user
      await supabase.auth.signOut();
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);
```

**Authentication Service Pattern:**
```typescript
// src/services/authService.ts
import { supabase } from './supabase';
import { apiClient } from './apiClient';

export const authService = {
  // Sign Up - Creates user in Supabase Auth + Database
  signUp: async (email: string, password: string, role: string) => {
    // Step 1: Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,  // Stored in JWT user_metadata
        },
      },
    });
    
    if (error) throw error;
    
    // Step 2: Create user in application database
    // (Backend auto-creates via JWT middleware if missing)
    
    return data;
  },
  
  // Sign In - Authenticates and gets JWT token
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // JWT token automatically stored in localStorage by Supabase
    return data;
  },
  
  // Get Current User - Fetches user details from database
  getCurrentUser: async () => {
    // JWT already attached by interceptor
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },
  
  // Sign Out
  signOut: async () => {
    await supabase.auth.signOut();
  },
};
```

**Auth Context with JWT:**
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // User signed in - fetch full user details
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          setUser(null);
        }
      } else {
        // User signed out
        setUser(null);
      }
      setIsLoading(false);
    });
  }, []);
  
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.signIn(email, password);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      // Navigate based on role
      const dashboard = `/${userData.role}/dashboard`;
      navigate(dashboard);
    } finally {
      setIsLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string, role: string) => {
    await authService.signUp(email, password, role);
    // Show "Check email" message
    navigate('/signin');
  };
  
  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    navigate('/signin');
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Protected Route Pattern:**
```typescript
// src/Router/ProtectedRoute.tsx
function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: ReactNode;
  allowedRoles: string[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
}

// Usage in router
<Route
  path="/student/dashboard"
  element={
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDashboard />
    </ProtectedRoute>
  }
/>
```

**Key Patterns:**
1. **Automatic Token Injection:** JWT automatically attached to all API requests
2. **Auto-Sync Users:** Backend creates missing users on first authenticated request
3. **Role Consistency:** Role synced from Supabase Auth (source of truth) to database
4. **Token Refresh:** Automatic token refresh handled by Supabase client
5. **Graceful Expiry:** 401 errors trigger automatic sign-out and redirect
6. **Database ID Mapping:** JWT contains Supabase UUID, backend returns database ID

**Benefits:**
- ✅ Secure authentication with industry-standard ES256 algorithm
- ✅ No orphan users (auto-sync prevents database inconsistencies)
- ✅ Foreign key constraints always satisfied
- ✅ Automatic token injection (no manual header management)
- ✅ Bidirectional role sync between auth provider and database
- ✅ Graceful token expiry handling

**Complete Documentation:** See [AUTHENTICATION_ARCHITECTURE.md](../AUTHENTICATION_ARCHITECTURE.md)

---

### 4. Optimistic Update Pattern

**Purpose:** Update UI immediately, rollback on error.

**Implementation:**
- Update state optimistically
- Make API call
- Rollback on error
- Show success/error feedback

**Example:**
```typescript
function useToggleSaved() {
  const [saved, setSaved] = useState(false);
  
  const toggle = async (id: string) => {
    // Optimistic update
    const previousSaved = saved;
    setSaved(!saved);
    
    try {
      await watchlistsService.add(id);
    } catch (error) {
      // Rollback on error
      setSaved(previousSaved);
      toast.error('Failed to save');
    }
  };
  
  return { saved, toggle };
}
```

---

### 4. Pagination Pattern

**Purpose:** Handle paginated API responses.

**Implementation:**
- Track current page
- Load more/next page
- Handle pagination metadata
- Infinite scroll or page buttons

**Example:**
```typescript
function usePaginatedAdmissions() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Admission[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  
  useEffect(() => {
    admissionsService.list({ page }).then((response) => {
      setData(response.data);
      setPagination(response.pagination);
    });
  }, [page]);
  
  const nextPage = () => {
    if (pagination?.hasNext) {
      setPage(page + 1);
    }
  };
  
  return { data, pagination, nextPage, setPage };
}
```

---

## ⚠️ Error Handling Patterns

### 1. Error Boundary Pattern

**Purpose:** Catch React errors and display fallback UI.

**Implementation:**
- Error boundary component
- Catch errors in component tree
- Display error UI
- Log errors

**Example:**
```typescript
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage />;
    }

    return this.props.children;
  }
}
```

---

### 2. Try-Catch in Async Functions

**Purpose:** Handle errors in async operations.

**Implementation:**
- Try-catch blocks
- Error state management
- User-friendly error messages
- Error logging

**Example:**
```typescript
async function handleSubmit() {
  try {
    setLoading(true);
    setError(null);
    await admissionsService.create(formData);
    toast.success('Created successfully');
  } catch (err) {
    setError('Failed to create admission');
    console.error(err);
  } finally {
    setLoading(false);
  }
}
```

---

### 3. Error State Pattern

**Purpose:** Manage error state in components.

**Implementation:**
- Error state in hooks/components
- Display error UI
- Retry functionality
- Clear errors

**Example:**
```typescript
function useAdmissions() {
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    try {
      setError(null);
      // Fetch data
    } catch (err) {
      setError('Failed to fetch');
    }
  };
  
  return { error, retry: fetchData };
}
```

---

## ⚡ Performance Patterns

### 1. Memoization Pattern

**Purpose:** Cache expensive computations.

**Implementation:**
- `useMemo` for computed values
- `useCallback` for functions
- `React.memo` for components
- Avoid unnecessary re-renders

**Example:**
```typescript
function ExpensiveComponent({ items }: { items: Item[] }) {
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);
  
  const handleClick = useCallback((id: string) => {
    // Handle click
  }, []);
  
  return (
    <div>
      {sortedItems.map(item => (
        <MemoizedItem 
          key={item.id} 
          item={item} 
          onClick={handleClick}
        />
      ))}
    </div>
  );
}

const MemoizedItem = React.memo(function Item({ item, onClick }) {
  return <div onClick={() => onClick(item.id)}>{item.name}</div>;
});
```

---

### 2. Code Splitting Pattern

**Purpose:** Load code only when needed.

**Implementation:**
- Lazy load components
- Route-based code splitting
- Dynamic imports
- React.lazy and Suspense

**Example:**
```typescript
// Lazy load component
const StudentDashboard = React.lazy(() => import('./pages/student/StudentDashboard'));

// Use with Suspense
function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
      </Routes>
    </Suspense>
  );
}
```

---

### 3. Virtualization Pattern

**Purpose:** Render only visible items in long lists.

**Implementation:**
- Use libraries like `react-window`
- Virtual scrolling
- Render only visible items
- Improve performance for large lists

**Example:**
```typescript
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }: { items: Admission[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={100}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <AdmissionCard admission={items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

---

### 4. Debouncing Pattern

**Purpose:** Limit function execution frequency.

**Implementation:**
- Debounce search inputs
- Debounce API calls
- Use debounce utility
- Improve performance

**Example:**
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery) {
      // Search API call
    }
  }, [debouncedQuery]);
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

---

## ✅ Code Quality Practices

### 1. TypeScript Strict Mode

**Implementation:**
- Enable strict mode
- No implicit any
- Strict null checks
- Type safety everywhere

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

### 2. Meaningful Names

**Implementation:**
- Descriptive variable names
- Clear function names
- Self-documenting code
- Consistent naming

**Example:**
```typescript
// ✅ Good
const admissionId = '123';
const getUserAdmissions = async (userId: string) => { };
const isAdmissionSaved = (id: string) => { };

// ❌ Bad
const aId = '123';
const get = async (id: string) => { };
const check = (id: string) => { };
```

---

### 3. Small Components

**Implementation:**
- Single responsibility
- Max 200 lines (guideline)
- Clear purpose
- Composable

**Example:**
```typescript
// ✅ Good: Small, focused component
function AdmissionTitle({ title }: { title: string }) {
  return <h2>{title}</h2>;
}

// ❌ Bad: Large, complex component
function AdmissionCard({ admission }) {
  // 500+ lines of code
  // Multiple responsibilities
}
```

---

### 4. Comments & Documentation

**Implementation:**
- JSDoc comments for functions
- Explain why, not what
- Complex logic documentation
- Component prop documentation

**Example:**
```typescript
/**
 * Fetches admissions with optional filters
 * 
 * @param filters - Optional filters for admissions
 * @returns Object containing admissions, loading state, and error
 * 
 * @example
 * const { admissions, loading, error } = useAdmissions({ 
 *   verification_status: 'verified' 
 * });
 */
export function useAdmissions(filters?: AdmissionFilters) {
  // Implementation
}
```

---

### 5. Constants Over Magic Values

**Implementation:**
- No magic numbers/strings
- Centralized constants
- Named constants
- Configuration values

**Example:**
```typescript
// ✅ Good
const DEFAULT_PAGE_SIZE = 20;
const MAX_SEARCH_RESULTS = 100;
const DEBOUNCE_DELAY = 300;

// ❌ Bad
const limit = 20;
const max = 100;
setTimeout(() => {}, 300);
```

---

## 📛 Naming Conventions

### Components
- **PascalCase**: `AdmissionCard`, `StudentDashboard`

### Hooks
- **camelCase** with `use` prefix: `useAdmissions`, `useStudentData`

### Functions & Variables
- **camelCase**: `getAdmissionById`, `admissionId`

### Constants
- **UPPER_SNAKE_CASE**: `DEFAULT_PAGE_SIZE`, `MAX_RETRY_ATTEMPTS`

### Files
- **PascalCase** for components: `AdmissionCard.tsx`
- **camelCase** for utilities: `dateUtils.ts`
- **kebab-case** for pages: `student-dashboard.tsx` (optional)

### Types & Interfaces
- **PascalCase**: `Admission`, `StudentDataContextValue`

### CSS Classes
- **kebab-case**: `admission-card`, `btn-primary`

---

## 📚 Documentation Practices

### 1. Component Documentation

**JSDoc Comments:**
```typescript
/**
 * AdmissionCard component displays admission information
 * 
 * @param admission - Admission data to display
 * @param onSave - Callback when save button is clicked
 * @param onCompare - Optional callback for compare action
 * 
 * @example
 * <AdmissionCard 
 *   admission={admission} 
 *   onSave={(id) => handleSave(id)}
 * />
 */
export function AdmissionCard({ 
  admission, 
  onSave,
  onCompare 
}: AdmissionCardProps) {
  // Implementation
}
```

---

### 2. Hook Documentation

**JSDoc Comments:**
```typescript
/**
 * Custom hook to fetch and manage admissions
 * 
 * @param filters - Optional filters for admissions list
 * @returns Object containing:
 *   - admissions: Array of admission records
 *   - loading: Loading state
 *   - error: Error message if any
 *   - refetch: Function to refetch data
 * 
 * @example
 * const { admissions, loading, error } = useAdmissions({
 *   verification_status: 'verified'
 * });
 */
export function useAdmissions(filters?: AdmissionFilters) {
  // Implementation
}
```

---

### 3. Service Documentation

**JSDoc Comments:**
```typescript
/**
 * Admissions API service
 * 
 * Provides methods to interact with admissions endpoints
 */
export const admissionsService = {
  /**
   * List admissions with optional filters and pagination
   * 
   * @param params - Query parameters (page, limit, filters)
   * @returns Paginated response with admissions array
   * 
   * @example
   * const response = await admissionsService.list({
   *   page: 1,
   *   limit: 20,
   *   verification_status: 'verified'
   * });
   */
  list: async (params?: ListParams) => {
    // Implementation
  },
};
```

---

### 4. README Documentation

**Project README:**
- Setup instructions
- Development guide
- Project structure
- Available scripts
- Contributing guidelines

---

## 🎯 Summary

### Architecture Patterns
- ✅ Component-Based Architecture
- ✅ Container/Presentational Pattern
- ✅ Feature-Based Architecture
- ✅ Layered Architecture

### Design Patterns
- ✅ Custom Hooks Pattern
- ✅ Context Pattern
- ✅ Higher-Order Component Pattern
- ✅ Render Props Pattern
- ✅ Compound Components Pattern
- ✅ Provider Pattern
- ✅ Service Layer Pattern
- ✅ Factory Pattern

### Principles
- ✅ SOLID Principles (Frontend)
- ✅ DRY (Don't Repeat Yourself)
- ✅ KISS (Keep It Simple)
- ✅ YAGNI (You Aren't Gonna Need It)
- ✅ Fail Fast
- ✅ Principle of Least Surprise

### Best Practices
- ✅ TypeScript strict mode
- ✅ Meaningful naming
- ✅ Small components
- ✅ Comprehensive comments
- ✅ Constants over magic values
- ✅ Consistent code style
- ✅ Error handling
- ✅ Performance optimization
- ✅ Code splitting
- ✅ Memoization

---

**Last Updated:** January 18, 2026  
**Status:** Active Reference Document  
**Maintained By:** Frontend Development Team
