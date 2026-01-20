import React from "react";

interface VoiceReaderProps {
  text: string;
}

const VoiceReader: React.FC<VoiceReaderProps> = ({ text }) => {
  const speak = () => {
    if (!("speechSynthesis" in window)) {
      alert("Votre navigateur ne supporte pas la synthèse vocale !");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR"; // langue française
    utterance.rate = 1; // vitesse
    utterance.pitch = 1; // ton
    window.speechSynthesis.speak(utterance);
  };

  return <button onClick={speak}>🔊 Écouter</button>;
};

export default VoiceReader;
