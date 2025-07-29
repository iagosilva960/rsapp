# Como Gerar um Personal Access Token (PAT) no GitHub

Um Personal Access Token (PAT) é uma alternativa para usar sua senha do GitHub para autenticação ao usar a API do GitHub ou a linha de comando (Git). É mais seguro porque você pode conceder permissões específicas e revogá-lo a qualquer momento sem alterar sua senha principal.

Siga estes passos para gerar um PAT:

1.  **Acesse as Configurações do GitHub**: Faça login na sua conta GitHub no navegador.
2.  No canto superior direito de qualquer página, clique na sua foto de perfil e, em seguida, clique em **"Settings"** (Configurações).
3.  Na barra lateral esquerda, clique em **"Developer settings"** (Configurações do desenvolvedor).
4.  Na barra lateral esquerda, clique em **"Personal access tokens"** (Tokens de acesso pessoal) e, em seguida, clique em **"Tokens (classic)"**.
5.  Clique em **"Generate new token"** (Gerar novo token) e selecione **"Generate new token (classic)"**.
6.  **Dê um nome ao seu token**: No campo "Note" (Nota), dê um nome descritivo ao seu token (por exemplo, "rsapp-deploy" ou "Manus-Agent-Access").
7.  **Defina a expiração**: Escolha um período de expiração para o token. Para maior segurança, é recomendável definir um período limitado (por exemplo, 30 dias).
8.  **Selecione os escopos (permissões)**: Esta é a parte mais importante. Para que o agente possa fazer push para o seu repositório, você precisará selecionar os seguintes escopos:
    *   `repo` (para acesso total a repositórios privados e públicos)
        *   `repo:status`
        *   `repo_deployment`
        *   `public_repo`
        *   `repo:invite`

    Se você quiser apenas acesso a repositórios públicos, `public_repo` pode ser suficiente, mas para garantir que o agente possa fazer o push, `repo` é o mais seguro.

9.  **Gere o token**: Clique no botão **"Generate token"** (Gerar token) na parte inferior da página.
10. **Copie o token**: **COPIE O TOKEN IMEDIATAMENTE!** O GitHub só mostrará o token uma vez. Se você perder, terá que gerar um novo.

Depois de gerar e copiar o token, você pode fornecê-lo ao agente quando ele solicitar as credenciais para o push. Lembre-se de que este token é como uma senha, então mantenha-o seguro e não o compartilhe publicamente.

