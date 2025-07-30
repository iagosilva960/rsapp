from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
from src.models.request import db, TowingRequest, AdminUser
from datetime import datetime
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_user_id' not in session:
            return jsonify({'success': False, 'message': 'Acesso negado'}), 401
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username e senha são obrigatórios'}), 400
        
        # Verificar se é o usuário padrão
        if username == 'admin' and password == 'admin123':
            # Criar usuário admin padrão se não existir
            admin_user = AdminUser.query.filter_by(username='admin').first()
            if not admin_user:
                admin_user = AdminUser(
                    username='admin',
                    password_hash=generate_password_hash('admin123')
                )
                db.session.add(admin_user)
                db.session.commit()
            
            # Atualizar último login
            admin_user.last_login = datetime.utcnow()
            db.session.commit()
            
            # Criar sessão
            session['admin_user_id'] = admin_user.id
            session['admin_username'] = admin_user.username
            
            return jsonify({
                'success': True,
                'message': 'Login realizado com sucesso',
                'user': admin_user.to_dict()
            })
        
        # Verificar usuário no banco de dados
        admin_user = AdminUser.query.filter_by(username=username).first()
        if admin_user and check_password_hash(admin_user.password_hash, password):
            if not admin_user.is_active:
                return jsonify({'success': False, 'message': 'Usuário inativo'}), 401
            
            # Atualizar último login
            admin_user.last_login = datetime.utcnow()
            db.session.commit()
            
            # Criar sessão
            session['admin_user_id'] = admin_user.id
            session['admin_username'] = admin_user.username
            
            return jsonify({
                'success': True,
                'message': 'Login realizado com sucesso',
                'user': admin_user.to_dict()
            })
        
        return jsonify({'success': False, 'message': 'Credenciais inválidas'}), 401
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro interno: {str(e)}'}), 500

@admin_bp.route('/admin/logout', methods=['POST'])
@admin_required
def admin_logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logout realizado com sucesso'})

@admin_bp.route('/admin/status', methods=['GET'])
def admin_status():
    if 'admin_user_id' in session:
        admin_user = AdminUser.query.get(session['admin_user_id'])
        if admin_user and admin_user.is_active:
            return jsonify({
                'logged_in': True,
                'user': admin_user.to_dict()
            })
    
    return jsonify({'logged_in': False})

@admin_bp.route('/requests/list', methods=['GET'])
@admin_required
def list_requests():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status_filter = request.args.get('status', None)
        
        query = TowingRequest.query
        
        if status_filter:
            query = query.filter(TowingRequest.status == status_filter)
        
        requests_paginated = query.order_by(TowingRequest.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'requests': [req.to_dict() for req in requests_paginated.items],
            'total': requests_paginated.total,
            'pages': requests_paginated.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro ao listar solicitações: {str(e)}'}), 500

@admin_bp.route('/requests/stats', methods=['GET'])
@admin_required
def request_stats():
    try:
        total_requests = TowingRequest.query.count()
        pending_requests = TowingRequest.query.filter_by(status='pending').count()
        accepted_requests = TowingRequest.query.filter_by(status='accepted').count()
        rejected_requests = TowingRequest.query.filter_by(status='rejected').count()
        completed_requests = TowingRequest.query.filter_by(status='completed').count()
        
        # Estatísticas por período (últimos 30 dias)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_requests = TowingRequest.query.filter(
            TowingRequest.created_at >= thirty_days_ago
        ).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total_requests,
                'pending': pending_requests,
                'accepted': accepted_requests,
                'rejected': rejected_requests,
                'completed': completed_requests,
                'recent_30_days': recent_requests
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro ao obter estatísticas: {str(e)}'}), 500

@admin_bp.route('/requests/<int:request_id>/status', methods=['PUT'])
@admin_required
def update_request_status(request_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        admin_notes = data.get('adminNotes', '')
        
        if new_status not in ['pending', 'accepted', 'rejected', 'completed']:
            return jsonify({'success': False, 'message': 'Status inválido'}), 400
        
        towing_request = TowingRequest.query.get(request_id)
        if not towing_request:
            return jsonify({'success': False, 'message': 'Solicitação não encontrada'}), 404
        
        towing_request.status = new_status
        towing_request.admin_notes = admin_notes
        towing_request.admin_user = session.get('admin_username')
        towing_request.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Status atualizado com sucesso',
            'request': towing_request.to_dict()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro ao atualizar status: {str(e)}'}), 500

@admin_bp.route('/requests/<int:request_id>', methods=['GET'])
@admin_required
def get_request_details(request_id):
    try:
        towing_request = TowingRequest.query.get(request_id)
        if not towing_request:
            return jsonify({'success': False, 'message': 'Solicitação não encontrada'}), 404
        
        return jsonify({
            'success': True,
            'request': towing_request.to_dict()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro ao obter detalhes: {str(e)}'}), 500

