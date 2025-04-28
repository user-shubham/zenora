from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import SQLAlchemyError
from models import User, Assessment, ChatHistory, JournalEntry, MoodLog 
from app import db
from datetime import datetime, timedelta
import re  # Import the regex module

auth = Blueprint('auth', __name__)

# User signup route
@auth.route('/auth/signup', methods=['POST'])
def signup():
    """
    Handles user signup by validating input, hashing the password, and saving the user to the database.
    """
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        age = data.get('age')
        gender = data.get('gender')

        # Validate input
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Validate email format
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, email):
            return jsonify({'error': 'Invalid email address'}), 400

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'User already exists'}), 400

        # Create a new user
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)
        new_user = User(email=email, password=hashed_password, age=age, gender=gender)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'User created successfully'}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500

# User login route
@auth.route('/auth/login', methods=['POST'])
def login():
    """
    Handles user login by validating credentials and returning a success message with the user ID.
    """
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Validate input
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Find user by email
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password, password):
            return jsonify({'error': 'Invalid email or password'}), 401

        return jsonify({'message': 'Login successful', 'user_id': user.id}), 200

    except SQLAlchemyError as e:
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500

# Route to store GAD-7 and PHQ-9 scores
@auth.route('/assessments', methods=['POST'])
def store_assessment():
    """
    Stores GAD-7 and PHQ-9 scores for a user, ensuring only one entry per day.
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        gad7_score = data.get('gad7_score')
        phq9_score = data.get('phq9_score')

        # Validate input
        if not user_id or (gad7_score is None and phq9_score is None):
            return jsonify({'error': 'User ID and at least one score (GAD-7 or PHQ-9) are required'}), 400

        # Check if an assessment already exists for the user today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        existing_assessment = Assessment.query.filter(
            Assessment.user_id == user_id,
            Assessment.created_at >= today_start
        ).first()

        if existing_assessment:
            return jsonify({'error': 'Assessment scores can only be submitted once per day'}), 400

        # Create a new assessment entry
        new_assessment = Assessment(
            user_id=user_id,
            gad7_score=gad7_score,
            phq9_score=phq9_score,
            created_at=datetime.utcnow()
        )
        db.session.add(new_assessment)
        db.session.commit()

        return jsonify({'message': 'Assessment stored successfully'}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500

# Route to fetch GAD-7 and PHQ-9 scores for a user
@auth.route('/assessments/<int:user_id>', methods=['GET'])
def fetch_assessments(user_id):
    """
    Fetches all GAD-7 and PHQ-9 scores for a user.
    """
    try:
        # Fetch assessments for the given user ID
        assessments = Assessment.query.filter_by(user_id=user_id).order_by(Assessment.created_at.desc()).all()

        if not assessments:
            return jsonify({'error': 'No assessments found for the user'}), 404

        # Serialize the assessments
        assessments_data = [
            {
                'gad7_score': assessment.gad7_score,
                'phq9_score': assessment.phq9_score,
                'created_at': assessment.created_at
            } for assessment in assessments
        ]

        return jsonify({'assessments': assessments_data}), 200

    except SQLAlchemyError as e:
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500

@auth.route('/chat', methods=['POST'])
def chat():
    """
    Handles user messages, generates bot replies, and stores both in the database.
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        user_message = data.get('message')

        # Validate input
        if not user_id or not user_message:
            return jsonify({'error': 'User ID and message are required'}), 400

        # Generate a bot reply (this is a placeholder; replace with your bot logic)
        bot_reply = f"Hello! You said: {user_message}"

        # Store the user message and bot reply in the database
        user_chat = ChatHistory(user_id=user_id, message=user_message, sender='user', created_at=datetime.utcnow())
        bot_chat = ChatHistory(user_id=user_id, message=bot_reply, sender='bot', created_at=datetime.utcnow())
        db.session.add(user_chat)
        db.session.add(bot_chat)
        db.session.commit()

        # Send the bot reply back to the frontend
        return jsonify({'bot_reply': bot_reply}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500

@auth.route('/chat/history/<int:user_id>', methods=['GET'])
def get_chat_history(user_id):
    """
    Fetches the chat history for a user.
    """
    try:
        # Fetch chat history for the user
        chat_history = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.created_at.asc()).all()

        # Serialize the chat history
        history = [
            {
                'message': chat.message,
                'sender': chat.sender,
                'created_at': chat.created_at
            } for chat in chat_history
        ]

        return jsonify({'chat_history': history}), 200

    except SQLAlchemyError as e:
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500

