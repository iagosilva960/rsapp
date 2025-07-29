# Instruções para Gerar APK - Grupo RS Guincho

## Pré-requisitos
- Android Studio instalado
- Java 17 ou superior
- Android SDK 35

## Passos para Gerar o APK

### 1. Configurar Ambiente
```bash
# Definir variáveis de ambiente
export ANDROID_HOME=/caminho/para/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
export JAVA_HOME=/caminho/para/java-17
```

### 2. Instalar Dependências Android
```bash
sdkmanager "platforms;android-35" "build-tools;35.0.0" "platform-tools"
```

### 3. Construir o Projeto
```bash
cd grupo-rs-guincho
pnpm run build
npx cap sync android
```

### 4. Gerar APK
```bash
cd android
./gradlew assembleDebug
```

### 5. Localizar o APK
O APK será gerado em:
`android/app/build/outputs/apk/debug/app-debug.apk`

## Alternativa: PWA (Progressive Web App)

O aplicativo já está configurado como PWA e pode ser instalado diretamente do navegador:

1. Acesse o aplicativo no navegador móvel
2. Toque no menu do navegador
3. Selecione "Adicionar à tela inicial" ou "Instalar app"

## Estrutura do Projeto

- **Frontend**: React + Vite + Tailwind CSS
- **Mobile**: Capacitor para geração de APK
- **PWA**: Manifest e service worker configurados
- **Integração Web**: Componente preparado para conectar com API

## Funcionalidades Implementadas

✅ Solicitação de guincho com localização GPS
✅ Histórico de solicitações
✅ Interface responsiva para mobile
✅ Integração preparada para interface web
✅ Design baseado na identidade visual da empresa
✅ PWA instalável
✅ Estrutura para geração de APK

## Próximos Passos

1. Configurar ambiente Android completo
2. Gerar APK de produção assinado
3. Implementar API backend para integração web
4. Adicionar notificações push
5. Implementar rastreamento em tempo real

