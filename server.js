const express = require('express');
const next = require('next');
const cors = require('cors');
const lowfatFetcher = require("./server.utils.lowfat");

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();



app.prepare()
.then(() => {
  const server = express()
  
  server.get('/p/:id', cors(), (req, res) => {
    const actualPage = '/post'
    const queryParams = { id: req.params.id } 
    app.render(req, res, actualPage, queryParams)
  });

  server.get('/api/lowfat/:code', cors(), async (req, res) => {
    res.json(await lowfatFetcher(req.params.code));
  });

  server.get('*', (req, res) => {
    return handle(req, res)
  });

  server.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  });
})
.catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})