@auth.route('/journal', methods=['POST'])
def add_journal():
    """
    Adds a daily journal entry for a user, ensuring only one entry per day.
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        entry = data.get('entry')

        # Validate input
        if not user_id or not entry:
            return jsonify({'error': 'User ID and journal entry are required'}), 400

        # Check if a journal entry already exists for the user today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        existing_journal = JournalEntry.query.filter(
            JournalEntry.user_id == user_id,
            JournalEntry.created_at >= today_start
        ).first()

        if existing_journal:
            return jsonify({'error': 'You can only add one journal entry per day'}), 400

        # Create a new journal entry
        new_journal = JournalEntry(user_id=user_id, entry=entry, created_at=datetime.utcnow())
        db.session.add(new_journal)
        db.session.commit()

        return jsonify({'message': 'Journal entry added successfully'}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500

@auth.route('/journal/<int:user_id>', methods=['GET'])
def fetch_journals(user_id):
    """
    Fetches all journal entries for a user.
    """
    try:
        # Fetch all journal entries for the user
        journals = JournalEntry.query.filter_by(user_id=user_id).order_by(JournalEntry.created_at.desc()).all()

        if not journals:
            return jsonify({'error': 'No journal entries found for the user'}), 404

        # Serialize the journal entries
        journal_data = [
            {
                'entry': journal.entry,
                'created_at': journal.created_at
            } for journal in journals
        ]

        return jsonify({'journals': journal_data}), 200

    except SQLAlchemyError as e:
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500

@auth.route('/moodlog', methods=['POST'])
def add_mood_log():
    """
    Adds a daily mood log entry for a user, with an optional note.
    Ensures the user exists before logging the mood.
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        mood = data.get('mood')
        note = data.get('note')  # Optional field

        # Validate input
        if not user_id or not mood:
            return jsonify({'error': 'User ID and mood are required'}), 400

        # Check if the user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if a mood log already exists for the user today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        existing_mood_log = MoodLog.query.filter(
            MoodLog.user_id == user_id,
            MoodLog.created_at >= today_start
        ).first()

        if existing_mood_log:
            return jsonify({'error': 'You can only add one mood log per day'}), 400

        # Create a new mood log entry
        new_mood_log = MoodLog(user_id=user_id, mood=mood, note=note, created_at=datetime.utcnow())
        db.session.add(new_mood_log)
        db.session.commit()

        return jsonify({'message': 'Mood log added successfully'}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500

@auth.route('/moodlog/<int:user_id>', methods=['GET'])
def fetch_mood_logs(user_id):
    """
    Fetches all mood log entries for a user.
    """
    try:
        # Fetch all mood logs for the user
        mood_logs = MoodLog.query.filter_by(user_id=user_id).order_by(MoodLog.created_at.desc()).all()

        if not mood_logs:
            return jsonify({'error': 'No mood logs found for the user'}), 404

        # Serialize the mood logs
        mood_logs_data = [
            {
                'mood': mood_log.mood,
                'note': mood_log.note,  # Include the optional note
                'created_at': mood_log.created_at
            } for mood_log in mood_logs
        ]

        return jsonify({'mood_logs': mood_logs_data}), 200

    except SQLAlchemyError as e:
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500

def prepare_context(chat_history, max_tokens):
    """
    Prepares the context for LLM input by summarizing older messages if the token count exceeds the limit.

    Args:
        chat_history (list): List of dictionaries representing the chat history.
                             Each dictionary contains "sender", "message", and "timestamp".
        max_tokens (int): Maximum token limit for the LLM input.

    Returns:
        str: Final context to send to the LLM.
    """
    def count_tokens(text):
        """Returns the token count for a given text."""
        return len(text.split())  # Placeholder implementation

    def summarize_chat(messages):
        """Summarizes a list of messages into a short paragraph."""
        return "Summary of older chats."  # Placeholder implementation

    # Combine all messages into a single string
    full_history = "\n".join([f"{msg['sender']}: {msg['message']}" for msg in chat_history])
    total_tokens = count_tokens(full_history)

    if (total_tokens <= max_tokens):
        return full_history

    # Summarize older messages
    recent_messages = chat_history[-10:]
    older_messages = chat_history[:-10]
    summary = summarize_chat(older_messages)

    # Combine summary with recent messages
    recent_history = "\n".join([f"{msg['sender']}: {msg['message']}" for msg in recent_messages])
    final_context = f"{summary}\n{recent_history}"

    # Ensure the final context is within the token limit
    while count_tokens(final_context) > max_tokens and recent_messages:
        recent_messages.pop(0)
        recent_history = "\n".join([f"{msg['sender']}: {msg['message']}" for msg in recent_messages])
        final_context = f"{summary}\n{recent_history}"

    return final_context