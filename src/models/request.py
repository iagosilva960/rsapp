from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class TowingRequest(db.Model):
    __tablename__ = 'towing_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(100), nullable=False)
    location = db.Column(db.Text, nullable=False)
    vehicle_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    client_cpf = db.Column(db.String(14), nullable=False)
    
    # Campos para terceiros
    is_for_third_party = db.Column(db.Boolean, default=False)
    third_party_name = db.Column(db.String(200), nullable=True)
    third_party_cpf = db.Column(db.String(14), nullable=True)
    third_party_phone = db.Column(db.String(20), nullable=True)
    
    # Localização GPS
    user_location_lat = db.Column(db.Float, nullable=True)
    user_location_lng = db.Column(db.Float, nullable=True)
    
    # Status e timestamps
    status = db.Column(db.String(50), default='pending')  # pending, accepted, rejected, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Notas administrativas
    admin_notes = db.Column(db.Text, nullable=True)
    admin_user = db.Column(db.String(100), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'device_id': self.device_id,
            'location': self.location,
            'vehicle_type': self.vehicle_type,
            'description': self.description,
            'phone_number': self.phone_number,
            'client_cpf': self.client_cpf,
            'is_for_third_party': self.is_for_third_party,
            'third_party_name': self.third_party_name,
            'third_party_cpf': self.third_party_cpf,
            'third_party_phone': self.third_party_phone,
            'user_location': {
                'lat': self.user_location_lat,
                'lng': self.user_location_lng
            } if self.user_location_lat and self.user_location_lng else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'admin_notes': self.admin_notes,
            'admin_user': self.admin_user
        }

class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

