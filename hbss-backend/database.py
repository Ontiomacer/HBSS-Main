"""
Database configuration for HBSS LiveChat
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./hbss_chat.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
