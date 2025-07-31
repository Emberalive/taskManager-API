# Task Manager API

A RESTful API for managing tasks and user groups built with Node.js, Express.js, and PostgreSQL.

## Features

- User authentication (login/register)
- Task management (create, read, update, delete)
- Task completion tracking
- User profile management
- Group management
- CORS enabled for frontend integration

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Development**: Nodemon for hot reloading
- **Environment**: dotenv for configuration

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-manager-API
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your database configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
```

4. Set up your PostgreSQL database with the required tables for users, tasks, and groups.

## Usage

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon on port 7000.

### Production Mode
```bash
node index.js
```

The API will be available at `http://localhost:7000`

## API Endpoints

### Authentication
- `GET /login` - User login with username and password
- `POST /register` - Register a new user

### User Profile
- `PATCH /profile` - Update user profile information

### Task Management
- `POST /createTask` - Create a new task
- `GET /getUserTasks` - Get all tasks for a user
- `GET /getCompletedTasks` - Get completed tasks for a user
- `POST /completedTask` - Mark a task as completed
- `PATCH /updateTask` - Update task details
- `DELETE /deleteTask` - Delete a task

### Group Management
- `GET /getGroups` - Get user's groups
- `POST /createGroup` - Create a new group

## Request/Response Examples

### Login
```bash
GET /login?username=johndoe&password=mypassword
```

Response:
```json
{
  "loggedIn": true,
  "user": {
    "username": "johndoe",
    "email": "john@example.com",
    "bio": "User bio"
  }
}
```

### Create Task
```bash
POST /createTask
Content-Type: application/json

{
  "task": {
    "username": "johndoe",
    "title": "Complete project",
    "description": "Finish the task manager API"
  }
}
```

### Get User Tasks
```bash
GET /getUserTasks?username=johndoe
```

Response:
```json
{
  "tasks": [...],
  "success": true
}
```

## CORS Configuration

The API is configured to accept requests from `http://localhost:5173` (typical Vite dev server) with the following methods:
- GET
- POST
- PATCH
- DELETE

## Project Structure

```
task-manager-API/
├── index.js          # Main application file
├── DBacces.js        # Database connection management
├── DbOps.js          # Database operations
├── package.json      # Dependencies and scripts
├── package-lock.json # Locked dependency versions
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Database Operations

The application uses separate modules for database operations:
- `DBacces.js` - Handles database connections and connection pooling
- `DbOps.js` - Contains all database operations (CRUD functions)

## Development

### Code Style
- Uses async/await for asynchronous operations
- Proper error handling with try-catch blocks
- Connection management with proper cleanup in finally blocks

### Security Notes
- **⚠️ Important**: The current implementation uses plain text password storage, which is not secure for production use. Consider implementing proper password hashing (bcrypt) before deploying.
- Input validation is basic and should be enhanced for production use
- Consider implementing JWT tokens for better authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License

## Future Enhancements

- [ ] Implement password hashing
- [ ] Add JWT authentication
- [ ] Add input validation middleware
- [ ] Implement rate limiting
- [ ] Add API documentation (Swagger)
- [ ] Add unit tests
- [ ] Implement proper logging
- [ ] Add Docker support
