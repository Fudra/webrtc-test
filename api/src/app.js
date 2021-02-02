const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3030;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * {
 *     offer: '',
 *     answer: '',
 *     negotiator: 0
 * }
 */

const negotiations = [];

let offerIdentity = 0;

/**
 * {
 *  id: 0
 * }
 */
const people = new Set();

app.get('/reset', (req, res) => {
  people.forEach((i) => people.delete(i));

  negotation.forEach((i) => negotation.pop());
});

/**
 * persons
 */

app.get('/persons', (req, res) => {
  res.send(Array.from(people));
});

/**
 * join
 */
app.post('/persons', (req, res) => {
  people.add(req.body.id);

  res.sendStatus(200);
});

/**
 * negotators
 */
app.get('/offer/:id', (req, res) => {
  let offer = negotation
    .filter((n) => n.negotiator == req.params.id)
    //.filter((n) => n.offer !== null)
    .map((n) => n.offer);
  res.send(offer);
});

app.get('/answer/:id', (req, res) => {
  let answer = negotation
    .filter((n) => n.negotiator == req.params.id)
    //.filter((n) => n.answer !== null)
    .map((n) => n.answer);
  res.send(answer);
});

app.get('/negotiations', (req, res) => {
  // grab user

  // grab table
  // offerIdentity
  const offerIdentity = req.query.offerIdentity;

  if (offerIdentity !== null) {
    const requestNegotiation = negotiations.find(
      (i) => i.offerIdentity == offerIdentity
    );
    // Object.equals && isAnswering()
    return negotiations.filter(
      (n) =>
        (n.offer =
          requestNegotiation.offer && n.offer !== null && n.answer !== null)
    );
  }

  // get last request offer
  return negotations.filter((n) => n.offer !== null && n.answer == null);
});

app.post('/negotiations', (req, _) => {
  offerIdentity += 1;

  const item = {
    identity: offerIdentity,
    negotiator: req.body.negotiator,
    offer: req.body.offer,
    answer: req.body.answer,
    created: Date.now(),
  };

  negotations.push(item);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
