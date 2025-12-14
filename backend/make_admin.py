"""
Script to make a user an admin
Usage: python make_admin.py
"""
from app.database import SessionLocal
from app.models import User

def make_admin(username: str):
    """Make a user an admin"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if user:
            user.is_admin = True
            db.commit()
            print(f"✓ {username} is now an admin!")
            return True
        else:
            print(f"✗ User '{username}' not found!")
            return False
    finally:
        db.close()

def list_users():
    """List all users"""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print("\nExisting users:")
        print("-" * 50)
        for user in users:
            admin_badge = "👑 ADMIN" if user.is_admin else "👤 USER"
            print(f"{admin_badge} | {user.username} | {user.email}")
        print("-" * 50)
    finally:
        db.close()

if __name__ == "__main__":
    print("🍬 Sweet Shop - Make User Admin")
    print("=" * 50)
    
    # List existing users
    list_users()
    
    # Get username from user
    print("\nEnter username to make admin (or 'q' to quit):")
    username = input("> ").strip()
    
    if username.lower() == 'q':
        print("Goodbye!")
    elif username:
        make_admin(username)
    else:
        print("Username cannot be empty!")