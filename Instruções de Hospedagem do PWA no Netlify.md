# Instruções de Hospedagem do PWA no Netlify

O Netlify é uma plataforma excelente para hospedar Progressive Web Apps (PWAs) devido à sua facilidade de uso, integração contínua e suporte a HTTPS.

Siga os passos abaixo para fazer o deploy do seu aplicativo `grupo-rs-guincho` no Netlify:

## Pré-requisitos

1.  **Conta Netlify**: Certifique-se de ter uma conta no Netlify. Você pode se cadastrar gratuitamente em [app.netlify.com/signup](https://app.netlify.com/signup).
2.  **Repositório Git**: Seu projeto `grupo-rs-guincho` deve estar em um repositório Git (GitHub, GitLab, Bitbucket). Se ainda não estiver, inicialize um e faça o commit dos seus arquivos.

    ```bash
    cd grupo-rs-guincho
    git init
    git add .
    git commit -m "Initial commit for Grupo RS Guincho PWA"
    git branch -M main
    git remote add origin <URL_DO_SEU_REPOSITORIO_GIT>
    git push -u origin main
    ```

## Passos para o Deploy no Netlify

### 1. Conectar seu Repositório Git ao Netlify

1.  Faça login na sua conta Netlify ([app.netlify.com](https://app.netlify.com)).
2.  No painel principal, clique em **"Add new site"** (Adicionar novo site) e selecione **"Import an existing project"** (Importar um projeto existente).
3.  Escolha seu provedor Git (GitHub, GitLab, Bitbucket, etc.) e autorize o Netlify a acessar seus repositórios.
4.  Na lista de repositórios, encontre e selecione o repositório do seu projeto `grupo-rs-guincho`.

### 2. Configurar as Opções de Deploy

Após selecionar o repositório, o Netlify tentará detectar automaticamente as configurações de build. Verifique e, se necessário, ajuste as seguintes opções:

*   **Owner**: Sua conta ou organização Git.
*   **Repository**: O repositório `grupo-rs-guincho`.
*   **Branch to deploy**: `main` (ou a branch que você usa para deploy).
*   **Base directory**: Deixe em branco ou `./` se o seu projeto estiver na raiz do repositório. Se o projeto estiver em uma subpasta, como `app/`, insira `app/`.
*   **Build command**: `pnpm run build` (ou `npm run build` se você usa npm).
*   **Publish directory**: `dist` (esta é a pasta onde o Vite coloca os arquivos de build).

    *Observação*: O Netlify geralmente detecta `dist` automaticamente para projetos Vite.

### 3. Fazer o Deploy do Site

1.  Clique no botão **"Deploy site"** (Fazer deploy do site).
2.  O Netlify iniciará o processo de build e deploy. Você pode acompanhar o progresso na seção **"Deploys"** do seu site.
3.  Uma vez que o deploy for concluído, o Netlify fornecerá uma URL pública (ex: `https://seu-site-aleatorio.netlify.app`). Você pode personalizar este domínio posteriormente nas configurações do site.

### 4. Testar o PWA

1.  Acesse a URL fornecida pelo Netlify no navegador do seu celular.
2.  O navegador deve reconhecer que é um PWA. Dependendo do navegador e do sistema operacional, você verá um prompt para "Adicionar à tela inicial" ou "Instalar aplicativo".
3.  Clique nesta opção para instalar o PWA no seu dispositivo. Ele aparecerá como um aplicativo nativo na sua tela inicial.

## Próximos Passos (Opcional)

*   **Domínio Personalizado**: Configure um domínio personalizado (ex: `app.gruporsbrasil.com`) nas configurações do Netlify.
*   **Variáveis de Ambiente**: Se o seu aplicativo precisar de variáveis de ambiente (por exemplo, para conectar a uma API backend), configure-as no Netlify em `Site settings > Build & deploy > Environment`.
*   **Integração Contínua**: Cada vez que você fizer um `git push` para a branch configurada (geralmente `main`), o Netlify automaticamente fará um novo build e deploy do seu site, garantindo que seu PWA esteja sempre atualizado.

