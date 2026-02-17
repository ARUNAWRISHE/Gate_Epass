import logging
import random
import os
import re
from flask import Flask, Response, request, jsonify, send_from_directory, session
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
import smtplib
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from functools import wraps
import jwt

load_dotenv()  # Load environment variables from .env file


from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.base import MIMEBase
from email import encoders
import qrcode

app = Flask(__name__)
CORS(app)

# 🔐 JWT Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_EXPIRATION_HOURS'] = 24

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mysql.db'  # SQLite DB
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# ============================================
# 🔐 AUTHENTICATION HELPER FUNCTIONS
# ============================================

def generate_token(user_data):
    """Generate JWT token for authenticated user"""
    payload = {
        'user_id': user_data.get('id'),
        'role': user_data.get('role'),
        'name': user_data.get('name'),
        'exp': datetime.utcnow() + timedelta(hours=app.config['JWT_EXPIRATION_HOURS'])
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    return token

def verify_token(token):
    """Verify JWT token and return decoded data"""
    try:
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return decoded
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token

def token_required(f):
    """Decorator to protect routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 401
        
        if not token:
            return jsonify({"error": "Token is missing"}), 401
        
        user_data = verify_token(token)
        if not user_data:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        request.user_data = user_data  # Attach user data to request
        return f(*args, **kwargs)
    
    return decorated

def role_required(allowed_roles):
    """Decorator to check if user has required role"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            
            # Check for token in Authorization header
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                try:
                    token = auth_header.split(" ")[1]
                except IndexError:
                    return jsonify({"error": "Invalid token format"}), 401
            
            if not token:
                return jsonify({"error": "Token is missing"}), 401
            
            user_data = verify_token(token)
            if not user_data:
                return jsonify({"error": "Invalid or expired token"}), 401
            
            if user_data['role'] not in allowed_roles:
                return jsonify({"error": "Insufficient permissions"}), 403
            
            request.user_data = user_data
            return f(*args, **kwargs)
        
        return decorated
    return decorator 

    
class HOD(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(100), nullable=False)


class Request(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    event_name = db.Column(db.String(200), nullable=False)
    event_date = db.Column(db.String(50), nullable=False)
    time_in = db.Column(db.String(50), nullable=False)
    time_out = db.Column(db.String(50), nullable=False)
    guest_name = db.Column(db.String(100), nullable=False)
    company_detail = db.Column(db.String(200), nullable=False)
    purpose = db.Column(db.String(300), nullable=False)
    guest_email = db.Column(db.String(100), nullable=False)
    guest_phone = db.Column(db.String(20), nullable=False)
    approval_letter = db.Column(db.String(300), nullable=False)
    image = db.Column(db.String(300), nullable=True)
    created_time = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Pending')
    approved_time = db.Column(db.String(50), default='Not Approved')
    staff_id = db.Column(db.Integer, nullable=True)
    otp = db.Column(db.String(50), nullable=True,default='Not Approved')
    Actual_intime = db.Column(db.String(50), nullable=True,default='Not Arrived')
    Actual_outtime = db.Column(db.String(50), nullable=True,default='Not Arrived')
    remarks = db.Column(db.String(300), nullable=True,default='Not Added')
    mail_status = db.Column(db.String(50), nullable=True,default='Not Sent')
    appreciation_letter = db.Column(db.String(300))
    
class AccompanyPerson(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('request.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
class TransportRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mode_of_transport = db.Column(db.String(10), nullable=False)
    vehicle_type = db.Column(db.String(20), nullable=True)
    vehicle_number = db.Column(db.String(20), nullable=True)

@app.route('/api/stats', methods=['GET'])
def get_request_stats():
    try:
        total_requests = Request.query.count()
        pending_requests = Request.query.filter_by(status='Pending').count()
        approved_requests = Request.query.filter_by(status='Accepted').count()
        stats = {
            "total_requests": total_requests,
            "pending_requests": pending_requests,
            "approved_requests": approved_requests
        }
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hods', methods=['GET'])
def get_hods():
    try:
        hods = HOD.query.all()  # Assuming you have an HOD model
        return jsonify([{
            "id": hod.id,
            "name": hod.name,
            "email": hod.email,
            "department": hod.department,
        } for hod in hods]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/create-hod', methods=['POST'])
def create_hod():
    data = request.get_json()
    try:
        hashed_password = generate_password_hash(data["password"])
        new_hod = HOD(
            name=data["name"],
            email=data["email"],
            department=data["department"],
            password=hashed_password
        )
        db.session.add(new_hod)
        db.session.commit()
        return jsonify({"message": "HOD added successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/requests/<string:id>/remarks', methods=['PUT'])
def update_remarks(id):
    data = request.json
    req = Request.query.get(id)
    if not req:
        return jsonify({"message": "Request not found"}), 404

    req.remarks = data.get('remarks', req.remarks)
    req.status = "Request Recreate"
    print(req.status)
    db.session.commit()

    return jsonify({"message": "Remarks updated successfully!"})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    print(data)
    role = data['role']
    password = data['password']

    if role == 'hod':
        hod = HOD.query.filter_by(department=data['department']).first()
        if hod and check_password_hash(hod.password, password):
            user_data = {"id": hod.id, "name": hod.name, "department": hod.department, "role": "hod"}
            token = generate_token(user_data)
            return jsonify({"message": "Login successful", "user": user_data, "token": token})
        else:
            return jsonify({"error": "Invalid HOD credentials"}), 401
    elif role == 'ao':
        if data['role'] == 'ao' and password == '123':
            user_data = {"id": 1, "name": "AO", "role": "ao"}
            token = generate_token(user_data)
            return jsonify({"message": "Login successful", "user": user_data, "token": token})
        else:
            return jsonify({"error": "Invalid AO credentials"}), 401
    elif role in ['principal', 'director', 'admin','security']:
        if password == "123":
            user_data = {"id": 1, "name": role.capitalize(), "role": role}
            token = generate_token(user_data)
            return jsonify({"message": f"{role.capitalize()} login successful", "user": user_data, "token": token})
        else:
            return jsonify({"error": f"Invalid {role.capitalize()} credentials"}), 401
    else:
        return jsonify({"error": "Invalid role"}), 400
    
@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('newPassword')

    hod = HOD.query.filter_by(email=email).first()
    
    if not hod:
        return jsonify({"error": "Email not found"}), 404

    if not new_password:
        return jsonify({"success": True, "message": "Email verified. Enter a new password."})

    hod.password = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"success": True, "message": "Password updated successfully!"})

@app.route('/create-hod-request', methods=['POST'])
def create_hod_request():
    try:
        # Validate and handle the uploaded files
        if 'approvalLetter' not in request.files:
            return jsonify({"error": "Approval letter is required"}), 400
        if 'appreciation_letter' not in request.files:
            return jsonify({"error": "Appreciation letter is required"}), 400
        if 'image' not in request.files:
            return jsonify({"error": "Guest image is required"}), 400

        approval_letter = request.files['approvalLetter']
        appreciation_letter = request.files['appreciation_letter']
        guest_image = request.files['image']

        allowed_extensions = {'jpg', 'jpeg', 'png'}
        
        # Save guest image
        if '.' in guest_image.filename and guest_image.filename.rsplit('.', 1)[1].lower() in allowed_extensions:
            guest_image_filename = f"guest_{datetime.now().timestamp()}_{guest_image.filename}"
            guest_image.save(os.path.join(app.config['UPLOAD_FOLDER'], guest_image_filename))
        else:
            return jsonify({"error": "Invalid image file type. Only .jpg, .jpeg, .png are allowed"}), 400

        # Save the approval and appreciation letter
        approval_letter_filename = f"approval_{datetime.now().timestamp()}_{approval_letter.filename}"
        approval_letter.save(os.path.join(app.config['UPLOAD_FOLDER'], approval_letter_filename))

        appreciation_letter_filename = f"appreciation_{datetime.now().timestamp()}_{appreciation_letter.filename}"
        appreciation_letter.save(os.path.join(app.config['UPLOAD_FOLDER'], appreciation_letter_filename))

        # Fetch department from the form
        department = HOD.query.get(request.form.get('hod_id')).department

        # Generate unique request ID with better logic
        department_prefix = re.sub(r'[^a-zA-Z]', '', department)[:2].upper()
        
        # Get all request IDs for this department and extract numbers
        all_requests = Request.query.filter(Request.department == department).all()
        existing_numbers = []
        
        for req in all_requests:
            try:
                # Extract numeric part after the prefix
                if req.id.startswith(department_prefix):
                    num_str = req.id[len(department_prefix):]
                    if num_str.isdigit():
                        existing_numbers.append(int(num_str))
            except:
                pass
        
        # Find the next available number
        next_number = max(existing_numbers) + 1 if existing_numbers else 1
        
        # Ensure uniqueness by checking if ID exists
        new_id = f"{department_prefix}{next_number}"
        while Request.query.get(new_id):
            next_number += 1
            new_id = f"{department_prefix}{next_number}"

        # Create a new request entry
        new_request = Request(
            id=new_id,
            name=request.form.get('name'),
            department=department,
            event_name=request.form.get('event_name'),
            event_date=request.form.get('event_date'),
            time_in=request.form.get('time_in'),
            time_out=request.form.get('time_out'),
            guest_name=request.form.get('guest_name'),
            company_detail=request.form.get('company_detail'),
            purpose=request.form.get('purpose'),
            guest_email=request.form.get('guest_email'),
            guest_phone=request.form.get('guest_phone'),
            approval_letter=approval_letter_filename,
            appreciation_letter=appreciation_letter_filename,
            image=guest_image_filename,  # Store image filename in DB
            staff_id=int(request.form.get('hod_id')) if request.form.get('hod_id') else None
        )

        db.session.add(new_request)
        db.session.commit()

        return jsonify({"message": "HOD request created successfully", "request_id": new_id}), 201

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    
    
@app.route('/get-department', methods=['GET'])
def get_department():
    # Check if department exists in session
    department = session.get('department')

    if department:
        return jsonify({"department": department}), 200
    else:
        return jsonify({"error": "Department not found in session"}), 404


@app.route('/create-ao-request', methods=['POST'])
def create_ao_request():
    try:
        data = request.form
        
        # Generate unique AO request ID
        all_ao_requests = Request.query.filter(Request.id.startswith("AO")).all()
        existing_numbers = []
        
        for req in all_ao_requests:
            try:
                num_str = req.id[2:]  # Extract after "AO"
                if num_str.isdigit():
                    existing_numbers.append(int(num_str))
            except:
                pass
        
        # Find the next available number
        next_number = max(existing_numbers) + 1 if existing_numbers else 1
        
        # Ensure uniqueness by checking if ID exists
        new_id = f"AO{next_number}"
        while Request.query.get(new_id):
            next_number += 1
            new_id = f"AO{next_number}"
        
        new_request = Request(
            id=new_id,
            name='AO',  
            department='AO Request', 
            event_name=data.get('event_name'),
            event_date=data.get('event_date'),
            time_in=data.get('time_in'),
            time_out=data.get('time_out'),
            guest_name=data.get('guest_name'),
            company_detail=data.get('company_detail'),
            purpose=data.get('purpose'),
            guest_email=data.get('guest_email'),
            guest_phone=data.get('guest_phone'),
            approval_letter="AO Request",  
            staff_id="AO Request",
            status = "Approved"
        )
        
        db.session.add(new_request)

        # Handle Accompany Persons
        if 'accompanyPersons' in data:
            accompany_persons = data.getlist('accompanyPersons[]')  
            for person in accompany_persons:
                name, phone = person.split(',')
                new_accompany_person = AccompanyPerson(
                    request_id=new_request.id,
                    name=name.strip(),
                    phone=phone.strip()
                )
                db.session.add(new_accompany_person)

        db.session.commit()

        return jsonify({"message": "Request created successfully.", "requestId": new_request.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@app.route('/requests/<int:hod_id>', methods=['GET'])
def get_requests(hod_id):
    try:
        print(f"Fetching requests for staff ID: {hod_id}")  # Log the request

        # Fetch the staff by ID
        staff = HOD.query.get(hod_id)
        print(staff)
        if not staff:
            print(f"No staff found with ID: {hod_id}")  # Log error
            return jsonify({"error": "Staff not found"}), 404

        # Filter requests by staff name
        requests = Request.query.filter_by(staff_id = hod_id ).order_by(Request.created_time.desc()).all()

        # Prepare the response
        response_data = [{
            "id": r.id,
            "event_name": r.event_name,
            "guest_name": r.guest_name,
            "event_date": r.event_date,
            "created_time": r.created_time.strftime('%Y-%m-%d %H:%M:%S'),
            "status": r.status,
            "approved_time": r.approved_time,
            "remarks": r.remarks
        } for r in requests]

        return jsonify(response_data), 200
    except Exception as e:
        print(f"Error while fetching requests: {str(e)}")  # Log exception
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route('/uploads/<filename>', methods=['GET'])
def get_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/all-requests', methods=['GET'])
def get_all_requests():
    try:
        status_filter = request.args.get('status')
        department_filter = request.args.get('department')
        search_query = request.args.get('search')
        sort_by = request.args.get('sort_by', 'created_time')
        sort_order = request.args.get('sort_order', 'desc')
        future_events_only = request.args.get('future_events_only', 'false').lower() == 'true'

        query = Request.query

        if status_filter:
            if status_filter.lower() != "past":
                query = query.filter(Request.status == status_filter)

        if department_filter:
            query = query.filter(Request.department == department_filter)

        if search_query:
            search_filter = f"%{search_query}%"
            query = query.filter(
                (Request.name.ilike(search_filter)) |
                (Request.event_name.ilike(search_filter)) |
                (Request.department.ilike(search_filter))
            )

        if future_events_only:
            current_date = datetime.utcnow()
            query = query.filter(Request.event_date > current_date)

        if hasattr(Request, sort_by):
            if sort_order == 'desc':
                query = query.order_by(getattr(Request, sort_by).desc())
            else:
                query = query.order_by(getattr(Request, sort_by).asc())
        else:
            return jsonify({"error": f"Invalid sort field: {sort_by}"}), 400

        all_requests = query.all()

        if not all_requests:
            return jsonify({"requests": [], "total": 0}), 200

        response_data = []
        for r in all_requests:
            data = {
                "id": r.id,
                "name": r.name,
                "department": r.department,
                "event_name": r.event_name,
                "event_date": r.event_date,
                "time_in": r.time_in,
                "time_out": r.time_out,
                "guest_name": r.guest_name,
                "company_detail": r.company_detail,
                "purpose": r.purpose,
                "status": r.status,
                "approval_letter": r.approval_letter,
                "created_time": r.created_time.strftime('%d-%m-%Y %H:%M:%S') if isinstance(r.created_time, datetime) else r.created_time,
                "approved_time": r.approved_time.strftime('%d-%m-%Y %H:%M:%S') if isinstance(r.approved_time, datetime) and r.approved_time != 'Not Approved' else r.approved_time,
                "Actual_intime": r.Actual_intime,
                "Actual_outtime": r.Actual_outtime,
                "otp": r.otp
            }
            response_data.append(data)
            
            if 'accompanyPersons' in data:
                accompany_persons = data.getlist('accompanyPersons[]')  
                for person in accompany_persons:
                    name, phone = person.split(',')
                    new_accompany_person = AccompanyPerson(
                        request_id=r.id,
                        name=name.strip(),
                        phone=phone.strip()
                    )
                    db.session.add(new_accompany_person)

        db.session.commit()
        return jsonify({
            "requests": response_data,
            "total": len(response_data),
        }), 200

    except AttributeError as ae:
        return jsonify({"error": f"Invalid sort field or order: {str(ae)}"}), 400

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/add-accompany-persons', methods=['POST'])
def add_accompany_persons():
    try:
        # Parse request data
        data = request.get_json()
        request_id = data.get('requestId')
        accompany_persons = data.get('accompanyPersons', [])

        # Validate the request ID
        if not request_id or not Request.query.get(request_id):
            return jsonify({"message": "Invalid request ID."}), 400

        # Validate accompanying persons data
        if not accompany_persons:
            return jsonify({"message": "Accompanying persons data is required."}), 400

        for person in accompany_persons:
            name = person.get('name')
            phone = person.get('phone')

            if not name or not phone:
                return jsonify({"message": "Name and phone are required for all accompanying persons."}), 400

            # Save each accompanying person to the database
            accompany_person = AccompanyPerson(
                request_id=request_id,
                name=name,
                phone=phone
            )
            db.session.add(accompany_person)

        db.session.commit()
        return jsonify({"message": "Accompanying persons added successfully."}), 201

    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/departments', methods=['GET'])
def get_departments():
    try:
        departments = db.session.query(Request.department).distinct().all()
        department_list = [d[0] for d in departments if d[0]]
        return jsonify(department_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/export-requests', methods=['GET'])
def export_requests():
    """
    Export filtered requests as a CSV or Excel file.
    """
    try:
        # (Re-use filtering logic from the main function)
        status_filter = request.args.get('status', None)
        department_filter = request.args.get('department', None)

        query = Request.query
        if status_filter:
            query = query.filter_by(status=status_filter)
        if department_filter:
            query = query.filter_by(department=department_filter)

        # Fetch data
        requests = query.all()

        # Create CSV/Excel
        import csv
        from io import StringIO
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Name", "Department", "Event Name", "Event Date", "Status"])
        for r in requests:
            writer.writerow([r.id, r.name, r.department, r.event_name, r.event_date, r.status])

        # Return CSV as response
        output.seek(0)
        return Response(
            output,
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment;filename=filtered_requests.csv"}
        )
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
    
def generate_otp():
    return random.randint(1000, 9999)

# Function to generate QR code
def generate_qr_code(otp, filename):
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(str(otp))  # Embed unique OTP in QR code
        qr.make(fit=True)

        # Create and save QR code image
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(filename)  
    except Exception as e:
        print(f"Error generating QR code: {e}")

# Function to send OTP email
def send_otp_email(email, otp, qr_path):
    try:
        sender_email = os.getenv('MAIL_USERNAME', 'infotechcheb@gmail.com')
        sender_password = os.getenv('MAIL_PASSWORD')
        
        if not sender_password:
            print("Error: MAIL_PASSWORD not found in environment variables")
            return
            
        subject = "Your Event Pass QR Code – KGISL Institute of Technology"
        body = """Respected Sir/Madam,

We are delighted to invite you to our event at KGISL Institute of Technology. Please present the attached QR code at the entrance for seamless access.

Event Details:
📍 Venue:  KGISL Institute of Technology, Coimbatore  
📌Location: 365, KGISL Campus, Saravanampatti, Coimbatore (Dt.) - 641035  

For any assistance, feel free to contact us at **0422-6619966**.  

We look forward to welcoming you!  

Best regards, 
KGISL Institute of Technology
"""

        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        # Attach unique QR code
        with open(qr_path, "rb") as f:
            img = MIMEImage(f.read())
            img.add_header("Content-Disposition", "attachment", filename=os.path.basename(qr_path))
            msg.attach(img)

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, msg.as_string())

        print(f"OTP email with QR sent to {email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

        
@app.route("/principal-requests/<string:request_id>", methods=["PUT"])
def update_principal_request(request_id):
    data = request.get_json()
    status = data.get("status")
    remarks = data.get("remarks")

    # Fetch the request from the database
    request_to_update = Request.query.get(request_id)
    if not request_to_update:
        return jsonify({"error": "Request not found"}), 404

    # Update the status and remarks
    request_to_update.status = status
    if remarks:
        request_to_update.remarks = remarks
    db.session.commit()

    return jsonify({"message": "Request updated successfully"}), 200
# Endpoint to update request status
@app.route('/requests/<string:id>', methods=['PUT'])
def update_request_status(id):
    try:
        data = request.json
        new_status = data.get('status')
        if not new_status or new_status not in ['Accepted', 'Rejected']:
            return jsonify({"error": "Invalid status provided"}), 400

        request_obj = Request.query.get(id)
        if not request_obj:
            return jsonify({"error": "Request not found"}), 404

        request_obj.status = new_status
        request_obj.approved_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Generate unique OTP
        otp = generate_otp()
        request_obj.otp = otp

        # Generate unique QR code filename
        qr_filename = f"qr_{request_obj.id}_{otp}.png"
        qr_path = os.path.join(app.config['UPLOAD_FOLDER'], qr_filename)
        
        generate_qr_code(otp, qr_path)

        # Send OTP email with the unique QR code
        send_otp_email(request_obj.guest_email, otp, qr_path)

        db.session.commit()
        return jsonify({"message": f"Request status updated to {new_status}"}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    
@app.route('/api/update-hod/<int:hod_id>', methods=['PUT'])
def update_hod(hod_id):
    data = request.get_json()
    try:
        hod = HOD.query.get(hod_id)
        if not hod:
            return jsonify({"error": "HOD not found"}), 404

        hod.name = data.get("name", hod.name)
        hod.email = data.get("email", hod.email)
        hod.department = data.get("department", hod.department)
        if "password" in data:
            hod.password = generate_password_hash(data["password"])

        db.session.commit()
        return jsonify({"message": "HOD updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete-hod/<int:hod_id>', methods=['DELETE'])
def delete_hod(hod_id):
    try:
        hod = HOD.query.get(hod_id)
        if not hod:
            return jsonify({"error": "HOD not found"}), 404

        db.session.delete(hod)
        db.session.commit()
        return jsonify({"message": "HOD deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def find_latest_appreciation_letter(event_name):
    uploads_folder = "uploads"
    file_pattern = re.compile(rf"appreciation_{re.escape(event_name)}_\d+\..+")  # Regex for matching filenames
    
    matching_files = [f for f in os.listdir(uploads_folder) if file_pattern.match(f)]
    
    if not matching_files:
        return None  # No matching files found

    # Sort files based on timestamp in filename (assuming valid format)
    matching_files.sort(key=lambda f: float(f.split("_")[2]), reverse=True)
    
    return os.path.join(uploads_folder, matching_files[0])  # Return latest file path

def send_thankyou_email(email, event_name):
    try:
        sender_email = os.getenv('MAIL_USERNAME', 'infotechcheb@gmail.com')
        sender_password = os.getenv('MAIL_PASSWORD')
        
        if not sender_password:
            print("Error: MAIL_PASSWORD not found in environment variables")
            return

        # Find the latest appreciation letter for the event
        file_path = find_latest_appreciation_letter(event_name)

        # Create the email message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = email
        msg['Subject'] = "Thank You for Visiting Us!"

        # Email body
        body = "Thank you for attending our event. Please find your appreciation letter attached."
        msg.attach(MIMEText(body, 'plain'))

        # Attach the appreciation letter if found
        if file_path:
            with open(file_path, "rb") as attachment:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(file_path)}")
                msg.attach(part)
            print(f"Attached appreciation letter: {os.path.basename(file_path)}")
        else:
            print(f"No appreciation letter found for event: {event_name}")

        # Send the email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, msg.as_string())
        
        print(f"Thank-you email sent to {email}")

    except Exception as e:
        print(f"Failed to send thank-you email: {e}")
        
@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.json
        otp = data.get('otp')

        if not otp:
            return jsonify({"success": False, "message": "OTP not provided"}), 400

        request_obj = Request.query.filter_by(otp=otp.strip()).first()
        if not request_obj:
            return jsonify({"success": False, "message": "OTP not found"}), 404

        # Construct the guest image URL
        guest_image_url = f"http://127.0.0.1:5001/uploads/{request_obj.image}" if request_obj.image else None

        return jsonify({
            "success": True,
            "request": {
                "guest_name": request_obj.guest_name,
                "otp": request_obj.otp,
                "actual_intime": request_obj.Actual_intime,
                "actual_outtime": request_obj.Actual_outtime,
                "department": request_obj.department,
                "event_name": request_obj.event_name,
                "time_in": request_obj.time_in,
                "guest_image": guest_image_url  # Include guest image URL
            }
        }), 200

    except Exception as e:
        logging.exception("Error occurred in verify_otp")
        return jsonify({"success": False, "error": str(e)}), 500



@app.route('/update-time', methods=['POST'])
def update_time():
    data = request.json
    otp = data.get('otp')
    action = data.get('action')

    request_obj = Request.query.filter_by(otp=otp).first()
    if not request_obj:
        return jsonify({"success": False, "message": "Request not found"}), 404

    # Get current time
    current_time = datetime.now().strftime('%I:%M %p')  # Format: 'HH:MM AM/PM'

    # Convert both time_in and current_time into comparable datetime objects
    def parse_time(time_str):
        if time_str:
            return datetime.strptime(time_str, '%I:%M %p')  # Convert to datetime object
        return None

    time_in_obj = parse_time(request_obj.time_in)
    current_time_obj = parse_time(current_time)

    if action == "arrived":
        if request_obj.Actual_intime != 'Not Arrived':
            return jsonify({"success": False, "message": "In-time already updated"}), 400

        # Check if current time is before `time_in`
        if current_time_obj < time_in_obj:
            return jsonify({
                "success": False,
                "message": f"You cannot check in before {request_obj.time_in}. Please wait."
            }), 400

        request_obj.Actual_intime = current_time

    elif action == "left":
        if request_obj.Actual_outtime != 'Not Arrived':
            return jsonify({"success": False, "message": "Out-time already updated"}), 400
        request_obj.Actual_outtime = current_time
        send_thankyou_email(request_obj.guest_email,request_obj.event_name)

    db.session.commit()
    print(f"Time updated for {action} for OTP: {otp}")
    return jsonify({"success": True, "message": f"Time updated for {action}"}), 200

@app.route('/active-requests', methods=['GET'])
def get_active_requests():
    active_requests = Request.query.filter(Request.Actual_intime != "Not Arrived", Request.Actual_outtime == "Not Arrived").all()
    return jsonify([{
        "id": req.id,
        "guest_name": req.guest_name,
        "guest_phone": req.guest_phone,
        "event_name": req.event_name,
        "Actual_intime": req.Actual_intime
    } for req in active_requests]), 200
    
if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5001)