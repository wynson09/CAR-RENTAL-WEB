# Nacs Car Rental - Authentication Workflow

This document outlines the complete authentication flow for the Nacs Car Rental Web application, including Firebase integration, NextAuth.js, and Zustand state management.

## Complete Authentication Flow

```mermaid
flowchart TB
    subgraph "User Interface Layer"
        A[User enters email & password]
        B[User clicks Sign In]
        C[User clicks OAuth button<br/>Google/Facebook/GitHub]
        D[User fills registration form<br/>First Name, Last Name, Email, Password]
        E[User clicks Register]
    end

    subgraph "NextAuth.js Flow"
        F[NextAuth signIn function]
        G{Credentials or OAuth?}
        H[Credentials Provider]
        I[OAuth Provider<br/>Google/Facebook/GitHub]
    end

    subgraph "Firebase Authentication"
        J[signInWithEmailAndPassword]
        K[OAuth Authentication via Provider]
        L[createUserWithEmailAndPassword]
        M{Authentication Successful?}
    end

    subgraph "Data Synchronization"
        N[syncUserToFirestore function]
        O{User exists in Firestore?}
        P[Create new user document]
        Q[Update existing user document]
        R[Clean undefined fields]
    end

    subgraph "State Management (Zustand)"
        S[useAuth hook detects session]
        T[fetchUserData from Firestore]
        U[setUser in Zustand store]
        V[Persist to localStorage]
        W[User data available globally]
    end

    subgraph "Session Management"
        X[Create JWT token]
        Y[Set session cookie]
        Z[Redirect to dashboard]
    end

    subgraph "Error Handling"
        AA[Display error message]
        BB[setLoading false]
        CC[Clear user state]
    end

    %% User Registration Flow
    D --> E
    E --> L
    L --> M

    %% User Login Flow
    A --> B
    B --> F
    C --> F

    F --> G
    G -->|Credentials| H
    G -->|OAuth| I

    H --> J
    I --> K

    J --> M
    K --> M

    %% Success Flow
    M -->|Yes| N
    N --> O
    O -->|No| P
    O -->|Yes| Q
    P --> R
    Q --> R
    R --> S
    S --> T
    T --> U
    U --> V
    V --> W
    W --> X
    X --> Y
    Y --> Z

    %% Error Flow
    M -->|No| AA
    AA --> BB
    BB --> CC
    CC --> A

    %% Styling
    classDef userAction fill:#e1f5fe
    classDef nextauth fill:#f3e5f5
    classDef firebase fill:#fff3e0
    classDef dataSync fill:#e8f5e8
    classDef stateManagement fill:#fce4ec
    classDef session fill:#f1f8e9
    classDef error fill:#ffebee

    class A,B,C,D,E userAction
    class F,G,H,I nextauth
    class J,K,L,M firebase
    class N,O,P,Q,R dataSync
    class S,T,U,V,W stateManagement
    class X,Y,Z session
    class AA,BB,CC error
```

## User Data Structure

```mermaid
erDiagram
    USER {
        string uid PK
        string firstName
        string lastName
        string name
        string email
        string image
        string role
        string[] userViolation
        boolean isVerified
        string provider
        Date createdAt
        Date updatedAt
    }

    KYC_RECORD {
        string birthDate
        string gender
        string nationality
        string address
        string city
        string state
        string zipCode
        string phoneNumber
        string governmentId
        string governmentIdType
        string governmentIdFrontImage
        string governmentIdBackImage
        string status
        string statusMessage
        Date createdAt
        Date updatedAt
    }

    USER ||--|| KYC_RECORD : contains
```

## State Management Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Login Form
    participant NA as NextAuth
    participant FB as Firebase Auth
    participant FS as Firestore
    participant UH as useAuth Hook
    participant ZS as Zustand Store
    participant LS as localStorage

    U->>UI: Enter credentials
    UI->>NA: signIn()
    NA->>FB: Authenticate user
    FB-->>NA: User credentials
    NA->>FS: Sync user data
    FS-->>NA: User document saved
    NA-->>UI: Authentication success

    Note over UH: Detects session change
    UH->>FS: fetchUserData()
    FS-->>UH: Complete user data
    UH->>ZS: setUser()
    ZS->>LS: Persist user data
    ZS-->>UH: User state updated

    Note over U: User data available globally
```

## Key Components

### 🔐 Authentication Providers

- **Email/Password**: Firebase Auth with custom credentials
- **Google OAuth**: NextAuth.js Google provider
- **Facebook OAuth**: NextAuth.js Facebook provider
- **GitHub OAuth**: NextAuth.js GitHub provider

### 📊 State Management

- **Zustand Store**: Global user state with persistence
- **useAuth Hook**: Automatic session detection and data loading
- **localStorage**: Persistent user data across sessions

### 🔄 Data Flow

1. User authenticates through any provider
2. NextAuth.js handles authentication flow
3. Firebase stores user credentials
4. Firestore synchronizes user profile data
5. useAuth hook detects session changes
6. Zustand store fetches and persists user data
7. User data available throughout the application

### 🛡️ Security Features

- JWT-based sessions
- Firebase Authentication security
- Firestore security rules
- Automatic session cleanup on signout
- Undefined value sanitization

## Testing

Visit `/test-firebase` to test the complete authentication flow and verify:

- ✅ NextAuth session management
- ✅ Firebase authentication
- ✅ Firestore data synchronization
- ✅ Zustand state management
- ✅ localStorage persistence
