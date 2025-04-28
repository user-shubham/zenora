from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_migrate import Migrate
import os
import logging

# Initialize extensions
db = SQLAlchemy()
socketio = SocketIO()  # Initialize SocketIO globally
migrate = Migrate()  # Initialize Flask-Migrate

def create_app():
    """
    Factory function to create and configure the Flask application.

    Returns:
        Flask app instance.
    """
    app = Flask(__name__)
    # Enable Cross-Origin Resource Sharing (CORS) for frontend communication
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///database.db')  # Default to SQLite
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Logging configuration
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)s: %(message)s')

    # Initialize extensions
    db.init_app(app)
    socketio.init_app(app)  # Attach SocketIO to the app
    migrate.init_app(app, db)  # Attach Flask-Migrate to the app and database

    # Register blueprints for modular routing
    from routes import auth
    app.register_blueprint(auth, url_prefix='/api')  # Add a prefix for API routes

    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        """Handles 404 errors (resource not found)."""
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        """Handles 500 errors (internal server errors)."""
        return {"error": "An internal error occurred"}, 500

    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()

    return app

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    """Handles WebSocket connection events."""
    print("Client connected.")

@socketio.on('disconnect')
def handle_disconnect():
    """Handles WebSocket disconnection events."""
    print("Client disconnected.")

@socketio.on('message')
def handle_message(data):
    """
    Handles incoming WebSocket messages from the client.

    Args:
        data (dict): Incoming message data. Expected keys: "user_id", "message".
    """
    try:
        user_id = data.get('user_id')
        user_message = data.get('message')

        # Validate input
        if not user_id or not user_message:
            emit('error', {'error': 'User ID and message are required'})
            return

        # Save user message to the database
        user_chat = ChatHistory(user_id=user_id, message=user_message, sender='user', created_at=datetime.utcnow())
        db.session.add(user_chat)
        db.session.commit()

        # Prepare LLM context
        chat_history = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.created_at.asc()).all()
        chat_history_list = [{'sender': chat.sender, 'message': chat.message, 'timestamp': chat.created_at} for chat in chat_history]
        context = prepare_context(chat_history_list, max_tokens=3000)

        # Generate bot reply (placeholder logic)
        bot_reply = f"Bot reply to: {user_message}"

        # Save bot reply to the database
        bot_chat = ChatHistory(user_id=user_id, message=bot_reply, sender='bot', created_at=datetime.utcnow())
        db.session.add(bot_chat)
        db.session.commit()

        # Emit bot reply back to the frontend
        emit('bot_reply', {'bot_reply': bot_reply})

    except Exception as e:
        # Handle unexpected errors
        emit('error', {'error': 'An unexpected error occurred', 'details': str(e)})

if __name__ == '__main__':
    # Create the app and run it with SocketIO
    app = create_app()
    socketio.run(app, debug=True)  # Run the app in debug mode

