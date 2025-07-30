from flask import Blueprint, request, jsonify, session
from src.models.admin import Admin
from src.models.request import Request
from src.models.user import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    admin = Admin.query.filter_by(username=username).first()
    
    if admin and admin.password == password:
        session['admin_id'] = admin.id
        return jsonify({'success': True, 'message': 'Login successful'})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@admin_bp.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin_id', None)
    return jsonify({'success': True, 'message': 'Logout successful'})

@admin_bp.route('/admin/status', methods=['GET'])
def admin_status():
    if 'admin_id' in session:
        admin = Admin.query.get(session['admin_id'])
        return jsonify({'logged_in': True, 'admin': admin.to_dict()})
    else:
        return jsonify({'logged_in': False})

@admin_bp.route('/admin/requests', methods=['GET'])
def get_all_requests():
    if 'admin_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Filtros opcionais
    status = request.args.get('status')
    
    query = Request.query
    if status:
        query = query.filter_by(status=status)
    
    requests = query.order_by(Request.created_at.desc()).all()
    return jsonify([req.to_dict() for req in requests])

@admin_bp.route('/admin/requests/<int:request_id>', methods=['GET'])
def get_request_details(request_id):
    if 'admin_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    req = Request.query.get_or_404(request_id)
    return jsonify(req.to_dict())

@admin_bp.route('/admin/requests/<int:request_id>/status', methods=['PUT'])
def update_request_status(request_id):
    if 'admin_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    new_status = data.get('status')
    admin_notes = data.get('adminNotes', '')
    
    # Mapear status do frontend para o backend
    status_mapping = {
        'accepted': 'Aceito',
        'rejected': 'Negado',
        'in_progress': 'Em Andamento',
        'completed': 'Concluído',
        'cancelled': 'Cancelado'
    }
    
    mapped_status = status_mapping.get(new_status, new_status)
    
    req = Request.query.get_or_404(request_id)
    req.status = mapped_status
    if admin_notes:
        req.admin_notes = admin_notes
    req.admin_id = session['admin_id']
    
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Status updated'})

@admin_bp.route('/admin/stats', methods=['GET'])
def get_admin_stats():
    if 'admin_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    total_requests = Request.query.count()
    pending_requests = Request.query.filter_by(status='Pendente').count()
    accepted_requests = Request.query.filter_by(status='Aceito').count()
    completed_requests = Request.query.filter_by(status='Concluído').count()
    rejected_requests = Request.query.filter_by(status='Negado').count()
    
    return jsonify({
        'total_requests': total_requests,
        'pending_requests': pending_requests,
        'accepted_requests': accepted_requests,
        'completed_requests': completed_requests,
        'rejected_requests': rejected_requests
    })

@admin_bp.route('/admin/init', methods=['POST'])
def init_admin():
    """Rota para criar um administrador inicial (apenas para desenvolvimento)"""
    data = request.get_json()
    username = data.get('username', 'admin')
    password = data.get('password', 'admin123')
    
    # Verificar se já existe um admin
    existing_admin = Admin.query.filter_by(username=username).first()
    if existing_admin:
        return jsonify({'success': False, 'message': 'Admin already exists'}), 400
    
    new_admin = Admin(username=username, password=password)
    db.session.add(new_admin)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Admin created successfully'})

