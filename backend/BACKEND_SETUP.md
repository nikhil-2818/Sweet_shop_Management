# Sweet Shop Backend Setup Guide

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   └── sweets.py        # Sweets CRUD endpoints
│   └── utils/
│       ├── __init__.py
│       └── auth.py          # Auth utilities (JWT, password hashing)
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   ├── test_auth.py         # Authentication tests
│   └── test_sweets.py       # Sweets CRUD tests
├── .env                      # Environment variables
├── .gitignore
├── pytest.ini               # Pytest configuration
└── requirements.txt         # Python dependencies
```

## Setup Instructions

### 1. Create Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./sweet_shop.db
SECRET_KEY=your-secret-key-change-this-in-production-use-32-chars-minimum
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Important:** Generate a secure SECRET_KEY for production:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. Run the Application

```bash
# Start the server


# The API will be available at:
# - http://localhost:8000
# - API docs: http://localhost:8000/docs
# - Alternative docs: http://localhost:8000/redoc
```

### 5. Run Tests

```bash
# Run all tests with coverage
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v

# Generate HTML coverage report
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (requires auth)

### Sweets Management

All sweets endpoints require authentication (Bearer token).

- `POST /api/sweets` - Create a new sweet
- `GET /api/sweets` - Get all sweets
- `GET /api/sweets/search` - Search sweets (query params: name, category, min_price, max_price)
- `GET /api/sweets/{id}` - Get specific sweet
- `PUT /api/sweets/{id}` - Update sweet
- `DELETE /api/sweets/{id}` - Delete sweet (admin only)
- `POST /api/sweets/{id}/purchase` - Purchase sweet (decreases quantity)
- `POST /api/sweets/{id}/restock` - Restock sweet (admin only, increases quantity)

## Testing the API

### Using the Interactive Docs

1. Go to http://localhost:8000/docs
2. Try the `/api/auth/register` endpoint to create a user
3. Use `/api/auth/login` to get a token
4. Click "Authorize" button at the top and enter: `Bearer <your_token>`
5. Now you can test all protected endpoints

### Using cURL

```bash
# Register
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Create sweet (replace TOKEN with your actual token)
curl -X POST "http://localhost:8000/api/sweets" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Chocolate Bar","category":"Chocolate","price":2.50,"quantity":100}'

# Get all sweets
curl -X GET "http://localhost:8000/api/sweets" \
  -H "Authorization: Bearer TOKEN"
```

## Creating an Admin User

Admin users can delete sweets and restock inventory. To create an admin:

1. Register a normal user
2. Manually update the database:

```python
# Run this script or use SQLite browser
from app.database import SessionLocal
from app.models import User

db = SessionLocal()
user = db.query(User).filter(User.username == "your_username").first()
user.is_admin = True
db.commit()
```

Or use SQLite directly:
```bash
sqlite3 sweet_shop.db
UPDATE users SET is_admin = 1 WHERE username = 'your_username';
```

## Database Schema

### Users Table
- id (Integer, Primary Key)
- username (String, Unique)
- email (String, Unique)
- hashed_password (String)
- is_admin (Boolean, default: False)

### Sweets Table
- id (Integer, Primary Key)
- name (String)
- category (String)
- price (Float)
- quantity (Integer)
- description (String, Optional)

## Troubleshooting

### Database Locked Error
If you get "database is locked" error:
- Make sure no other process is using the database
- Delete `sweet_shop.db` and restart the server

### Import Errors
Make sure you're in the backend directory and virtual environment is activated:
```bash
pwd  # Should show .../backend
which python  # Should show venv path
```

### Port Already in Use
If port 8000 is in use, specify a different port:
```bash
uvicorn app.main:app --reload --port 8001
```

## Next Steps

After the backend is running:
1. Test all endpoints using the Swagger docs
2. Run the test suite and ensure all tests pass
3. Move on to frontend development
4. Integrate frontend with backend API

## Development Tips

### Adding New Endpoints
1. Write tests first (TDD approach) in `tests/test_*.py`
2. Run tests to see them fail (Red)
3. Implement the endpoint in `app/routers/*.py`
4. Run tests to see them pass (Green)
5. Refactor if needed

### Database Changes
If you modify models:
1. Delete the database file: `rm sweet_shop.db`
2. Restart the server (tables will be recreated)

For production, use Alembic for migrations:
```bash
pip install alembic
alembic init alembic
# Configure alembic.ini and env.py
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```