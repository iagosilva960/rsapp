from flask import Blueprint, request, jsonify
from src.models.request import Request
from src.models.user import db

requests_bp = Blueprint("requests", __name__)

@requests_bp.route("/requests", methods=["POST"])
def create_request():
    data = request.get_json()
    
    # Extrair dados da localização se disponível
    user_location = data.get("userLocation", {})
    latitude = user_location.get("lat") if user_location else None
    longitude = user_location.get("lng") if user_location else None
    
    new_request = Request(
        client_name=data.get("client_name"),
        client_cpf=data.get("clientCpf"),
        client_phone=data.get("phoneNumber"),
        location=data.get("location"),
        latitude=latitude,
        longitude=longitude,
        vehicle_type=data.get("vehicleType"),
        description=data.get("description"),
        is_for_third_party=data.get("isForThirdParty", False),
        third_party_name=data.get("thirdPartyName"),
        third_party_cpf=data.get("thirdPartyCpf"),
        third_party_phone=data.get("thirdPartyPhone"),
        device_id=data.get("deviceId")
    )
    
    db.session.add(new_request)
    db.session.commit()
    
    return jsonify({
        "success": True, 
        "message": "Solicitação criada com sucesso", 
        "id": new_request.id
    }), 201

@requests_bp.route("/requests/<int:request_id>", methods=["GET"])
def get_request(request_id):
    req = Request.query.get_or_404(request_id)
    return jsonify(req.to_dict())

@requests_bp.route("/requests", methods=["GET"])
def get_all_requests():
    # Filtros opcionais
    status = request.args.get('status')
    device_id = request.args.get('device_id')
    
    query = Request.query
    
    if status:
        query = query.filter_by(status=status)
    if device_id:
        query = query.filter_by(device_id=device_id)
    
    requests = query.order_by(Request.created_at.desc()).all()
    return jsonify([req.to_dict() for req in requests])

@requests_bp.route("/requests/<int:request_id>/status", methods=["PUT"])
def update_request_status(request_id):
    data = request.get_json()
    new_status = data.get('status')
    admin_notes = data.get('adminNotes', '')
    admin_id = data.get('admin_id')
    
    req = Request.query.get_or_404(request_id)
    req.status = new_status
    if admin_notes:
        req.admin_notes = admin_notes
    if admin_id:
        req.admin_id = admin_id
    
    db.session.commit()
    
    return jsonify({
        "success": True, 
        "message": "Status atualizado com sucesso"
    })

@requests_bp.route("/requests/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "Requests API is running"})

