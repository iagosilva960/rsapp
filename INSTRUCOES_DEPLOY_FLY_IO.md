# Instruções para Deploy no Fly.io

## Visão Geral
O backend será hospedado no Fly.io, que oferece excelente suporte para aplicações Python/Flask.

## Pré-requisitos
1. Conta no [Fly.io](https://fly.io/)
2. Login com GitHub já configurado
3. CLI do Fly.io instalado (flyctl)

## Estrutura do Projeto para Fly.io

### 1. Arquivo fly.toml
Crie o arquivo `fly.toml` na pasta `rsapp_backend/`:

```toml
app = "grupors-guincho-backend"
primary_region = "gru"

[build]

[env]
  FLASK_ENV = "production"
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[http_service.checks]]
  interval = "10s"
  grace_period = "5s"
  method = "GET"
  path = "/api/requests/health"
  protocol = "http"
  timeout = "2s"

[processes]
  app = "python src/main.py"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
</toml>

### 2. Dockerfile
Crie o arquivo `Dockerfile` na pasta `rsapp_backend/`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY . .

# Criar diretório para banco de dados
RUN mkdir -p src/database

# Expor porta
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["python", "src/main.py"]
```

### 3. Atualizar main.py
Modifique o arquivo `src/main.py` para usar a porta do Fly.io:

```python
import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.admin import admin_bp
from src.routes.requests import requests_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
CORS(app, origins=["https://gruporsapp.netlify.app", "http://localhost:3000"])
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api')
app.register_blueprint(requests_bp, url_prefix='/api')

# Database configuration
database_url = os.environ.get('DATABASE_URL')
if database_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()
    
    # Criar admin padrão se não existir
    from src.models.admin import Admin
    admin = Admin.query.filter_by(username='admin').first()
    if not admin:
        new_admin = Admin(username='admin', password='admin123')
        db.session.add(new_admin)
        db.session.commit()
        print("Admin padrão criado: admin/admin123")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "Backend API is running", 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
```

## Passos para Deploy

### 1. Preparar o Backend
```bash
cd rsapp_backend
```

### 2. Instalar Fly CLI (se necessário)
```bash
curl -L https://fly.io/install.sh | sh
```

### 3. Login no Fly.io
```bash
flyctl auth login
```
Isso abrirá o navegador para login com GitHub.

### 4. Inicializar a Aplicação
```bash
flyctl launch --no-deploy
```
- Escolha um nome para a app (ex: grupors-guincho-backend)
- Selecione a região (gru - São Paulo)
- Não configure PostgreSQL por enquanto (use SQLite)
- Não faça deploy ainda

### 5. Configurar Variáveis de Ambiente
```bash
flyctl secrets set SECRET_KEY="sua_chave_secreta_muito_segura_aqui"
flyctl secrets set FLASK_ENV="production"
```

### 6. Deploy da Aplicação
```bash
flyctl deploy
```

### 7. Verificar Status
```bash
flyctl status
flyctl logs
```

## Configuração do Frontend

Após o deploy bem-sucedido, atualize o frontend para usar a URL do Fly.io:

### 1. Obter URL da Aplicação
```bash
flyctl info
```
A URL será algo como: `https://grupors-guincho-backend.fly.dev`

### 2. Atualizar App.jsx
Edite o arquivo `src/App.jsx` e atualize a URL da API:

```javascript
// URL da API do backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://grupors-guincho-backend.fly.dev/api'  // Substitua pela sua URL do Fly.io
  : 'http://localhost:5001/api'
```

### 3. Rebuild e Deploy do Frontend
```bash
npm run build
```

Depois faça o deploy no Netlify através do GitHub.

## Comandos Úteis do Fly.io

### Monitoramento
```bash
flyctl logs                    # Ver logs em tempo real
flyctl status                  # Status da aplicação
flyctl info                    # Informações da aplicação
```

### Gerenciamento
```bash
flyctl scale count 1           # Definir número de instâncias
flyctl scale memory 512        # Definir memória (MB)
flyctl restart                 # Reiniciar aplicação
```

### Banco de Dados
```bash
flyctl ssh console             # Acessar container
flyctl volumes list            # Listar volumes
```

## Configuração de Domínio Personalizado (Opcional)

### 1. Adicionar Domínio
```bash
flyctl certs add seu-dominio.com
```

### 2. Configurar DNS
Adicione um registro CNAME no seu provedor DNS:
- Nome: api (ou backend)
- Valor: grupors-guincho-backend.fly.dev

### 3. Atualizar Frontend
Atualize a URL da API no frontend para usar seu domínio personalizado.

## Backup e Segurança

### 1. Backup do Banco
```bash
flyctl ssh console
# Dentro do container:
cp src/database/app.db /tmp/backup.db
```

### 2. Variáveis de Ambiente Seguras
```bash
flyctl secrets set DATABASE_URL="sua_url_do_banco"
flyctl secrets set SECRET_KEY="chave_muito_segura"
```

### 3. Monitoramento
- Configure alertas no dashboard do Fly.io
- Monitore logs regularmente
- Verifique métricas de performance

## Troubleshooting

### Problemas Comuns
1. **App não inicia**: Verifique logs com `flyctl logs`
2. **Erro de porta**: Certifique-se de usar PORT=8080
3. **CORS Error**: Verifique configuração de CORS no main.py
4. **Database Error**: Verifique permissões de escrita

### Comandos de Debug
```bash
flyctl ssh console             # Acessar container
flyctl logs --app sua-app      # Logs específicos
flyctl doctor                  # Diagnóstico
```

## URLs Importantes

Após o deploy, suas URLs serão:
- **Backend API**: `https://grupors-guincho-backend.fly.dev/api`
- **Health Check**: `https://grupors-guincho-backend.fly.dev/api/requests/health`
- **Admin Login**: `https://grupors-guincho-backend.fly.dev/api/admin/login`

## Credenciais Padrão
- **Usuário**: admin
- **Senha**: admin123

**IMPORTANTE**: Altere a senha padrão após o primeiro login!

