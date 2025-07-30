from flask import Blueprint, request, jsonify
from src.models.request import db, TowingRequest
from datetime import datetime
import uuid

requests_bp = Blueprint('requests', __name__)

@requests_bp.route('/requests/submit', methods=['POST'])
def submit_request():
    try:
        data = request.get_json()
        
        # Validar campos obrigatórios
        required_fields = ['location', 'vehicleType', 'description', 'phoneNumber', 'clientCpf', 'deviceId']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False, 
                    'message': f'Campo obrigatório ausente: {field}'
                }), 400
        
        # Extrair localização GPS se disponível
        user_location = data.get('userLocation')
        lat = None
        lng = None
        if user_location and isinstance(user_location, dict):
            lat = user_location.get('lat')
            lng = user_location.get('lng')
        
        # Criar nova solicitação
        new_request = TowingRequest(
            device_id=data['deviceId'],
            location=data['location'],
            vehicle_type=data['vehicleType'],
            description=data['description'],
            phone_number=data['phoneNumber'],
            client_cpf=data['clientCpf'],
            is_for_third_party=data.get('isForThirdParty', False),
            third_party_name=data.get('thirdPartyName'),
            third_party_cpf=data.get('thirdPartyCpf'),
            third_party_phone=data.get('thirdPartyPhone'),
            user_location_lat=lat,
            user_location_lng=lng,
            status='pending'
        )
        
        db.session.add(new_request)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Solicitação enviada com sucesso',
            'requestId': new_request.id,
            'request': new_request.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro ao processar solicitação: {str(e)}'
        }), 500

@requests_bp.route('/requests/status/<int:request_id>', methods=['GET'])
def get_request_status(request_id):
    try:
        towing_request = TowingRequest.query.get(request_id)
        if not towing_request:
            return jsonify({
                'success': False,
                'message': 'Solicitação não encontrada'
            }), 404
        
        return jsonify({
            'success': True,
            'request': towing_request.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro ao obter status: {str(e)}'
        }), 500

@requests_bp.route('/requests/device/<device_id>', methods=['GET'])
def get_device_requests(device_id):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        requests_paginated = TowingRequest.query.filter_by(device_id=device_id)\
            .order_by(TowingRequest.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'requests': [req.to_dict() for req in requests_paginated.items],
            'total': requests_paginated.total,
            'pages': requests_paginated.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro ao obter histórico: {str(e)}'
        }), 500

@requests_bp.route('/requests/health', methods=['GET'])
def health_check():
    return jsonify({
        'success': True,
        'message': 'API funcionando corretamente',
        'timestamp': datetime.utcnow().isoformat()
    })

