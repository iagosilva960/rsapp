# Instruções para Deploy do Backend

## Visão Geral
O backend foi implementado usando Flask e precisa ser hospedado em um serviço que suporte Python. Recomendamos usar Render, Railway, ou Heroku.

## Estrutura do Backend
O backend está localizado na pasta `rsapp_backend/` e contém:
- `src/main.py` - Arquivo principal da aplicação Flask
- `src/models/` - Modelos de dados (SQLAlchemy)
- `src/routes/` - Rotas da API
- `requirements.txt` - Dependências Python

## Deploy no Render (Recomendado)

### 1. Preparação
1. Faça login no [Render](https://render.com)
2. Conecte sua conta GitHub
3. Crie um novo "Web Service"
4. Selecione o repositório `iagosilva960/rsapp`

### 2. Configurações do Render
- **Root Directory**: `rsapp_backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python src/main.py`
- **Environment**: `Python 3`

### 3. Variáveis de Ambiente
Configure as seguintes variáveis de ambiente no Render:
- `FLASK_ENV=production`
- `SECRET_KEY=sua_chave_secreta_aqui`

### 4. Atualizar Frontend
Após o deploy do backend, atualize a URL da API no frontend:
1. Edite o arquivo `src/App.jsx`
2. Substitua a URL do backend na variável `API_BASE_URL`
3. Use a URL fornecida pelo Render (ex: `https://seu-app.onrender.com/api`)

## Deploy no Railway

### 1. Preparação
1. Faça login no [Railway](https://railway.app)
2. Conecte sua conta GitHub
3. Crie um novo projeto
4. Selecione o repositório `iagosilva960/rsapp`

### 2. Configurações
- Railway detectará automaticamente que é um projeto Python
- Certifique-se de que o `requirements.txt` está na raiz do projeto backend

### 3. Variáveis de Ambiente
- `FLASK_ENV=production`
- `SECRET_KEY=sua_chave_secreta_aqui`

## Configuração do Banco de Dados

### SQLite (Desenvolvimento)
O projeto usa SQLite por padrão, que é adequado para desenvolvimento e pequenos projetos.

### PostgreSQL (Produção)
Para produção, recomenda-se usar PostgreSQL:

1. Adicione `psycopg2-binary` ao `requirements.txt`
2. Configure a variável de ambiente `DATABASE_URL`
3. Atualize `src/main.py` para usar a URL do banco:

```python
import os
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
```

## Credenciais Administrativas

### Usuário Padrão
- **Usuário**: admin
- **Senha**: admin123

### Criando Novos Administradores
Use a rota `/api/admin/init` para criar novos administradores:

```bash
curl -X POST https://sua-api.com/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"username": "novo_admin", "password": "senha_segura"}'
```

## Testando o Backend

### Health Check
```bash
curl https://sua-api.com/api/requests/health
```

### Login Administrativo
```bash
curl -X POST https://sua-api.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## Integração com Frontend

Após o deploy do backend, atualize o frontend:

1. Edite `src/App.jsx`
2. Atualize a variável `API_BASE_URL`:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://sua-api-backend.onrender.com/api'  // URL do seu backend
  : 'http://localhost:5001/api'
```

3. Faça o build e deploy do frontend atualizado

## Monitoramento

### Logs
- Render: Acesse a aba "Logs" no dashboard
- Railway: Acesse a aba "Deployments" e clique em "View Logs"

### Métricas
- Monitore o uso de CPU e memória
- Configure alertas para downtime
- Verifique regularmente os logs de erro

## Segurança

### Recomendações
1. Use HTTPS sempre
2. Configure CORS adequadamente
3. Use senhas fortes para administradores
4. Monitore tentativas de login suspeitas
5. Mantenha as dependências atualizadas

### Backup
- Configure backup automático do banco de dados
- Mantenha cópias de segurança das configurações
- Documente o processo de recuperação

## Troubleshooting

### Problemas Comuns
1. **Erro 500**: Verifique os logs para detalhes
2. **CORS Error**: Configure CORS no backend
3. **Database Error**: Verifique a conexão com o banco
4. **Authentication Error**: Verifique as credenciais

### Suporte
Para suporte técnico, verifique:
1. Logs do servidor
2. Configurações de ambiente
3. Status do banco de dados
4. Conectividade de rede

