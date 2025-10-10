# Gate E-Pass System

A web-based gate pass management system for managing visitor access to a college or institution.

## Project Structure

```
Gate_Epass/
├── backend/               # Backend server (Flask)
│   ├── app.py            # Main application file
│   ├── requirements.txt  # Python dependencies
│   ├── .env             # Environment variables
│   ├── .gitignore       # Git ignore file
│   ├── uploads/         # Directory for file uploads
│   └── migrations/      # Database migrations
└── frontend/            # Frontend (React)
    ├── public/          # Static files
    └── src/             # React source code
```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and use python 3.11 (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

5. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

6. Run the backend server:
   ```bash
   flask run
   ```
   The backend will be available at `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///mysql.db
UPLOAD_FOLDER=uploads
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-email-password
```

## Features

- User authentication for HODs and administrators
- Visitor registration and management
- QR code generation for visitor passes
- Email notifications
- Request approval workflow
- Reporting and analytics

## API Documentation

API documentation is available at `http://localhost:5000/api/docs` when the backend server is running.

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
