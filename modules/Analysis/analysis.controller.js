const Analysis = require('../models/analysis.model');
const capeService = require('../services/capeService');
const elasticsearchService = require('../services/elasticsearchService');

exports.getAnalysisResult = async (req, res) => {
    try {
        const { id } = req.params;
        const results = await capeService.getAnalysisReport(id);

        const analysis = await Analysis.findByIdAndUpdate(id, {
            results,
            threat_level: results.threat_level || 'medium',
            risk_score: results.risk_score || 50,
        }, { new: true });

        if (!analysis) return res.status(404).json({ message: 'Analyse non trouvée' });
        
        // 🔹 Mise à jour de l'indexation ElasticSearch
        await elasticsearchService.indexDocument("analyses", analysis._id.toString(), analysis.toObject());
        
        res.status(200).json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllAnalyses = async (req, res) => {
    try {
        const analyses = await Analysis.find().populate('submission_id detected_threats');
        res.status(200).json(analyses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAnalysis = await Analysis.findByIdAndDelete(id);
        if (!deletedAnalysis) return res.status(404).json({ message: 'Analyse non trouvée' });
        
        // 🔹 Suppression de l'indexation ElasticSearch
        await elasticsearchService.deleteDocument("analyses", id);
        
        res.status(200).json({ message: 'Analyse supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
