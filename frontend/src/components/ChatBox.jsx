import { useState, useRef, useEffect } from "react";
import { sendMessage as sendMessageAPI } from "../services/chatService";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // Quick replies - predefined questions with answers
  const quickReplies = [
    {
      id: 1,
      question: "Comment acheter?",
      fullText: "Comment acheter un livre?",
      answer: "Pour acheter un livre sur LivresGourmands:\n\n1. Créez un compte ou connectez-vous\n2. Parcourez notre catalogue et sélectionnez le livre souhaité\n3. Cliquez sur l'image du livre pour voir les détails\n4. Ajoutez-le au panier\n5. Accédez à votre panier et cliquez sur \"Finaliser la commande\"\n6. Remplissez vos informations de livraison\n7. Choisissez votre mode de paiement (Stripe)\n8. Confirmez votre commande"
    },
    {
      id: 2,
      question: "Comment créer un compte?",
      fullText: "Comment créer un compte?",
      answer: "Pour créer un compte:\n\n1. Cliquez sur \"S'inscrire\" dans le menu de navigation\n2. Remplissez le formulaire avec:\n   - Votre nom\n   - Votre email\n   - Un mot de passe sécurisé\n3. Cliquez sur \"S'inscrire\"\n4. Vous serez automatiquement connecté et redirigé vers la page d'accueil"
    },
    {
      id: 3,
      question: "Quels sont les modes de paiement?",
      fullText: "Quels sont les modes de paiement acceptés?",
      answer: "Nous acceptons les paiements via Stripe, qui supporte:\n\n- Cartes de crédit (Visa, Mastercard, American Express)\n- Cartes de débit\n- Paiements sécurisés et cryptés\n\nToutes les transactions sont 100% sécurisées grâce à la technologie Stripe."
    },
    {
      id: 4,
      question: "Comment suivre ma commande?",
      fullText: "Comment suivre ma commande?",
      answer: "Pour suivre votre commande:\n\n1. Connectez-vous à votre compte\n2. Accédez à \"Mes Commandes\" dans le menu\n3. Vous verrez la liste de toutes vos commandes avec leur statut\n4. Cliquez sur une commande pour voir les détails\n\nVous recevrez également un email de confirmation après chaque achat."
    }
  ];

  // Défilement automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText = null) => {
    const trimmedInput = messageText || input.trim();
    if (!trimmedInput) return;

    // Ajouter le message
    setMessages((prev) => [...prev, { from: "user", text: trimmedInput }]);
    setInput("");

    // Thinking
    const loadingMessage = { from: "ai", text: "Thinking..." };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const { reply } = await sendMessageAPI(trimmedInput);

      // Remplacer le message de thinking
      setMessages((prev) =>
        prev.map((m) =>
          m === loadingMessage ? { from: "ai", text: reply } : m
        )
      );
    } catch (err) {
      console.error("Erreur:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m === loadingMessage ? { from: "ai", text: "Erreur" } : m
        )
      );
    }
  };

  const handleQuickReply = (quickReply) => {
    // Ajouter la question de l'utilisateur
    setMessages((prev) => [...prev, { from: "user", text: quickReply.fullText }]);

    // Ajouter directement la réponse prédéfinie (sans appeler la LLM)
    setMessages((prev) => [...prev, { from: "ai", text: quickReply.answer }]);
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "300px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        overflow: "hidden",
        fontFamily: "sans-serif",
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#0056b3",
          color: "#ffffff",
          padding: "8px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Chat</span>
        <button
          style={{
            background: "transparent",
            border: "none",
            color: "#ffffff",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
          }}
          aria-label={isOpen ? "Fermer chat" : "Ouvrir chat"}
        >
          {isOpen ? "−" : "+"}
        </button>
      </div>

      {/* Body */}
      {isOpen && (
        <div
          style={{
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            height: "400px",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {messages.length === 0 && (
              <div style={{ marginBottom: "15px" }}>
                <p style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "10px",
                  textAlign: "center"
                }}>
                  Comment puis-je vous aider?
                </p>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  {quickReplies.map((reply) => (
                    <button
                      key={reply.id}
                      onClick={() => handleQuickReply(reply)}
                      style={{
                        background: "#f0f0f0",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        cursor: "pointer",
                        fontSize: "13px",
                        textAlign: "left",
                        transition: "all 0.2s",
                        color: "#333",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#e0e0e0";
                        e.target.style.borderColor = "#007bff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#f0f0f0";
                        e.target.style.borderColor = "#ddd";
                      }}
                    >
                      💬 {reply.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  textAlign: m.from === "user" ? "right" : "left",
                  margin: "6px 0",
                }}
              >
                <span
                  style={{
                    background: m.from === "user" ? "#d1f5d3" : "#eee",
                    padding: "5px 10px",
                    borderRadius: "8px",
                    display: "inline-block",
                    maxWidth: "80%",
                    wordBreak: "break-word",
                    fontStyle: m.text === "Chargement..." ? "italic" : "normal",
                  }}
                >
                  {m.text}
                </span>
              </div>
            ))}
            {messages.length > 0 && (
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <button
                  onClick={resetChat}
                  style={{
                    background: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "#495057",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#e9ecef";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#f8f9fa";
                  }}
                >
                  ↩️ Back to menu
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: "8px",
                border: "none",
                resize: "none",
              }}
              placeholder="Saisir un message..."
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              onClick={() => sendMessage()}
              style={{
                padding: "0 12px",
                border: "none",
                background: "#007bff",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Envoyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
