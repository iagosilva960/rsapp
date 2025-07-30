from src.models.user import db

class Request(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Dados do cliente
    client_name = db.Column(db.String(100), nullable=True)
    client_cpf = db.Column(db.String(14), nullable=False)
    client_phone = db.Column(db.String(20), nullable=False)
    
    # Dados da solicitação
    location = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    vehicle_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Dados para terceiros (opcional)
    is_for_third_party = db.Column(db.Boolean, default=False)
    third_party_name = db.Column(db.String(100), nullable=True)
    third_party_cpf = db.Column(db.String(14), nullable=True)
    third_party_phone = db.Column(db.String(20), nullable=True)
    
    # Dados do dispositivo
    device_id = db.Column(db.String(100), nullable=True)
    
    # Status e controle
    status = db.Column(db.String(50), default='Pendente')
    admin_notes = db.Column(db.Text, nullable=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def __repr__(self):
        return f"<Request {self.id} - {self.status}>"

    def to_dict(self):
        return {
            "id": self.id,
            "client_name": self.client_name,
            "client_cpf": self.client_cpf,
            "client_phone": self.client_phone,
            "location": self.location,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "vehicle_type": self.vehicle_type,
            "description": self.description,
            "is_for_third_party": self.is_for_third_party,
            "third_party_name": self.third_party_name,
            "third_party_cpf": self.third_party_cpf,
            "third_party_phone": self.third_party_phone,
            "device_id": self.device_id,
            "status": self.status,
            "admin_notes": self.admin_notes,
            "admin_id": self.admin_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

