const Message = require('../models/Message');
const Job = require('../models/Job'); // Pour peupler l'offre si besoin

// Créer un message
exports.createMessage = async (req, res) => {
  try {
    const { jobId ,conversationId ,senderId, receiverId, contenu } = req.body;
    const message = new Message({
      jobId,
      conversationId, 
      senderId,
      receiverId,
      contenu
    });
    await message.save();
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre')
      .populate('conversationId');

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer tous les messages
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre')
      .populate('conversationId');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un message par ID
exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre')
      .populate('conversationId');
    if (!message) return res.status(404).json({ error: 'Message non trouvé' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour un message
exports.updateMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre');
    if (!message) return res.status(404).json({ error: 'Message non trouvé' });
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer un message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id)
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre');
    if (!message) return res.status(404).json({ error: 'Message non trouvé' });
    res.json({ message: 'Message supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer les messages liés à un job
exports.getMessagesByJob = async (req, res) => {
  try {
    const messages = await Message.find({ jobId: req.params.jobId })
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre')
      .populate('conversationId');

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer tous les messages entre deux utilisateurs (et lier une offre si possible)
exports.getConversation = async (req, res) => {
  const { userId, otherUserId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre')
      .populate('conversationId');

      .sort({ dateEnvoi: 1 })
      .lean();

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
