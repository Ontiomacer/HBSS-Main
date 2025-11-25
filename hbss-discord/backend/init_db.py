"""
Initialize database with default channels
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Channel
from datetime import datetime

def init_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = SessionLocal()
    
    try:
        # Check if channels already exist
        existing = db.query(Channel).first()
        if existing:
            print("✓ Database already initialized")
            return
        
        # Create default channels
        default_channels = [
            {
                "name": "general",
                "description": "General discussion and announcements",
                "created_by": 1
            },
            {
                "name": "hbss-dev",
                "description": "HBSS development and technical discussions",
                "created_by": 1
            },
            {
                "name": "research",
                "description": "Post-quantum cryptography research",
                "created_by": 1
            },
            {
                "name": "random",
                "description": "Off-topic and casual chat",
                "created_by": 1
            }
        ]
        
        for channel_data in default_channels:
            channel = Channel(**channel_data)
            db.add(channel)
        
        db.commit()
        print("✓ Database initialized with default channels")
        
    except Exception as e:
        print(f"✗ Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing HBSS Discord database...")
    init_database()
