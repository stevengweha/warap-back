const Message = require('../models/Message');
const Job = require('../models/Job'); // Pour peupler l'offre 
const User = require('../models/User');
const conversationId = require('../models/Conversation'); // modèle Conversation
let io; // défini dans le fichier principal (server.js)
const mongoose = require('mongoose'); // Assurez-vous d'importer mongoose pour ObjectId
const Conversation = require('../models/Conversation');
const Candidature = require('../models/Candidature'); // pour vérifier la candidature existante

exports.createMessage = async (req, res) => {
  try {
    const { jobId, senderId, receiverId, contenu } = req.body;
console.log("📥 Données reçues dans req.body :", req.body);
    // Vérification des données reçues

    // 🔎 Rechercher automatiquement une candidature existante pour ce job
    const candidature = await Candidature.findOne({
      jobId: jobId,
      //verifier si le chercheur a déjà postulé
      chercheurId: senderId // Assurez-vous que le senderId est le chercheur
    }); 
    if (!candidature) {
      console.log("Aucune candidature trouvée pour ce job et ce chercheur."); 
    } else {
      console.log("Candidature trouvée :", candidature._id);
      // Si une candidature existe, on peut l'utiliser pour lier le message
    }



    // 📦 Vérifie si une conversation existe déjà
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId]
      });
      await conversation.save();
      console.log("Nouvelle conversation créée:", conversation._id);
    } else if (!conversation._id) {
      conversation._id = new mongoose.Types.ObjectId();
      await conversation.save();
      console.log("ID attribué à la conversation existante:", conversation._id);
    } else {
      console.log("Conversation existante trouvée:", conversation._id);
    }

    // 📨 Créer le message avec ou sans candidature
    const message = new Message({
      jobId,
      conversationId: conversation._id,
      senderId,
      receiverId,
      contenu,
      dateEnvoi: new Date(),
      candidatureId: candidature ? candidature._id : undefined // ➕ associer automatiquement
    });

    await message.save();
    res.status(201).json({ message: "Message envoyé avec succès!", message });

  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    res.status(500).json({ message: "Erreur lors de l'envoi du message." });
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
      .populate('conversationId')
      .sort({ dateEnvoi: 1 })
      .lean();

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
