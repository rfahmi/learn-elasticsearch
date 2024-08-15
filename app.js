const express = require("express");
const { Client } = require("@elastic/elasticsearch");

const app = express();
const port = 3000;

// Create an Elasticsearch client
const client = new Client({ node: "http://localhost:9200" });

// Define the /products route
app.get("/products", async (req, res) => {
  const { query, sortBy, sortMethod } = req.query;

  if (!query) {
    return res.status(400).send({ error: "Query parameter is required" });
  }

  let sortObject = {};
  if (sortBy && sortMethod) {
    sortObject = { [sortBy]: sortMethod };
  }

  try {
    const result = await client.search({
      index: "products",
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ["name", "price"],
          },
        },
        sort: [sortObject],
      },
    });

    const products = result.hits.hits.map((hit) => hit._source);
    res.send(products);
  } catch (error) {
    console.error("Elasticsearch search error:", error);
    res
      .status(500)
      .send({ error: "An error occurred while searching for products" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
