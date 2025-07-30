from src.models.user import db

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f"<Admin {self.username}>"

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "is_active": self.is_active
        }

