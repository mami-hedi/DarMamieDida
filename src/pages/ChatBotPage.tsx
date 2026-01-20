import React from "react";
import ChatBot from "../components/ChatBot";
import { Layout } from "@/components/layout/Layout";

const ChatBotPage: React.FC = () => {
  return (
    <Layout>
    <div style={{ padding: 20 }}>
    <center>  <h1>ChatBot Maison MH</h1>
      <p>Posez vos questions sur les disponibilités et réservations :</p>
      *Quelles chambres sont disponibles le ... ? <br/>

*Quels sont les prix ? <br/>

*Combien coûte une chambre ? <br/>

*Quelle est la capacité des chambres ? <br/>

*Montre-moi les chambres <br/> </center>
      <ChatBot />
    </div>
    </Layout>
  );
};

export default ChatBotPage;
