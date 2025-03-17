const Threat = require('../models/threat.model');
const elasticsearchService = require('../services/elasticsearchService');

exports.createThreat = async (req, res) => {
    try {
        const { type, source, threat_level, hashes, domains, ips, urls } = req.body;
        const threat = await Threat.create({ type, source, threat_level, hashes, domains, ips, urls });
        
        // Indexer dans ElasticSearch
        await elasticsearchService.indexDocument("threats", threat._id.toString(), threat.toObject());

        res.status(201).json({ message: 'Menace stockée avec succès', threat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getThreatById = async (req, res) => {
    try {
        const { id } = req.params;
        const threat = await Threat.findById(id);
        if (!threat) return res.status(404).json({ message: 'Menace non trouvée' });
        res.status(200).json(threat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllThreats = async (req, res) => {
    try {
        const threats = await Threat.find();
        res.status(200).json(threats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteThreat = async (req, res) => {
    try {
        const { id } = req.params;
        await Threat.findByIdAndDelete(id);
        
        // Supprimer de ElasticSearch
        await elasticsearchService.deleteDocument("threats", id);

        res.status(200).json({ message: 'Menace supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};