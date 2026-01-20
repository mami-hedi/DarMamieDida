import React, { useState } from "react";

/* =========================
   🔊 LECTURE VOCALE
========================= */
const VoiceReader: React.FC<{ text: string }> = ({ text }) => {
  const speak = () => {
    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button onClick={speak} style={styles.voiceBtn} title="Écouter">
      🔊
    </button>
  );
};

/* =========================
   🤖 CHATBOT
========================= */
const ChatBot: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { from: "user" | "bot"; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: message }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.reply || "Pas de réponse disponible." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Erreur serveur. Veuillez réessayer." },
      ]);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🤖 Assistant Maison MH</h2>
        <p style={styles.subtitle}>
          Disponibilités • Tarifs • Capacité • Chambres
        </p>

        <div style={styles.chatBox}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.bubble,
                ...(msg.from === "user"
                  ? styles.userBubble
                  : styles.botBubble),
              }}
            >
              <div>{msg.text}</div>
              {msg.from === "bot" && <VoiceReader text={msg.text} />}
            </div>
          ))}

          {loading && <p style={styles.loading}>⏳</p>}
        </div>

        <div style={styles.inputRow}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex : Quels sont les prix ?"
            style={styles.input}
            disabled={loading}
          />
          <button onClick={handleSend} style={styles.sendBtn} disabled={loading}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;

/* =========================
   🎨 STYLES
========================= */
const styles: any = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    padding: 20,
  },
  card: {
    background: "#ffffff",
    width: "100%",
    maxWidth: 450,
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    background: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  bubble: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 12,
    maxWidth: "85%",
    wordBreak: "break-word",
  },
  userBubble: {
    background: "#2a5298",
    color: "#fff",
    marginLeft: "auto",
  },
  botBubble: {
    background: "#e4e4e4",
    color: "#000",
    marginRight: "auto",
  },
  inputRow: {
    display: "flex",
    gap: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ccc",
    fontSize: 15,
  },
  sendBtn: {
    padding: "0 18px",
    borderRadius: 10,
    border: "none",
    background: "#2a5298",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },
  voiceBtn: {
    marginTop: 6,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
  },
  loading: {
    textAlign: "center",
    color: "#555",
  },
};
