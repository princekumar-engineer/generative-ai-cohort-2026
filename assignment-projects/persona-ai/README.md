# 🪄 Persona AI — GenAI with JS 2026

An AI-powered conversational web application built for the **GenAI with JS Hackathon 2026**. The application uses the official **Google Gen AI SDK** with **Gemini 2.5 Flash** to simulate technical conversations with **Hitesh Choudhary** and **Piyush Garg**, reproducing their teaching styles, communication patterns, and personalities.

The project focuses on four primary goals:

- Accurate persona simulation
- Context-aware conversations
- Clean backend architecture
- Smooth and intuitive user experience

---

# 📌 Project Overview

Users can chat with two AI mentors:

- 👨‍🏫 Hitesh Choudhary
- 👨‍💻 Piyush Garg

Each mentor has a dedicated system prompt defining:

- Communication style
- Teaching methodology
- Vocabulary
- Tone
- Response length
- Domain expertise

Users can switch mentors at any time. When switching, the application automatically clears the previous conversation history to ensure complete persona isolation.

---

# 🚀 Features

### 🤖 AI Chat

- Powered by Google Gemini 2.5 Flash
- Official Google Gen AI SDK
- Context-aware conversations
- Multi-turn memory
- Fast responses

### 👨‍🏫 Dual Personas

Choose between:

- Hitesh Choudhary
- Piyush Garg

Each persona has:

- Unique greeting
- Individual teaching style
- Different vocabulary
- Separate personality
- Independent conversation context

---

### 🧠 Context Management

The application maintains an in-memory conversation history.

For every user message:

- Previous conversation is preserved
- Entire history is sent to Gemini
- AI generates context-aware responses

This enables natural follow-up questions and longer technical discussions.

---

### 🔄 Persona Isolation

Switching mentors automatically:

- Clears previous conversation history
- Starts a fresh conversation
- Prevents context leakage between mentors

This ensures Hitesh never remembers conversations with Piyush and vice versa.

---

### 💬 Interactive Chat UI

- Responsive layout
- Animated message bubbles
- Typing indicator
- Auto scrolling
- Dynamic mentor switching
- Dark theme interface

---

### 🔒 Basic Security

User messages are HTML-escaped before rendering to reduce XSS risks when displaying chat messages in the browser.

---

# 🛠️ Tech Stack

## Frontend

- HTML5
- Vanilla JavaScript
- Tailwind CSS v4
- Font Awesome

## Backend

- Node.js
- Express 5
- CORS
- dotenv

## AI

- Google Gemini 2.5 Flash
- Official @google/genai SDK

---

# 📂 Project Structure

```text
PERSONA-AI/
│
├── backend/
│   ├── .env
│   └── server.js
│
├── dist/
│   └── output.css
│
├── src/
│   ├── app.js
│   └── styles.css
│
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
└── README.md
```

---

# 🏗️ Architecture

```
Frontend (HTML + Tailwind + JavaScript)
                │
                ▼
      Express REST API
                │
                ▼
     Google Gen AI SDK
                │
                ▼
       Gemini 2.5 Flash
                │
                ▼
          AI Response
                │
                ▼
      Dynamic Chat Interface
```

---

# 🧠 Persona Data Collection & Preparation

The personas were designed using publicly available content from:

- Official websites
- Public YouTube videos
- Technical talks
- Blogs
- Social media posts
- Community interactions

No private or proprietary datasets were used.

## Hitesh Choudhary

The prompt models:

- Friendly mentoring
- Conversational Hinglish
- Calm explanations
- Practical guidance
- Motivational teaching
- Beginner-friendly approach
- Tea references
- Signature phrases such as:

  - Haan Ji
  - Dekhiye
  - Aap

The prompt also recommends relevant learning cohorts when users ask about matching topics.

---

## Piyush Garg

The prompt models:

- Professional communication
- Backend engineering mindset
- System design thinking
- Production-oriented development
- Practical explanations
- Direct technical guidance

The prompt emphasizes concise answers while remaining approachable and helpful.

---

# 🎯 Prompt Engineering Strategy

