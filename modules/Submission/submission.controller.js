const Submission = require('./submission.model');
const Analysis = require('./../Analysis/analysis.model');
const capeService = require('./../../config/capeService');
const rabbitMQ = require('./../../config/rabbitmq');
const elasticsearchService = require('./../../config/capeService');

exports.submitItem = async (req, res) => {
    try {
        const { type, file, url, domain, ip, submitted_by } = req.body;
        let submissionData = { type, submitted_by, status: 'pending' };

        if (type === 'file') submissionData.file = file;
        else if (type === 'url') submissionData.url = url;
        else if (type === 'domain') submissionData.domain = domain;
        else if (type === 'ip') submissionData.ip = ip;

        const submission = await Submission.create(submissionData);

        let capeResponse;
        if (type === 'file') capeResponse = await capeService.analyzeFile(file.path);
        else if (type === 'url') capeResponse = await capeService.analyzeUrl(url);
        else if (type === 'domain') capeResponse = await capeService.analyzeDomain(domain);
        else if (type === 'ip') capeResponse = await capeService.analyzeIp(ip);

        const analysis = await Analysis.create({
            submission_id: submission._id,
            analysis_type: type === 'file' ? 'dynamic' : 'static',
            results: capeResponse || {},
            threat_level: 'low',
        });

        submission.analysis_id = analysis._id;
        await submission.save();

        await rabbitMQ.sendMessage('submission_queue', submission);
        
        // 🔹 Indexation dans ElasticSearch
        await elasticsearchService.indexDocument("submissions", submission._id.toString(), submission.toObject());

        res.status(201).json({ message: 'Soumission réussie', submission });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await Submission.findById(id).populate('analysis_id');
        if (!submission) return res.status(404).json({ message: 'Soumission non trouvée' });
        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find().populate('analysis_id');
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
