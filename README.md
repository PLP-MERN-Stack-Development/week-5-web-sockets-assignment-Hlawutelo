# Online Communications Central

A real-time chat application built with React, TypeScript, Socket.io, Express, and MongoDB.

## Project Overview

Online Communications Central is a full-stack chat application that enables real-time communication between users. The application features a modern React frontend with TypeScript and a Node.js backend with MongoDB integration for data persistence.

## Features

- **Real-time messaging** using Socket.io
- **Multiple chat rooms** with different topics
- **User authentication** and presence indicators
- **Typing indicators** to show when users are typing
- **Message reactions** to express emotions
- **Persistent data storage** with MongoDB
- **Responsive UI** built with React, Tailwind CSS, and shadcn/ui
- **RESTful API** for data access

## Project Structure

The project is organized into two main parts:

```
/
├── src/                  # Frontend React application
│   ├── components/       # UI components
│   ├── contexts/         # React contexts including SocketContext
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── socket/           # Socket.io client setup
│   └── App.tsx           # Main application component
│
└── server/               # Backend Node.js server
    ├── config/           # Configuration files
    ├── controllers/      # Socket event handlers
    ├── models/           # Data models (both in-memory and MongoDB)
    ├── routes/           # API route definitions
    ├── socket/           # Socket.io server setup
    ├── utils/            # Utility functions
    └── server.js         # Main server file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (v4.4 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd online-comms-central
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Update the MongoDB connection string if needed

5. Start MongoDB:
   ```bash
   # Windows
   mongod --dbpath C:\data\db
   
   # Linux/Mac
   mongod
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   # From the project root
   npm run dev
   ```

3. Open your browser and navigate to:
   - Frontend: http://localhost:8081 (or the port shown in your terminal)
   - Backend API: http://localhost:5000

## API Endpoints

### REST API

#### Health Check
- `GET /api/health` - Check if the server is running

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

#### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get a specific room
- `POST /api/rooms` - Create a new room
- `PATCH /api/rooms/:id` - Update a room
- `POST /api/rooms/:id/users` - Add a user to a room
- `DELETE /api/rooms/:roomId/users/:userId` - Remove a user from a room
- `DELETE /api/rooms/:id` - Delete a room

#### Messages
- `GET /api/messages` - Get all messages
- `GET /api/messages/room/:roomId` - Get all messages in a room
- `GET /api/messages/:id` - Get a specific message
- `POST /api/messages` - Create a new message
- `POST /api/messages/:id/reactions` - Add a reaction to a message
- `DELETE /api/messages/:id` - Delete a message

### Socket.io Events

#### Client to Server Events
- `user_join` - User joins the chat
- `join_room` - Join a specific room
- `leave_room` - Leave a room
- `send_message` - Send a message
- `add_reaction` - Add reaction to a message
- `start_typing` - Start typing indicator
- `stop_typing` - Stop typing indicator

#### Server to Client Events
- `user_joined_room` - User joined notification
- `user_left_room` - User left notification
- `new_message` - New message received
- `message_reaction` - Message reaction updated
- `user_typing` - User typing notification
- `user_stopped_typing` - User stopped typing notification
- `user_status` - User online/offline status

## Testing with Postman

1. Import the `server/postman_collection.json` file into Postman
2. The collection includes all API endpoints for testing
3. Make sure the server is running before testing
4. For endpoints that require IDs, you'll need to replace the placeholder values with actual IDs from your database

## MongoDB Integration

The application uses MongoDB for data persistence. You can use MongoDB Compass to view and manage your data:

1. Install MongoDB Compass (GUI for MongoDB)
2. Connect to your MongoDB instance using the connection string: `mongodb://localhost:27017/`
3. Select the `chat_app` database to view and manage your data
4. You can view and edit the following collections:
   - `users` - User information
   - `rooms` - Chat rooms
   - `messages` - Chat messages

## Technologies Used

### Frontend
- React
- TypeScript
- Socket.io-client
- React Router
- Tailwind CSS
- shadcn/ui components
- Vite (build tool)

### Backend
- Node.js
- Express
- Socket.io
- MongoDB with Mongoose
- Nodemon (development)

## License

ISC

## Project URL

**URL**: https://lovable.dev/projects/ae216066-d01a-493c-8f56-844be5378eaf
