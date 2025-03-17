const axios = require("axios");
const config = require("./Config");

const CAPE_API_URL = config.capeApiUrl;

exports.analyzeFile = async (filePath) => {
    try {
        const response = await axios.post(`${CAPE_API_URL}/submit/file`, { filePath });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l analyse du fichier :", error.message);
        return { error: error.message };
    }
};

exports.analyzeUrl = async (url) => {
    try {
        const response = await axios.post(`${CAPE_API_URL}/submit/url`, { url });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l analyse de l URL :", error.message);
        return { error: error.message };
    }
};

exports.analyzeDomain = async (domain) => {
    try {
        const response = await axios.post(`${CAPE_API_URL}/submit/domain`, { domain });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l analyse du domaine :", error.message);
        return { error: error.message };
    }
};

exports.analyzeIp = async (ip) => {
    try {
        const response = await axios.post(`${CAPE_API_URL}/submit/ip`, { ip });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l analyse de l IP :", error.message);
        return { error: error.message };
    }
};

exports.getAnalysisReport = async (id) => {
    try {
        const response = await axios.get(`${CAPE_API_URL}/report/${id}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération du rapport d analyse :", error.message);
        return { error: error.message };
    }
};