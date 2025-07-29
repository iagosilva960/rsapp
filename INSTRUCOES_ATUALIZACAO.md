# Instruções para Atualização do Projeto Guincho RS

## Resumo das Alterações Implementadas

✅ **Coleta de CPF e Nome**: Agora o cliente deve informar seu nome completo e CPF antes de solicitar o guincho.

✅ **Opção de Guincho para Terceiros**: Adicionada opção para solicitar guincho para outra pessoa, com campos adicionais para nome, CPF e telefone da pessoa.

✅ **Logo Atualizada**: A logo agora mostra apenas "RS" e o nome do app foi alterado para "Guincho RS 24hrs".

✅ **Instalação Automática**: O prompt para adicionar à tela inicial agora aparece automaticamente quando o cliente abre o site.

## Arquivos Modificados

- `App.jsx` - Componente principal com todas as novas funcionalidades
- `WebInterface.jsx` - Interface web (sem alterações)
- `App.css` - Estilos (sem alterações)
- `manifest.json` - Metadados do PWA atualizados
- `index.html` - Título e metadados atualizados
- `icon-192.png` - Novo ícone 192x192 com apenas "RS"
- `icon-512.png` - Novo ícone 512x512 com apenas "RS"

## Como Atualizar no GitHub

1. **Faça backup dos arquivos atuais** (opcional, mas recomendado)

2. **Clone o repositório localmente** (se ainda não tiver):
   ```bash
   git clone https://github.com/iagosilva960/rsapp.git
   cd rsapp
   ```

3. **Substitua os arquivos modificados**:
   - Copie todos os arquivos desta pasta para o repositório local
   - Substitua os arquivos existentes pelos novos

4. **Commit e push das alterações**:
   ```bash
   git add .
   git commit -m "Implementa coleta de CPF/nome, opção para terceiros, nova logo RS e instalação automática"
   git push origin main
   ```

## Como Atualizar no Netlify

O Netlify está conectado ao seu repositório GitHub, então as alterações serão automaticamente implantadas após o push para o GitHub.

### Verificação da Implantação:

1. Acesse: https://app.netlify.com/projects/gruporsapp/overview
2. Aguarde a conclusão do build (geralmente 1-3 minutos)
3. Teste o site atualizado

### Se houver problemas:

1. Verifique os logs de build no Netlify
2. Certifique-se de que todos os arquivos foram enviados corretamente
3. Faça um novo deploy manual se necessário

## Funcionalidades Testadas

✅ **Formulário de Solicitação**: Todos os campos obrigatórios funcionando
✅ **Validação de Dados**: CPF, nome e telefones são validados
✅ **Opção de Terceiros**: Campos condicionais aparecem corretamente
✅ **Logo e Nome**: Atualizados em todas as telas
✅ **Responsividade**: Interface funciona em desktop e mobile

## Observações Importantes

- O prompt de instalação automática funciona apenas em navegadores compatíveis (Chrome, Edge, etc.)
- Para iOS, será exibida uma mensagem com instruções manuais
- Todos os dados coletados são enviados para a interface web da empresa
- A funcionalidade de histórico mantém o registro das solicitações

## Suporte

Se houver algum problema durante a atualização, verifique:
1. Se todos os arquivos foram substituídos corretamente
2. Se o commit foi feito com sucesso no GitHub
3. Se o Netlify completou o build sem erros

