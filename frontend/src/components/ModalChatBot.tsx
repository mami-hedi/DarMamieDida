import React, { useState } from "react";
import ChatBot from "./ChatBot";

const ModalChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      {/* Bouton dans le header */}
      <button onClick={openModal} style={styles.headerBtn}>
        ChatBot
      </button>

      {/* Modal */}
      {isOpen && (
        <div style={styles.overlay} onClick={closeModal}>
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()} // empêcher la fermeture en cliquant dans le modal
          >
            <div style={styles.modalHeader}>
              <h3>ChatBot Maison MH</h3>
              <button onClick={closeModal} style={styles.closeBtn}>
                ✖
              </button>
            </div>
            <ChatBot />
          </div>
        </div>
      )}
    </>
  );
};

export default ModalChatBot;

/* =========================
   STYLES
========================= */
const styles: any = {
  headerBtn: {
    background: "#2a5298",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    width: "100%",
    maxWidth: 500,
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
  },
};
