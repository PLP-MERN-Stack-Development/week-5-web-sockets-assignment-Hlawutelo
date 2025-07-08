
# Online Communications Central - Server

This is the backend server for the real-time chat application built with Node.js, Express, Socket.io, and MongoDB.

## Features

- Real-time messaging with Socket.io
- Multiple chat rooms
- User authentication and presence
- Typing indicators
- Message reactions
- User management
- MongoDB integration for data persistence
- RESTful API for data access

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Set up MongoDB:
   - Install MongoDB on your system if not already installed
   - Start MongoDB service: `mongod --dbpath C:\data\db` (Windows) or `mongod` (Linux/Mac)
   - The server will automatically connect to MongoDB using the connection string in the `.env` file
   - Default database name is `chat_app`

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Or start the production server:
   ```bash
   npm start
   ```

## API Endpoints

The server provides both RESTful API endpoints and Socket.io events for real-time communication.

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
- `PUT /api/rooms/:id` - Update a room
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

## Project Structure

```
server/
├── config/         # Configuration files
├── controllers/    # Socket event handlers
├── models/         # Data models (both in-memory and MongoDB)
├── routes/         # API route definitions
├── socket/         # Socket.io server setup
├── utils/          # Utility functions
├── server.js       # Main server file
└── postman_collection.json # Postman collection for API testing
```

## Testing with Postman

1. Import the `postman_collection.json` file into Postman
2. The collection includes all API endpoints for testing
3. Make sure the server is running before testing
4. For endpoints that require IDs, you'll need to replace the placeholder values with actual IDs from your database

## MongoDB Compass

1. Install MongoDB Compass (GUI for MongoDB)
2. Connect to your MongoDB instance using the connection string: `mongodb://localhost:27017/`
3. Select the `chat_app` database to view and manage your data
4. You can view and edit the following collections:
   - `users` - User information
   - `rooms` - Chat rooms
   - `messages` - Chat messages
