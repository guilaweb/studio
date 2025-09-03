# MUNITU: Plataforma Geoespacial Colaborativa para Governança Urbana

**MUNITU** é uma plataforma de governação digital inovadora, desenhada para ser a ponte entre cidadãos, empresas e administrações municipais. Utilizando um Sistema de Informação Geográfica (SIG) como núcleo, a plataforma cria um ecossistema digital transparente e eficiente para o desenvolvimento urbano sustentável.

O nome **MUNITU** é uma fusão da palavra "Município" com "Tu", representando a nossa filosofia central: a cidade é construída por si e para si.

---

## 🚀 Funcionalidades Principais

A plataforma está dividida em dois grandes eixos, servindo tanto o cidadão como o gestor municipal com ferramentas poderosas e integradas.

### Para o Cidadão:
*   **Fiscalização Cívica:** Reporte incidentes georreferenciados como buracos na via, falhas de iluminação ou problemas de saneamento, e acompanhe a sua resolução.
*   **Licenciamento Digital:** Submeta e acompanhe processos de licenciamento de obras de forma 100% digital, desde a consulta do lote até à emissão da licença.
*   **Marketplace Imobiliário:** Um portal seguro para transações de terrenos e imóveis, enriquecido com o "Painel de Confiança MUNITU" que verifica o estado legal e fiscal de cada propriedade.
*   **Gestão de Croquis:** Crie, gira e partilhe croquis de localização detalhados para facilitar entregas, visitas ou simplesmente para partilhar a sua morada.

### Para a Administração Municipal:
*   **Painel de Gestão Inteligente (Dashboard):** Uma visão 360º das operações da cidade com KPIs, mapas de calor, e sumários executivos gerados por Inteligência Artificial para apoiar a tomada de decisão.
*   **Gestão de Processos Urbanos:** Analise e gira fluxos de trabalho para licenciamentos, verificação de imóveis e fiscalização ambiental, com o apoio de IA para análise de conformidade.
*   **Gestão de Equipa e Despacho:** Visualize as suas equipas no terreno em tempo real, atribua tarefas de forma inteligente (com sugestões de IA) e otimize rotas.
*   **Comunicação Direta:** Envie anúncios e alertas oficiais georreferenciados para bairros ou zonas específicas da cidade.

---

## 🛠️ Stack Tecnológica

A MUNITU foi construída sobre uma pilha de tecnologias modernas, robustas e escaláveis.

*   **Framework:** [Next.js](https://nextjs.org/) (com App Router)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Framework:** [React](https://react.dev/)
*   **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
*   **Base de Dados & Backend:** [Firebase](https://firebase.google.com/) (Firestore, Authentication, Storage)
*   **Inteligência Artificial:** [Google Genkit](https://firebase.google.com/docs/genkit) (orquestrando modelos Gemini)
*   **Geoespacial:** [Google Maps Platform](https://mapsplatform.google.com/)

---

## ⚙️ Configuração e Execução do Projeto

Para executar este projeto localmente, siga os passos abaixo.

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Uma conta Firebase

### 1. Clonar o Repositório
```bash
git clone https://github.com/SEU-USUARIO/munitu.git
cd munitu
```

### 2. Instalar Dependências
```bash
npm install
# ou
yarn install
```

### 3. Configurar Variáveis de Ambiente
Crie um ficheiro `.env` na raiz do projeto e adicione as suas credenciais do Firebase. Pode encontrar estas credenciais na consola do seu projeto Firebase em `Definições do Projeto > As suas apps > Configuração SDK`.

```plaintext
# Ficheiro: .env

# Firebase Client SDK Keys
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# Gemini API Key (para funcionalidades de IA com Genkit)
GEMINI_API_KEY=AIza...
```
**Importante:** Certifique-se que a API do Google Maps (com as bibliotecas `Maps JavaScript API`, `Places API`, `Drawing API`, `Geocoding API`) e a API do Gemini estão ativas na sua consola Google Cloud.

### 4. Executar a Aplicação
Para iniciar o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```
A aplicação estará disponível em `http://localhost:9002`.

Para iniciar o servidor de desenvolvimento do Genkit (para testar as flows de IA):
```bash
npm run genkit:dev
```

---

## 🤝 Contribuir

Este projeto é de código aberto e as contribuições são bem-vindas. Sinta-se à vontade para abrir uma *issue* para reportar um bug ou sugerir uma nova funcionalidade.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o ficheiro `LICENSE` para mais detalhes.
