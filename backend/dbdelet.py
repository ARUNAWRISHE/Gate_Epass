from app import app, db  # Import your Flask app and database instance
from app import Request  # Import your model

# Create an application context
with app.app_context():
    # Delete all records from the Request table
    db.session.query(Request).delete()
    
    # Commit the changes
    db.session.commit()
    
    print("All records deleted successfully.")
