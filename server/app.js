const express = require('express');
const path = require('path');
const morgan  = require('morgan');
const cors = require('cors');
const router = require('./router.js')
require('newrelic');

const app = express();
const port = 8008;

// Serve static files
// app.use(express.static(path.join()))

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.use('/api', router);
// app.get('/', (req, res) => {
//   res.send('Hello World');
// })

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});
