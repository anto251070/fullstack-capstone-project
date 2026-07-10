const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

// Endpoint di ricerca avanzata: /api/search
router.get('/', async (req, res) => {
    try {
        // Task 1: Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("gifts");

        let query = {};

        // Task 2: Check if the name exists and is not empty
        if (req.query.name && req.query.name.trim() !== "") {
            query.name = { $regex: req.query.name, $options: "i" }; // Ricerca parziale case-insensitive
        }

        // Task 3: Add the other three filters to the query (category, condition, age_years)
        
        // Filtro Categoria
        if (req.query.category && req.query.category.trim() !== "") {
            query.category = req.query.category;
        }

        // Filtro Condizione (es. "New", "Used")
        if (req.query.condition && req.query.condition.trim() !== "") {
            query.condition = req.query.condition;
        }

        // Filtro Età (Verifica se age_years esiste ed è un numero valido)
        if (req.query.age_years && req.query.age_years.trim() !== "") {
            query.age_years = { $lte: parseInt(req.query.age_years) };
        }

        // Task 4: Fetch filtered gifts
        const gifts = await collection.find(query).toArray();

        // Restituzione dei regali filtrati in formato JSON
        res.json(gifts);

    } catch (e) {
        console.error('Error during search processing:', e);
        res.status(500).send('Error searching gifts');
    }
});

module.exports = router;