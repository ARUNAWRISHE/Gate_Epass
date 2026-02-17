#!/usr/bin/env python
"""
Script to hash all existing plain-text passwords in the database
Run this once before restarting the app
"""
from app import app, db, HOD
from werkzeug.security import generate_password_hash

def hash_all_passwords():
    with app.app_context():
        hods = HOD.query.all()
        
        if not hods:
            print("No HODs found in database")
            return
        
        print(f"Found {len(hods)} HODs. Hashing passwords...")
        
        for hod in hods:
            # Check if password is already hashed (hashed passwords start with 'pbkdf2:sha256:' or similar)
            if not hod.password.startswith(('pbkdf2:', 'scrypt:', 'argon2')):
                print(f"Hashing password for: {hod.name} ({hod.department})")
                hod.password = generate_password_hash(hod.password)
            else:
                print(f"Password already hashed for: {hod.name} ({hod.department})")
        
        db.session.commit()
        print("✅ All passwords have been hashed successfully!")
        
        # Display updated HODs
        print("\nUpdated HODs:")
        hods = HOD.query.all()
        for hod in hods:
            print(f"  - {hod.name} ({hod.department}): {hod.password[:30]}...")

if __name__ == '__main__':
    hash_all_passwords()
