const Conversation = require('../models/Conversation');
const Message = require('../models/Message'); // Assurez-vous d'importer le modèle Message
const Candidature = require('../models/Candidature'); // pour vérifier la candidature existante
let io; // défini dans le fichier principal (server.js)
exports.setSocketIo = (socketIoInstance) => {
  io = socketIoInstance;
};

// Créer une conversation
exports.createConversation = async (req, res) => {
  try {
    const { participants, jobId } = req.body;
    const conversation = await Conversation.create({ participants, jobId });
    res.status(201).json(conversation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer toutes les conversations
exports.getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find().populate('participants').populate('jobId');
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer une conversation par ID
exports.getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate('participants').populate('jobId');
    if (!conversation) return res.status(404).json({ error: 'Conversation non trouvée' });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour une conversation
exports.updateConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!conversation) return res.status(404).json({ error: 'Conversation non trouvée' });
    res.json(conversation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer une conversation
exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation non trouvée' });
    res.json({ message: 'Conversation supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
