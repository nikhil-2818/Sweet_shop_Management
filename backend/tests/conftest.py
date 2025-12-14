import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import User, Sweet
from app.utils.auth import get_password_hash

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpass123"),
        is_admin=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def admin_user(db_session):
    """Create an admin user"""
    user = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("adminpass123"),
        is_admin=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def user_token(client, test_user):
    """Get authentication token for test user"""
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "testpass123"}
    )
    return response.json()["access_token"]

@pytest.fixture
def admin_token(client, admin_user):
    """Get authentication token for admin user"""
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "adminpass123"}
    )
    return response.json()["access_token"]

@pytest.fixture
def test_sweet(db_session):
    """Create a test sweet"""
    sweet = Sweet(
        name="Chocolate Bar",
        category="Chocolate",
        price=2.50,
        quantity=100,
        description="Delicious milk chocolate"
    )
    db_session.add(sweet)
    db_session.commit()
    db_session.refresh(sweet)
    return sweet

@pytest.fixture
def multiple_sweets(db_session):
    """Create multiple test sweets"""
    sweets = [
        Sweet(name="Gummy Bears", category="Gummies", price=3.99, quantity=50),
        Sweet(name="Lollipop", category="Hard Candy", price=1.50, quantity=200),
        Sweet(name="Dark Chocolate", category="Chocolate", price=4.99, quantity=30),
        Sweet(name="Sour Worms", category="Gummies", price=2.99, quantity=75),
    ]
    for sweet in sweets:
        db_session.add(sweet)
    db_session.commit()
    return sweets