Each mentor is assigned an independent **System Instruction** rather than dynamically injecting large prompts every request.

The prompts define:

- Tone
- Language
- Personality
- Communication style
- Teaching philosophy
- Knowledge boundaries
- Response formatting

Both personas are instructed to:

- Keep normal conversations short (2–4 sentences)
- Produce detailed explanations only when explicitly requested
- Stay within their domain expertise
- Respond consistently throughout long conversations

---

# 🧠 Context Management

Conversation history is maintained inside the frontend using a dynamic array.

Workflow:

1. User submits a question.
2. The message is rendered immediately.
3. Conversation history is sent to the backend.
4. Backend converts history into Gemini's expected format.
5. Gemini generates a response.
6. Response is appended to history.

This enables:

- Multi-turn conversations
- Context preservation
- Follow-up questions
- Debugging discussions

---

# 🔄 Persona Switching

When users switch mentors:

- Conversation history is cleared
- Chat window resets
- Greeting message changes
- Active mentor UI updates
- New conversation starts

This prevents cross-persona memory leakage.

---

# 💬 Sample Conversations

## Hitesh Choudhary

**User**

> Sir communication skills improve kaise karu?

**AI**

> Haan ji, dekhiye communication bhi coding ki tarah practice se improve hoti hai. Roz thoda boliye, apni learning share kijiye aur uncomfortable situations se mat ghabraiye. Dheere dheere confidence automatically build ho jayega.

---

## Piyush Garg

**User**

> SQL ya MongoDB?

**AI**

> It depends on your use case. Relational data works well with SQL, while highly scalable document-based systems often benefit from MongoDB. Start by understanding your application's access patterns.

---

# 🎨 User Experience

The application provides:

- Responsive design
- Dark theme
- Animated message transitions
- Typing indicator
- Auto-scroll
- Clean sidebar navigation
- Simple mentor switching

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone <repository-url>
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Create Environment File

Inside the `backend` folder create:

```
.env
```

Add:

```env
GEMINI_API_KEY=YOUR_GOOGLE_AI_STUDIO_API_KEY
PORT=5000
```

---

## 4. Build Tailwind CSS

```bash
npx tailwindcss -i ./src/styles.css -o ./dist/output.css --watch
```

---

## 5. Start Backend

```bash
node backend/server.js
```

Backend:

```
http://localhost:5000
```

---

## 6. Launch Frontend

Open:

```
index.html
```

or use **Live Server** in VS Code.

---

# 📦 Main Dependencies

- @google/genai
- express
- cors
- dotenv
- tailwindcss
- postcss
- autoprefixer

---

# 📈 Evaluation Mapping

## ✅ Persona Accuracy (30 Marks)

- Separate system prompts
- Unique communication styles
- Persona-specific greetings
- Different teaching methodologies
- Consistent conversational behavior

---

## ✅ Conversation Quality (25 Marks)

- Context-aware conversations
- Multi-turn memory
- Relevant responses
- Follow-up understanding
- Independent persona memory

---

## ✅ Technical Implementation (25 Marks)

- Official Google Gen AI SDK
- Gemini 2.5 Flash
- Express backend
- REST API architecture
- Context formatting
- Clean frontend/backend separation

---

## ✅ User Experience (20 Marks)

- Responsive layout
- Smooth animations
- Typing indicator
- Easy mentor switching
- Auto-scrolling chat
- Dark modern interface

---

# 🔮 Future Improvements

Possible future enhancements include:

- Persistent chat history
- Streaming AI responses
- Markdown rendering
- Code syntax highlighting
- Export conversations
- Voice interaction
- Additional mentor personas

---

# 👨‍💻 Built With

- Google Gemini 2.5 Flash
- Google Gen AI SDK
- Node.js
- Express
- Tailwind CSS v4
- Vanilla JavaScript

---

# 📄 License

This project was developed for the **GenAI with JS 2026**.

The AI personas are inspired by the publicly available educational content of **Hitesh Choudhary** and **Piyush Garg**. The application is intended solely for educational and demonstration purposes and does not represent the real individuals.