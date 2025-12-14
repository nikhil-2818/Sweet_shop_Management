# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Setup (First Time Only)

```bash
# Clone and navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo 'DATABASE_URL=sqlite:///./sweet_shop.db
SECRET_KEY=your-secret-key-here-at-least-32-characters-long-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30' > .env
```

### 2. Run the Server

```bash
# Simple way
python run.py

# Or using uvicorn directly
uvicorn app.main:app --reload
```

### 3. Test the API

Open your browser: **http://localhost:8000/docs**

## 🧪 Running Tests

```bash
# Run all tests
pytest

# With coverage report
pytest --cov=app --cov-report=term-missing

# Generate HTML coverage report
pytest --cov=app --cov-report=html
# Then open: htmlcov/index.html
```

## 📝 Common Commands

### Database Management

```bash
# Reset database (if needed)
rm sweet_shop.db
python run.py  # Will recreate tables

# View database (optional - install sqlite3 browser)
sqlite3 sweet_shop.db
.tables
SELECT * FROM users;
.quit
```

### Testing Individual Components

```bash
# Test authentication only
pytest tests/test_auth.py -v

# Test sweets CRUD only
pytest tests/test_sweets.py -v

# Test specific function
pytest tests/test_auth.py::TestUserRegistration::test_register_new_user_success -v
```

## 🔑 Testing Authentication Flow

### 1. Register a User

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure123"
  }'
```

### 2. Login and Get Token

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Use Token for Protected Endpoints

```bash
# Replace YOUR_TOKEN with actual token from login
export TOKEN="YOUR_TOKEN"

# Create a sweet
curl -X POST "http://localhost:8000/api/sweets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gummy Bears",
    "category": "Gummies",
    "price": 3.99,
    "quantity": 50,
    "description": "Colorful and chewy"
  }'

# Get all sweets
curl -X GET "http://localhost:8000/api/sweets" \
  -H "Authorization: Bearer $TOKEN"

# Search sweets
curl -X GET "http://localhost:8000/api/sweets/search?category=Gummies&min_price=2&max_price=5" \
  -H "Authorization: Bearer $TOKEN"

# Purchase sweet (replace 1 with actual sweet ID)
curl -X POST "http://localhost:8000/api/sweets/1/purchase" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

## 👨‍💼 Creating Admin User

### Method 1: Using Python Script

Create `create_admin.py`:
```python
from app.database import SessionLocal
from app.models import User
from app.utils.auth import get_password_hash

db = SessionLocal()

# Create admin user
admin = User(
    username="admin",
    email="admin@sweetshop.com",
    hashed_password=get_password_hash("admin123"),
    is_admin=True
)
db.add(admin)
db.commit()
print("Admin user created!")
```

Run: `python create_admin.py`

### Method 2: Update Existing User

```python
from app.database import SessionLocal
from app.models import User

db = SessionLocal()
user = db.query(User).filter(User.username == "john_doe").first()
user.is_admin = True
db.commit()
print(f"{user.username} is now an admin!")
```

### Method 3: Direct SQL

```bash
sqlite3 sweet_shop.db
UPDATE users SET is_admin = 1 WHERE username = 'john_doe';
.quit
```

## 🎯 Testing Admin Features

```bash
# Login as admin
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

export ADMIN_TOKEN="YOUR_ADMIN_TOKEN"

# Delete a sweet (admin only)
curl -X DELETE "http://localhost:8000/api/sweets/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Restock a sweet (admin only)
curl -X POST "http://localhost:8000/api/sweets/2/restock" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 100}'
```

## 🐛 Troubleshooting

### "Module not found" error
```bash
# Make sure you're in the backend directory
pwd

# Make sure virtual environment is activated
which python  # Should show venv path

# Reinstall dependencies
pip install -r requirements.txt
```

### "Database is locked" error
```bash
# Stop all running servers
# Delete database
rm sweet_shop.db test.db

# Restart server
python run.py
```

### Port 8000 already in use
```bash
# Use different port
uvicorn app.main:app --reload --port 8001

# Or find and kill process using port 8000
# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

### Tests failing
```bash
# Make sure test database is clean
rm test.db

# Run tests with verbose output
pytest -v -s

# Check if all dependencies are installed
pip install -r requirements.txt
```

## 📊 Check Test Coverage

```bash
# Generate coverage report
pytest --cov=app --cov-report=html --cov-report=term

# View detailed report
open htmlcov/index.html  # macOS
start htmlcov/index.html  # Windows
xdg-open htmlcov/index.html  # Linux
```

## 🎨 Using Swagger UI

1. Start server: `python run.py`
2. Open browser: http://localhost:8000/docs
3. Try "Register" endpoint first
4. Then "Login" to get token
5. Click "Authorize" button (🔒 icon)
6. Enter: `Bearer YOUR_TOKEN` (with space after Bearer)
7. Now test all protected endpoints!

## ✅ Verification Checklist

- [ ] Virtual environment activated
- [ ] Dependencies installed
- [ ] .env file created with SECRET_KEY
- [ ] Server starts without errors
- [ ] Can access http://localhost:8000/docs
- [ ] Can register a new user
- [ ] Can login and get token
- [ ] Can create a sweet with token
- [ ] All tests pass: `pytest`
- [ ] Coverage report shows >80% coverage

## 🎓 Next Steps

1. ✅ Backend working? Great!
2. 📝 Document your TDD process in commits
3. 🎨 Move to frontend development
4. 🔗 Connect frontend to this backend
5. 🚀 Deploy both to production

---

Need help? Check BACKEND_SETUP.md for detailed documentation!