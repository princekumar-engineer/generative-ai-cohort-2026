const baseURL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/chat"
    : "/api/chat";

// --- Persona Style & Static Configuration ---
const personaEngine = {
  hitesh: {
    fullName: "Hitesh Choudhary",
    title: "Chatting with Hitesh Choudhary",
    accentClass: "amber",
    greeting: "Haanji! 👋 Kaise ho aap? Batao, aaj kya baat karni hai?"
  },

  piyush: {
  fullName: "Piyush Garg",
  title: "Chatting with Piyush Garg",
  accentClass: "cyan",
  greeting: "Hey there, welcome back. Batao, kya puchna hai? Aaj kis topic pe baat karein ya kya build karein?"
}
};

let activeKey = "hitesh";
// Dynamic array tracking conversational history context
let conversationHistory = []; 

const streamContainer = document.getElementById("chat-stream");
const messageForm = document.getElementById("chat-form");
const inputField = document.getElementById("chat-input");

// --- View State Controller ---
function setActivePersona(targetKey) {
  activeKey = targetKey;
  
  // Flush message history on swap to prevent cross-persona context leakage
  conversationHistory = []; 
  
  const config = personaEngine[targetKey];
  document.getElementById("chat-header-title").innerText = config.title;
  
  // UI Selection Style Dynamic Updates
  const hiteshBtn = document.getElementById("btn-hitesh");
  const piyushBtn = document.getElementById("btn-piyush");
  
  if (targetKey === "hitesh") {
    hiteshBtn.className = "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 border border-slate-700 bg-slate-800 shadow-lg shadow-black/20";
    document.getElementById("avatar-hitesh").className = "w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm bg-amber-500/10 text-amber-400 border border-amber-500/30";
    document.getElementById("name-hitesh").className = "font-semibold text-sm text-slate-100";
    
    piyushBtn.className = "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 border border-transparent hover:bg-slate-900/60";
    document.getElementById("avatar-piyush").className = "w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm bg-slate-800 text-slate-500";
    document.getElementById("name-piyush").className = "font-semibold text-sm text-slate-400";
  } else {
    piyushBtn.className = "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 border border-slate-700 bg-slate-800 shadow-lg shadow-black/20";
    document.getElementById("avatar-piyush").className = "w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/30";
    document.getElementById("name-piyush").className = "font-semibold text-sm text-slate-100";
    
    hiteshBtn.className = "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 border border-transparent hover:bg-slate-900/60";
    document.getElementById("avatar-hitesh").className = "w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm bg-slate-800 text-slate-500";
    document.getElementById("name-hitesh").className = "font-semibold text-sm text-slate-400";
  }

  // Clear chat view stream and establish new entry point conversation context
  streamContainer.innerHTML = "";
  renderBubble(config.fullName, config.greeting, "mentor");
}

// --- Text Elements Rendering Layer ---
function renderBubble(senderLabel, messageText, roleType) {
  const wrapper = document.createElement("div");
  wrapper.className = `flex flex-col ${roleType === "user" ? "items-end" : "items-start"} msg-animate`;

  const dynamicBadge = activeKey === "hitesh" 
    ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

  wrapper.innerHTML = `
    <div class="max-w-xl">
      <div class="flex items-center gap-1.5 mb-1.5 ${roleType === "user" ? "justify-end" : "justify-start"}">
        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${roleType === "user" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : dynamicBadge}">
          ${senderLabel}
        </span>
      </div>
      <div class="p-3.5 text-sm leading-relaxed rounded-xl ${roleType === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-900 text-slate-200 border border-slate-800/80 rounded-tl-none"}">
        ${escapeHTML(messageText)}
      </div>
    </div>
  `;
  
  streamContainer.appendChild(wrapper);
  streamContainer.scrollTop = streamContainer.scrollHeight;
}

// --- Loading State Display ---
function renderTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.id = "typing-loader";
  indicator.className = "flex gap-1 p-3 bg-slate-900 border border-slate-800/60 rounded-xl w-14 justify-center items-center msg-animate";
  indicator.innerHTML = `
    <span class="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
    <span class="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
    <span class="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
  `;
  streamContainer.appendChild(indicator);
  streamContainer.scrollTop = streamContainer.scrollHeight;
}

// Helper to prevent XSS issues inside UI text frames
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// --- Processing Input Submission via Live Backend Server API ---
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = inputField.value.trim();
  if (!query) return;

  // 1. Render user message bubble on UI viewport
  renderBubble("You", query, "user");
  inputField.value = "";
  
  // 2. Trigger active UI typing simulation layer
  renderTypingIndicator();

  try {
    // 3. Dispatch payload processing request to the Node server
    const response = await fetch(`${baseURL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        persona: activeKey,
        message: query,
        history: conversationHistory // Context depth payload data pipeline
      })
    });

    const data = await response.json();
    
    // Clean typing block wrapper item out
    const loader = document.getElementById("typing-loader");
    if (loader) loader.remove();

    if (data.reply) {
      const currentProfile = personaEngine[activeKey];
      
      // 4. Update memory payload historical stack layers using standard SDK tags
      conversationHistory.push({ role: 'user', content: query });
      conversationHistory.push({ role: 'model', content: data.reply });

      // 5. Present dynamic processed string response content to stream UI
      renderBubble(currentProfile.fullName, data.reply, "mentor");
    } else {
      renderBubble("System Error", "The backend returned an unexpected response payload structure.", "mentor");
    }

  } catch (error) {
    const loader = document.getElementById("typing-loader");
    if (loader) loader.remove();
    
    renderBubble(
      "Connection Error", 
      "Could not reach the AI gateway. Please ensure your Express service instance is listening on port 5000.", 
      "mentor"
    );
    console.error("API Fetch Exception Pipeline Exception:", error);
  }
});

// Bootstrap active state default viewport configuration
document.addEventListener("DOMContentLoaded", () => {
  setActivePersona("hitesh");
});