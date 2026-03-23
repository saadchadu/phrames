# Support Ticket System - Complete Implementation Guide

## Overview
This is a comprehensive guide to implementing a full-featured support ticket system based on the analyzed codebase. The system includes user ticket submission, ticket tracking, admin management, and real-time status updates.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Backend API Routes](#backend-api-routes)
4. [Frontend Components](#frontend-components)
5. [Features & Functionality](#features--functionality)
6. [Implementation Steps](#implementation-steps)
7. [Security Considerations](#security-considerations)

---

## System Architecture

### Tech Stack Used
- **Frontend**: Next.js 14+ (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes (Server-side)
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth with JWT tokens
- **UI Components**: Headless UI, Heroicons

### Architecture Pattern
- **Client-Server Model**: React components communicate with API routes
- **Role-Based Access Control (RBAC)**: Separate user and admin interfaces
- **RESTful API Design**: Standard HTTP methods (GET, POST, PATCH, DELETE)

---

## Database Schema

### Collection: `support_tickets`

```typescript
interface SupportTicket {
  // Unique identifiers
  id: string;                    // Firestore document ID
  ticketId: string;              // Human-readable ticket ID (e.g., "TKT-1234567890-ABC123")
  
  // User information
  name: string;                  // Ticket creator's name
  email: string;                 // Ticket creator's email (used for querying user's tickets)
  
  // Ticket details
  category: 'general' | 'payment' | 'refund' | 'campaign' | 'technical' | 'other';
  subject: string;               // Brief description
  message: string;               // Detailed message
  
  // Optional references
  orderId?: string;              // Related order/payment ID
  campaignId?: string;           // Related campaign ID
  
  // Status tracking
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  
  // Timestamps
  createdAt: string;             // ISO 8601 format
  updatedAt: string;             // ISO 8601 format
  cancelledAt?: string;          // When user cancelled (if applicable)
  cancelledBy?: 'user' | 'admin'; // Who cancelled the ticket
  
  // Admin notes/updates
  notes: Array<{
    text: string;                // Note content
    addedBy: string;             // Admin email who added the note
    addedAt: string;             // ISO 8601 timestamp
  }>;
}
```

### Firestore Indexes Required
```javascript
// Composite indexes needed for queries:
// 1. email (Ascending) + createdAt (Descending)
// 2. status (Ascending) + createdAt (Descending)
// 3. category (Ascending) + createdAt (Descending)
// 4. status (Ascending) + category (Ascending) + createdAt (Descending)
```

---

## Backend API Routes

### 1. Submit Ticket (Public)
**Endpoint**: `POST /api/support/submit`

**Purpose**: Create a new support ticket (no authentication required)

**Request Body**:
```typescript
{
  name: string;          // Required
  email: string;         // Required
  category: string;      // Required
  subject: string;       // Required
  message: string;       // Required
  orderId?: string;      // Optional
  campaignId?: string;   // Optional
}
```

**Response**:
```typescript
{
  success: true,
  ticketId: "TKT-1234567890-ABC123",
  message: "Ticket submitted successfully"
}
```

**Implementation Details**:
- Generates unique ticket ID: `TKT-{timestamp}-{random}`
- Sets initial status to 'open'
- No authentication required (public endpoint)
- Validates required fields

---

### 2. Get User's Tickets (Authenticated)
**Endpoint**: `GET /api/support/my-tickets`

**Purpose**: Fetch all tickets for the authenticated user

**Headers**:
```
Authorization: Bearer {firebase-jwt-token}
```

**Response**:
```typescript
{
  tickets: SupportTicket[]
}
```

**Implementation Details**:
- Verifies Firebase JWT token
- Queries tickets by user's email
- Returns tickets sorted by creation date (newest first)
- Limit: 50 tickets

---

### 3. Cancel Ticket (Authenticated User)
**Endpoint**: `POST /api/support/cancel`

**Purpose**: Allow users to cancel their own tickets

**Headers**:
```
Authorization: Bearer {firebase-jwt-token}
```

**Request Body**:
```typescript
{
  ticketId: string
}
```

**Response**:
```typescript
{
  success: true,
  message: "Ticket cancelled successfully"
}
```

**Implementation Details**:
- Verifies ticket belongs to authenticated user
- Only allows cancelling 'open' or 'in_progress' tickets
- Updates status to 'closed'
- Adds cancellation metadata

---

### 4. Admin: Get All Tickets (Admin Only)
**Endpoint**: `GET /api/admin/support?status={status}&category={category}`

**Purpose**: Fetch all tickets with optional filters

**Headers**:
```
Authorization: Bearer {firebase-jwt-token-with-admin-claim}
```

**Query Parameters**:
- `status`: Filter by status (optional)
- `category`: Filter by category (optional)

**Response**:
```typescript
{
  tickets: SupportTicket[]
}
```

**Implementation Details**:
- Verifies admin claim in JWT token
- Supports filtering by status and category
- Returns up to 100 tickets
- Sorted by creation date (newest first)

---

### 5. Admin: Update Ticket (Admin Only)
**Endpoint**: `PATCH /api/admin/support`

**Purpose**: Update ticket status or add admin notes

**Headers**:
```
Authorization: Bearer {firebase-jwt-token-with-admin-claim}
```

**Request Body**:
```typescript
{
  ticketId: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  note?: string;  // Admin note visible to user
}
```

**Response**:
```typescript
{
  success: true
}
```

**Implementation Details**:
- Verifies admin claim
- Can update status independently
- Can add notes (appended to notes array)
- Updates `updatedAt` timestamp

---

### 6. Admin: Delete Ticket (Admin Only)
**Endpoint**: `DELETE /api/admin/support`

**Purpose**: Permanently delete a ticket

**Headers**:
```
Authorization: Bearer {firebase-jwt-token-with-admin-claim}
```

**Request Body**:
```typescript
{
  ticketId: string
}
```

**Response**:
```typescript
{
  success: true,
  message: "Ticket deleted successfully"
}
```

---

### 7. Admin: Get Ticket Count (Admin Only)
**Endpoint**: `GET /api/admin/support/count`

**Purpose**: Get count of pending tickets (open + in_progress)

**Headers**:
```
Authorization: Bearer {firebase-jwt-token-with-admin-claim}
```

**Response**:
```typescript
{
  success: true,
  count: 15,
  breakdown: {
    open: 10,
    inProgress: 5
  }
}
```

---

## Frontend Components

### 1. SupportModal Component
**File**: `components/SupportModal.tsx`

**Purpose**: Modal dialog for submitting new tickets

**Props**:
```typescript
interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;    // Pre-fill email if user is logged in
  userName?: string;     // Pre-fill name if user is logged in
}
```

**Features**:
- Form validation
- Category selection dropdown
- Optional order/campaign ID fields
- Loading states during submission
- Success/error toast notifications
- Auto-resets form after submission

**Usage**:
```tsx
<SupportModal
  isOpen={showSupport}
  onClose={() => setShowSupport(false)}
  userEmail={user?.email}
  userName={user?.displayName}
/>
```

---

### 2. SupportHub Component
**File**: `components/SupportHub.tsx`

**Purpose**: Comprehensive support interface with ticket list, creation, and details

**Props**:
```typescript
interface SupportHubProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}
```

**Features**:
- **Three Views**:
  1. List View: Shows all user's tickets
  2. Create View: Form to create new ticket
  3. Detail View: Shows ticket details and updates
- Ticket cancellation
- Real-time status display
- Admin notes/updates visible to users
- Responsive design (mobile-friendly)

---

### 3. User Dashboard - My Tickets Page
**File**: `app/dashboard/support/page.tsx`

**Purpose**: Full-page view of user's support tickets

**Features**:
- Two-column layout (list + details)
- Ticket filtering by status
- Relative time display ("2 hours ago")
- Status badges with color coding
- Sticky detail panel on desktop
- Mobile-responsive (single column on mobile)

**Authentication**: Protected by `AuthGuard` component

---

### 4. Admin Support Management Page
**File**: `app/admin/support/page.tsx`

**Purpose**: Admin interface for managing all support tickets

**Features**:
- **Filtering**:
  - By status (all, open, in_progress, resolved, closed)
  - By category (all, general, payment, refund, campaign, technical, other)
- **Ticket Management**:
  - Update status via dropdown
  - Add internal notes (visible to users)
  - Delete tickets with confirmation
  - Refresh button
- **Two-Column Layout**:
  - Left: Ticket list with filters
  - Right: Selected ticket details
- **Ticket Details Display**:
  - User information
  - Category and timestamps
  - Original message
  - All admin notes with timestamps
  - Add note textarea

**Authorization**: Requires admin claim in Firebase token

---

## Features & Functionality

### Core Features

#### 1. Ticket Creation
- **Public Access**: Anyone can submit a ticket (no login required)
- **Pre-filled Data**: Logged-in users have name/email auto-filled
- **Rich Context**: Can attach order IDs and campaign IDs
- **Categories**: 6 predefined categories for better organization
- **Unique ID Generation**: Format `TKT-{timestamp}-{random}`

#### 2. Ticket Tracking
- **User View**: Users can see all their tickets by email
- **Status Badges**: Visual indicators for ticket status
- **Timeline**: Relative timestamps ("2 hours ago")
- **Updates**: Admin notes are visible to users

#### 3. Status Workflow
```
open → in_progress → resolved → closed
  ↓
closed (user cancelled)
```

**Status Definitions**:
- `open`: New ticket, awaiting admin review
- `in_progress`: Admin is working on it
- `resolved`: Issue resolved, awaiting user confirmation
- `closed`: Ticket completed or cancelled

#### 4. Admin Management
- **Bulk View**: See all tickets across all users
- **Filtering**: By status and category
- **Status Updates**: Change ticket status
- **Notes System**: Add internal notes visible to users
- **Delete**: Permanently remove tickets
- **Count Badge**: Shows pending tickets count

#### 5. User Actions
- **View Tickets**: See all personal tickets
- **Create Tickets**: Submit new support requests
- **Cancel Tickets**: Close own tickets (only open/in_progress)
- **Read Updates**: View admin responses

### UI/UX Features

#### Design Patterns
- **Modal Dialogs**: For quick ticket submission
- **Full-Page Views**: For detailed ticket management
- **Two-Column Layout**: List + detail view
- **Responsive Design**: Mobile-first approach
- **Loading States**: Spinners during async operations
- **Toast Notifications**: Success/error feedback

#### Color Coding
```typescript
Status Colors:
- open: Blue (bg-blue-100 text-blue-800)
- in_progress: Yellow (bg-yellow-100 text-yellow-800)
- resolved: Green (bg-green-100 text-green-800)
- closed: Gray (bg-gray-100 text-gray-800)
```

#### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus states
- Screen reader friendly

---

## Implementation Steps

### Step 1: Database Setup

```javascript
// Firebase Firestore setup
// 1. Create collection: support_tickets
// 2. Add composite indexes:

// Index 1: For user queries
{
  collectionGroup: "support_tickets",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "email", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// Index 2: For admin status filtering
{
  collectionGroup: "support_tickets",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// Index 3: For admin category filtering
{
  collectionGroup: "support_tickets",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "category", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}
```

### Step 2: Backend Implementation

**File Structure**:
```
app/api/
├── support/
│   ├── submit/
│   │   └── route.ts          # Public ticket submission
│   ├── my-tickets/
│   │   └── route.ts          # User's tickets
│   └── cancel/
│       └── route.ts          # Cancel ticket
└── admin/
    └── support/
        ├── route.ts          # Admin CRUD operations
        └── count/
            └── route.ts      # Ticket count
```

**Key Implementation Points**:

1. **Authentication Middleware**:
```typescript
// Verify Firebase token
const authHeader = request.headers.get('authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const token = authHeader.split('Bearer ')[1];
const decodedToken = await adminAuth.verifyIdToken(token);
```

2. **Admin Authorization**:
```typescript
// Check admin claim
if (decodedToken.isAdmin !== true) {
  return NextResponse.json(
    { error: 'Forbidden - Admin access required' }, 
    { status: 403 }
  );
}
```

3. **Ticket ID Generation**:
```typescript
const ticketId = `TKT-${Date.now()}-${Math.random()
  .toString(36)
  .substr(2, 9)
  .toUpperCase()}`;
```

### Step 3: Frontend Components

**Install Dependencies**:
```bash
npm install @headlessui/react @heroicons/react
```

**Component Hierarchy**:
```
App
├── SupportModal (Quick ticket submission)
├── SupportHub (Comprehensive ticket management)
├── Dashboard
│   └── Support Page (User's tickets)
└── Admin
    └── Support Page (All tickets management)
```

### Step 4: State Management

**Local State Pattern** (used in this implementation):
```typescript
const [tickets, setTickets] = useState<Ticket[]>([]);
const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
const [loading, setLoading] = useState(true);
const [statusFilter, setStatusFilter] = useState('all');
```

**Alternative**: Could use React Context, Redux, or Zustand for global state

### Step 5: API Integration

**Fetch Pattern**:
```typescript
const fetchTickets = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return;
    
    const token = await user.getIdToken();
    const response = await fetch('/api/support/my-tickets', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    setTickets(data.tickets);
  } catch (error) {
    toast(error.message, 'error');
  }
};
```

### Step 6: Admin Setup

**Grant Admin Access**:
```typescript
// Set custom claim in Firebase
await adminAuth.setCustomUserClaims(userId, { isAdmin: true });
```

**Admin Route Protection**:
```typescript
// In admin layout or page
useEffect(() => {
  const checkAdmin = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }
    
    const token = await user.getIdTokenResult();
    if (!token.claims.isAdmin) {
      router.push('/');
    }
  };
  
  checkAdmin();
}, []);
```

---

## Security Considerations

### 1. Authentication & Authorization
- ✅ JWT token verification on all protected routes
- ✅ Admin claim verification for admin routes
- ✅ User can only access their own tickets (email-based)
- ✅ Ticket ownership verification before cancellation

### 2. Input Validation
```typescript
// Server-side validation
if (!name || !email || !category || !subject || !message) {
  return NextResponse.json(
    { error: 'Missing required fields' },
    { status: 400 }
  );
}

// Email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return NextResponse.json(
    { error: 'Invalid email format' },
    { status: 400 }
  );
}
```

### 3. Rate Limiting
**Recommended**: Implement rate limiting on ticket submission
```typescript
// Example with Redis or in-memory store
const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 tickets per window
});
```

### 4. Data Sanitization
```typescript
// Sanitize user input to prevent XSS
import DOMPurify from 'isomorphic-dompurify';

const sanitizedMessage = DOMPurify.sanitize(message);
```

### 5. CORS Configuration
```typescript
// In next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'your-domain.com' },
        ],
      },
    ];
  },
};
```

### 6. Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /support_tickets/{ticketId} {
      // Anyone can create tickets
      allow create: if true;
      
      // Users can read their own tickets
      allow read: if request.auth != null && 
                     resource.data.email == request.auth.token.email;
      
      // Only admins can update/delete
      allow update, delete: if request.auth != null && 
                               request.auth.token.isAdmin == true;
    }
  }
}
```

---

## Advanced Features (Optional Enhancements)

### 1. Email Notifications
```typescript
// Send email when ticket is created
import nodemailer from 'nodemailer';

const sendTicketConfirmation = async (ticket: SupportTicket) => {
  const transporter = nodemailer.createTransport({...});
  
  await transporter.sendMail({
    to: ticket.email,
    subject: `Ticket Created: ${ticket.ticketId}`,
    html: `Your support ticket has been created...`
  });
};
```

### 2. File Attachments
```typescript
// Add to ticket schema
interface SupportTicket {
  // ... existing fields
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
  }>;
}

// Upload to Firebase Storage
const uploadAttachment = async (file: File) => {
  const storageRef = ref(storage, `tickets/${ticketId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
```

### 3. Real-time Updates
```typescript
// Use Firestore real-time listeners
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'support_tickets')
      .where('email', '==', userEmail),
    (snapshot) => {
      const tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(tickets);
    }
  );
  
  return () => unsubscribe();
}, [userEmail]);
```

### 4. Search Functionality
```typescript
// Add search to admin panel
const searchTickets = async (query: string) => {
  // Note: Firestore doesn't support full-text search natively
  // Options:
  // 1. Use Algolia
  // 2. Use Firebase Extensions (Firestore Full-Text Search)
  // 3. Filter client-side for small datasets
  
  const filtered = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(query.toLowerCase()) ||
    ticket.ticketId.toLowerCase().includes(query.toLowerCase())
  );
  
  return filtered;
};
```

### 5. Priority Levels
```typescript
// Add priority field
interface SupportTicket {
  // ... existing fields
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Auto-assign priority based on category
const getPriority = (category: string): string => {
  switch (category) {
    case 'payment':
    case 'refund':
      return 'high';
    case 'technical':
      return 'medium';
    default:
      return 'low';
  }
};
```

### 6. SLA Tracking
```typescript
// Track response time
interface SupportTicket {
  // ... existing fields
  firstResponseAt?: string;
  resolvedAt?: string;
  slaBreached: boolean;
}

// Calculate SLA
const checkSLA = (ticket: SupportTicket) => {
  const created = new Date(ticket.createdAt);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  
  // Example: 24-hour SLA for first response
  return hoursSinceCreation > 24 && !ticket.firstResponseAt;
};
```

### 7. Canned Responses
```typescript
// Admin quick responses
const cannedResponses = [
  {
    id: 1,
    title: 'Payment Received',
    content: 'We have received your payment and it is being processed...'
  },
  {
    id: 2,
    title: 'Refund Initiated',
    content: 'Your refund has been initiated and will be processed within 5-7 business days...'
  }
];

// Use in admin panel
<select onChange={(e) => setNote(e.target.value)}>
  <option value="">Select canned response...</option>
  {cannedResponses.map(response => (
    <option key={response.id} value={response.content}>
      {response.title}
    </option>
  ))}
</select>
```

### 8. Analytics Dashboard
```typescript
// Track ticket metrics
interface TicketMetrics {
  totalTickets: number;
  openTickets: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  ticketsByCategory: Record<string, number>;
  ticketsByStatus: Record<string, number>;
}

// Calculate metrics
const calculateMetrics = (tickets: SupportTicket[]): TicketMetrics => {
  // Implementation...
};
```

---

## Testing

### Unit Tests Example
```typescript
// __tests__/api/support/submit.test.ts
import { POST } from '@/app/api/support/submit/route';

describe('POST /api/support/submit', () => {
  it('should create a ticket with valid data', async () => {
    const request = new Request('http://localhost/api/support/submit', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        category: 'general',
        subject: 'Test',
        message: 'Test message'
      })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.ticketId).toMatch(/^TKT-/);
  });
  
  it('should reject invalid data', async () => {
    const request = new Request('http://localhost/api/support/submit', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe'
        // Missing required fields
      })
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });
});
```

---

## Deployment Checklist

- [ ] Set up Firebase project
- [ ] Create Firestore collection and indexes
- [ ] Configure Firebase Admin SDK
- [ ] Set up authentication
- [ ] Grant admin claims to admin users
- [ ] Configure environment variables
- [ ] Set up Firestore security rules
- [ ] Test all API endpoints
- [ ] Test user flows (create, view, cancel)
- [ ] Test admin flows (view, update, delete)
- [ ] Implement rate limiting
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure email notifications (optional)
- [ ] Test responsive design
- [ ] Perform security audit
- [ ] Load testing
- [ ] Deploy to production

---

## Environment Variables

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

---

## Conclusion

This support ticket system provides a complete, production-ready solution with:
- ✅ User ticket submission and tracking
- ✅ Admin management interface
- ✅ Status workflow management
- ✅ Notes/updates system
- ✅ Role-based access control
- ✅ Responsive design
- ✅ Security best practices

The modular architecture makes it easy to extend with additional features like file attachments, real-time updates, email notifications, and more.
