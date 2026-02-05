// Configuration de l'URL de l'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default API_URL;

// Exemple d'utilisation dans vos composants :
// import API_URL from './config/api';
// fetch(`${API_URL}/api/chambres`)