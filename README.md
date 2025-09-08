
# MUNITU: Plataforma Geoespacial Colaborativa para Governança Urbana

**MUNITU** é uma plataforma de governação digital inovadora, desenhada para ser a ponte entre cidadãos, empresas e administrações municipais. Utilizando um Sistema de Informação Geográfica (SIG) como núcleo, a plataforma cria um ecossistema digital transparente e eficiente para o desenvolvimento urbano sustentável.

O nome **MUNITU** é uma fusão da palavra "Município" com "Tu", representando a nossa filosofia central: a cidade é construída por si e para si.

---

## 🚀 Funcionalidades Chave

A plataforma está dividida em módulos que servem diferentes utilizadores, desde o cidadão individual ao gestor municipal, criando um ecossistema integrado.

### Para o Cidadão e Empresas
*   **Fiscalização Cívica:** Reporte incidentes georreferenciados como buracos na via, falhas de iluminação, fugas de água ou problemas de saneamento.
*   **Monitoramento Comunitário:** Contribua para o bem comum reportando o estado de Caixas Eletrônicos (ATMs), ajudando todos a saber onde há dinheiro disponível.
*   **Licenciamento Digital:** Submeta e acompanhe processos de licenciamento de obras de forma 100% digital, desde a consulta do lote até à emissão da licença.
*   **Gestão de Imóveis e Marketplace:** Registe os seus terrenos e imóveis, submeta-os para verificação oficial (Selo de Confiança Munitu) e anuncie-os no nosso marketplace seguro.
*   **Gestão de Croquis e Pontos de Interesse (POIs):** Crie, gira e partilhe croquis de localização detalhados para clientes, fornecedores e entregas. Importe listas de locais em massa a partir de CSV.

### Para a Administração Municipal e Gestores de Frota
*   **Painel de Gestão Inteligente (Dashboard):** Uma visão 360º das operações da cidade com KPIs, mapas de calor, e sumários executivos gerados por Inteligência Artificial para apoiar a tomada de decisão.
*   **Gestão de Processos Urbanos:**
    *   **Licenciamento:** Analise e gira fluxos de trabalho para licenciamentos de construção.
    *   **Verificação de Imóveis:** Valide a documentação e o estado de propriedades submetidas pelos cidadãos.
    *   **Fiscalização Ambiental:** Monitore e gira reportes de poluição.
*   **Gestão de Equipa e Frota:**
    *   **Monitoramento em Tempo Real:** Visualize as suas equipas e veículos no terreno em tempo real.
    *   **Despacho Inteligente:** Atribua tarefas com sugestões de técnicos baseadas em proximidade, disponibilidade e workload.
    *   **Manutenção Preditiva e Preventiva:** Crie planos de manutenção e receba alertas automáticos de IA sobre potenciais avarias.
    *   **Análise de Custos:** Registe abastecimentos e manutenções, e analise a performance financeira da frota.
*   **Planeamento e Território:**
    *   **Planeamento Urbano 3D:** Visualize a cidade em 3D, analise o potencial solar de edifícios e simule o impacto de sombreamento de novas construções.
    *   **Gestão de Recursos Hídricos:** Mapeie e analise a rede hidrográfica, simule cenários e identifique potencialidades.
    *   **Gestão de Camadas (GIS):** Integre dados de serviços externos (WMS, WFS) diretamente no mapa da plataforma.
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
- [npm](https://www.npmjs.com/)
- Uma conta Firebase com um projeto web criado.

### 1. Clonar o Repositório
```bash
git clone https://github.com/SEU-USUARIO/munitu.git
cd munitu
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um ficheiro `.env` na raiz do projeto e adicione as suas credenciais. Pode encontrar as credenciais do Firebase na consola do seu projeto em `Definições do Projeto > As suas apps > Configuração SDK`.

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
# É crucial que esta chave tenha as APIs 'Maps JavaScript API', 'Places API', 
# 'Drawing API', 'Geocoding API', 'Directions API' e 'Solar API' ativas.
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# (Opcional) Google Maps 3D Map ID
# Para as funcionalidades de Planeamento Urbano 3D. Requer ativação dos "Map Tiles".
NEXT_PUBLIC_GOOGLE_MAPS_3D_MAP_ID=seu-map-id

# Gemini API Key (para funcionalidades de IA com Genkit)
GEMINI_API_KEY=AIza...
```
**Importante:** Certifique-se que as APIs necessárias da Google Cloud estão ativas e associadas à sua chave.

### 4. Executar a Aplicação
Para iniciar o servidor de desenvolvimento:
```bash
npm run dev
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
