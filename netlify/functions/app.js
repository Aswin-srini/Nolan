const { rejects } = require('assert');
const { resolve } = require('path');
const fs = require('fs');
const { error } = require('console');
const http = require('http');
const url = require('url');
const serverless = require("serverless-http");

// User-defined modules
const page = require("../../modules/Card_Replace");
const desc = require("../../modules/About_Data_replace");

// Load data and templates
let list = JSON.parse(fs.readFileSync("./JSON_Data/list_movies.json", 'utf-8'));
let lst = fs.readFileSync("./pages/list.html", 'utf-8');
let temp = fs.readFileSync("./pages/index.html", 'utf-8');
let abtmvi = fs.readFileSync("./pages/about.html", 'utf-8');

// Create Server
const server = http.createServer((req, res) => {
    let { query, pathname } = url.parse(req.url, true);

    pathname = pathname.replace('/.netlify/functions/server', '') || '/';

    // Serve CSS file
    if (pathname === '/style.css') {
        fs.readFile('./style.css', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('CSS file not found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            }
        });
        return; 
    }
    
    // Serve movie list or specific movie
    const getMovie = list.find(movie => movie.name === query.name);

    if (pathname.includes('/movie') || pathname === '/') {
        if (!query.name) {
            let Templets = list.map((data) => {
                return page(lst, data);
            });
            let finalPage = temp.replace('{{%LIST%}}', Templets);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(finalPage);
        } else {
            let abt = desc(abtmvi, getMovie);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(abt);
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Error: 404 Not Found');
    }
});

module.exports.handler = serverless(server);

server.listen(8000, '127.0.0.1', () => {
    console.log('Server Created at http://127.0.0.1:8000');
});
