const { Client } = require("@elastic/elasticsearch");
const config = require("./Config");

const esClient = new Client({ node: config.elasticSearchUrl });

/**
 * Créer un index dans ElasticSearch
 */
exports.createIndex = async (indexName) => {
    try {
        const exists = await esClient.indices.exists({ index: indexName });
        if (!exists.body) {
            await esClient.indices.create({
                index: indexName,
                body: {
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 1
                    }
                }
            });
            console.log(`Index ${indexName} créé avec succès.`);
        }
    } catch (error) {
        console.error("Erreur lors de la création de l'index :", error.message);
    }
};

/**
 * Ajouter un document dans un index
 */
exports.indexDocument = async (indexName, id, document) => {
    try {
        await esClient.index({
            index: indexName,
            id: id,
            body: document
        });
        console.log(`Document indexé dans ${indexName} avec ID ${id}`);
    } catch (error) {
        console.error("Erreur lors de l'indexation du document :", error.message);
    }
};

/**
 * Rechercher un document dans un index
 */
exports.searchDocuments = async (indexName, query) => {
    try {
        const result = await esClient.search({
            index: indexName,
            body: {
                query: {
                    match: query
                }
            }
        });
        return result.body.hits.hits;
    } catch (error) {
        console.error("Erreur lors de la recherche de documents :", error.message);
        return [];
    }
};

/**
 * Supprimer un document d'un index
 */
exports.deleteDocument = async (indexName, id) => {
    try {
        await esClient.delete({
            index: indexName,
            id: id
        });
        console.log(`Document avec ID ${id} supprimé de l'index ${indexName}`);
    } catch (error) {
        console.error("Erreur lors de la suppression du document :", error.message);
    }
};