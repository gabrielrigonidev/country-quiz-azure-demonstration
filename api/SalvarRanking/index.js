// api/SaveScore/index.js

const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {

    const client =
        TableClient.fromConnectionString(
            process.env.STORAGE,
            "ranking"
        );

    await client.createTable();

    await client.createEntity({
        partitionKey: "quiz",
        rowKey: Date.now().toString(),
        name: req.body.name,
        score: req.body.score
    });

    context.res = {
        status: 200,
        body: "ok"
    };
};