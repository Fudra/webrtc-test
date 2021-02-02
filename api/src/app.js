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

app.get('/negotiations', (req, res) => {
  // grab user

  // grab table
  // offerIdentity
  const offerIdentity = req.query.offerIdentity;

  console.log('offerIdentity', offerIdentity);

  if (offerIdentity !== undefined) {
    const requestNegotiation = negotiations.find(
      (i) => i.identity == offerIdentity
    );
    // Object.equals && isAnswering()
    let neg = negotiations.filter(
      (n) =>
        n.offer == requestNegotiation.offer &&
        n.offer !== null &&
        n.answer !== null
    );

    res.send(neg);
    return;
  }

  // get last request offer
  let neg = negotiations
    .sort((a, b) => b.created - a.created)
    .filter((n) => n.offer !== null && n.answer == null);

  res.send(neg.length > 0 ? [neg[0]] : []);
});

app.post('/negotiations', (req, res) => {
  offerIdentity += 1;

  const item = {
    identity: offerIdentity,
    negotiator: req.body.negotiator,
    offer: req.body.offer,
    answer: req.body.answer,
    created: Date.now(),
  };

  negotiations.push(item);

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
