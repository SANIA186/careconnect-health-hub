# NGO CareConnect Backend

This is the Flask backend foundation for the NGO CareConnect project.

## Project Structure
- `app.py`: Flask Application Factory and global error handling.
- `config.py`: Configuration classes for Development, Testing, and Production environments.
- `database.py`: Initialization of Flask extensions (SQLAlchemy, Migrate, JWT, CORS, Bcrypt).
- `models/`: Database models (SQLAlchemy).
- `routes/`: API endpoints.
- `services/`: Business logic.
- `schemas/`: Serialization/Deserialization and validation (e.g., using Marshmallow).
- `utils/`: Helper functions and utilities.
- `migrations/`: Alembic migrations folder for Flask-Migrate.

## Setup and Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On Mac/Linux: `source venv/bin/activate`
3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in the configuration values.

## Running the Backend

Start the Flask development server:
```bash
flask run
```
Or run `app.py` directly:
```bash
python app.py
```

## Migrations

Initialize migrations (only once):
```bash
flask db init
```

Create a migration after modifying models:
```bash
flask db migrate -m "Migration message"
```

Apply migrations to the database:
```bash
flask db upgrade
```

## Authentication & Default Accounts

This project uses Flask-Bcrypt for password hashing and Flask-JWT-Extended for authentication.

### Default Accounts
When the server starts for the first time with an empty database, it automatically creates three default demo users:
- **Admin**: `admin@careconnect.org` (Password: `Admin@123`)
- **Doctor**: `doctor@careconnect.org` (Password: `Doctor@123`)
- **Volunteer**: `volunteer@careconnect.org` (Password: `Volunteer@123`)

### API Endpoints

#### Login
**POST** `/api/auth/login`
- Body: `{"email": "admin@careconnect.org", "password": "Admin@123"}`
- Returns: `access_token` and `user` details.

#### Current User
**GET** `/api/auth/me`
- Headers: `Authorization: Bearer <access_token>`
- Returns: The currently logged in user.

#### Logout
**POST** `/api/auth/logout`
- Headers: `Authorization: Bearer <access_token>`
- Returns: Success message.
