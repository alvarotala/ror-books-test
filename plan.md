# Library Management System - Implementation Plan

## Project Overview
A comprehensive library management system built with Ruby on Rails backend and React frontend, featuring user authentication, book management, borrowing system, and role-based dashboards.

## User Story
*"As a library member, I want to easily search for and borrow books, so that I can access reading materials without hassle. As a librarian, I want to efficiently manage the book inventory and track borrowing activities, so that I can maintain an organized library system."*

## Technical Architecture

### Backend (Ruby on Rails)
- **Framework**: Ruby on Rails 7.x (standard app, JSON controllers)
- **Database**: PostgreSQL
- **Authentication**: Devise (session-based cookies)
- **Testing**: RSpec with FactoryBot
- **API**: RESTful JSON with proper status codes; CSRF enabled
- **CORS**: rack-cors configured for credentialed requests

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **State Management**: React Context + useReducer
- **Styling**: Tailwind CSS for responsive design
- **HTTP Client**: Axios for API communication (global withCredentials: true)
- **Routing**: React Router for navigation

## Database Schema Design

### Users Table
```sql
- id (primary key)
- email (unique)
- encrypted_password
- role (enum: 'librarian', 'member')
- first_name
- last_name
- created_at
- updated_at
```

### Books Table
```sql
- id (primary key)
- title
- author
- genre
- isbn (unique)
- total_copies
- created_at
- updated_at
```
Note: available_copies will be computed at runtime as total_copies minus active borrowings.

### Borrowings Table
```sql
- id (primary key)
- user_id (foreign key)
- book_id (foreign key)
- borrowed_at
- due_date (borrowed_at + 14 days)
- returned_at (nullable)
- status (enum: 'borrowed', 'returned', 'overdue')
- created_at
- updated_at
```

## Implementation Phases (fast track)

### Phase 1: Scaffolding & Auth (Day 1)
1. Create Dockerfile and docker-compose for Rails web server, PostgreSQL, and required services
2. Initialize Rails app (run via Docker), configure PostgreSQL
3. Add RSpec, FactoryBot
4. Install Devise with session-based auth
5. Seed demo users (librarian, member) and roles

### Phase 2: Core Domain & APIs (Day 2)
1. Models: User, Book, Borrowing; validations and associations
2. Controllers: Books (CRUD, librarian-only), Borrowings (borrow/return)
3. Search: simple ILIKE by title/author/genre
4. Dashboards: minimal counts/lists for each role

### Phase 3: Frontend MVP (Day 3)
1. React app (Vite+TS), Tailwind, Router
2. Auth pages with cookies; Axios withCredentials
3. Books list/search CRUD, borrow/return
4. Minimal dashboards

### Phase 4: Tests, Polish, Docs (Day 4)
1. RSpec: models and request specs for main flows
2. UX polish: error/loading states
3. README and seeded credentials

## Key Features Implementation

### Authentication & Authorization
- **Devise (sessions)**: Registration, login, logout via cookie sessions
- **Role-Based Access**: Librarian vs Member permissions via controller before_actions
- **CSRF**: Enabled; frontend reads CSRF token and sends it back
- **CORS**: Allow frontend origin with credentials

### Book Management
- **CRUD Operations**: Full book lifecycle management
- **Search Functionality**: Simple ILIKE search (title, author, genre) with DB indexes
- **Inventory Tracking**: Available vs total copies
- **Validation**: ISBN uniqueness, required fields

### Borrowing System
- **Business Logic**: 2-week borrowing period
- **Duplicate Prevention**: Users can't borrow same book twice
- **Overdue Tracking**: Automatic status updates
- **Return Processing**: Librarian-managed returns

### Dashboard System
- **Librarian Dashboard**:
  - Total books count
  - Currently borrowed books
  - Books due today
  - Members with overdue books
- **Member Dashboard**:
  - Personal borrowing history
  - Current borrowings with due dates
  - Overdue book notifications

## Testing Strategy

### Backend Testing (RSpec)
- **Model Specs**: Validations, associations, business logic
- **Controller Specs**: API endpoint behavior
- **Request Specs**: Full request/response cycle
- **Integration Specs**: User workflow testing

### Frontend Testing
- **Component Testing**: Individual component behavior
- **Integration Testing**: Component interaction
- **E2E Testing**: Full user workflows

## Security Considerations (right-sized)

- **Strong Parameters**: Permit lists on controllers
- **CSRF**: Rails default session protection
- **CORS**: Restrict origins and allow credentials
- **DB Indexes**: On search fields and foreign keys

## Performance Notes (minimal but effective)

- **Database Indexing**: Index isbn, title, author, genre; foreign keys
- **Query Optimization**: Avoid N+1 with includes
- **Computed Availability**: Calculate on the fly

## Deployment & DevOps (lightweight)

- **Environments**: Development; optional single production instance (Render/Heroku)
- **Migrations**: Standard Rails workflow
- **ENV Vars**: Basic secrets via platform or dotenv

## Success Criteria

- [ ] All backend requirements implemented and tested
- [ ] Frontend provides responsive, user-friendly interface
- [ ] Complete test coverage with RSpec
- [ ] No console warnings or errors
- [ ] Clean architecture principles followed
- [ ] Comprehensive documentation provided
- [ ] Demo data and credentials available
- [ ] API follows RESTful conventions
- [ ] Role-based access control working correctly
- [ ] Borrowing system handles edge cases properly

## Risk Mitigation

- **Scope Creep**: Strict adherence to requirements
- **Technical Debt**: Regular code reviews and refactoring
- **Testing Gaps**: Continuous testing throughout development
- **Performance Issues**: Early performance testing and optimization

## Timeline Summary
- **Days 1-2**: Backend foundation and core APIs
- **Day 3**: Frontend MVP and integration
- **Day 4**: Tests, polish, docs, demo prep

This plan ensures a systematic approach to building a robust, well-tested, and user-friendly library management system that meets all specified requirements while maintaining clean architecture principles.
