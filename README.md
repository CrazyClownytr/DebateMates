# 🧠 AI Debat Generator met LangChain & Azure OpenAI

Een full-stack AI-applicatie waarmee gebruikers een stelling kunnen invoeren en een automatisch debat krijgen tussen twee bots: ProBot (voor) en ContraBot (tegen). Gebruikt LangChain, Azure OpenAI en FAISS vector stores.

## 🗂️ Projectstructuur
/client      --> Front-end (HTML, CSS, JS)
/server      --> Back-end met Express en LangChain
/public      --> Bevat `wwe-text.txt` voor embeddings

## ⚙️ Installatie

### 1. Clone de repo

```bash
git clone https://github.com/CrazyClownytr/AIDebateMates.git
cd AIDebateMates


### 2. Installeer dependencies
in de `/server` map installeren:

#### Server:
cd server
npm install

### 3. `.env` instellen

In de `/server` map, maak een `.env` bestand aan met je Azure OpenAI gegevens:
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_API_VERSION=2023-05-15
AZURE_DEPLOYMENT_NAME=your-deployment-name
AZURE_EMBEDDING_DEPLOYMENT_NAME=your-embedding-deployment


> ⚠️ Voeg `.env` toe aan je `.gitignore` zodat deze niet gepusht wordt naar GitHub.

## ▶️ Run het project

### 1. Vector Store genereren (eenmalig)

Voer `embedding.js` uit in de server folder om je FAISS vector store op te bouwen:

npm run embed

### 2. Start de server

node server.js

De server draait op: `http://localhost:3000`

### 3. Open de client

Open `/client/index.html` in je browser. Gebruik eventueel Live Server (bijv. via VSCode).

## Functies

- AI-debat met meerdere rondes tussen ProBot & ContraBot
- Contextueel antwoorden via vectorstore en tekstdocument (`wwe-text.txt`)
- Stem wie het debat wint
- Ondersteunt ook algemene AI-vragen en grappen (optioneel via `/ask` of `/joke` routes)

## Mogelijke issues

### `node_modules` niet gepusht?
Dat klopt! `node_modules` en `.env` zijn **uitgesloten via `.gitignore`**. Zorg ervoor dat je zelf `npm install` uitvoert.

### LangChain FAISS error?
Zorg dat je `faiss-cpu` correct hebt geïnstalleerd of gebruik een JS-compatibele FAISS implementatie zoals in dit project via `@langchain/community`.

## Nodige Packages

**Back-end (server)**:
- `express`
- `cors`
- `dotenv`
- `@langchain/openai`
- `@langchain/community`
- `langchain`

**Front-end (client)**:
- Pure HTML/CSS/JS (geen buildstap nodig)
