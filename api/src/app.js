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

let negotiations = [];

let offerIdentity = 0;

/**
 * {
 *  id: 0
 * }
 */

app.get('/reset', (req, res) => {
  negotiations = [];
  res.send(negotiations);
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

const arrMax = (arr, value) => {
  const maxElements = arr.map((i) => i[value]);
  const max = Math.max(...maxElements);

  return arr.find((i) => i[value] === max);
};

const isOffering = (n) => n.offer !== null && n.answer == null;
const isAnswering = (n) => n.offer !== null && n.answer !== null;

app.get('/offers', (req, res) => {
  const requester = Number.parseInt(req.query.requester);
  /**
   *  
        List<Negotiation> negotiations = new ArrayList<>();
        
        for(Person player: table.getPlayers()) {
        	Negotiation neg = player.getNegotiations().stream()
        			.filter(n -> n.isOffering() && n.getNegotiator().getIdentity() != requesterIdentity)
        			.max(Comparator.comparing(Negotiation::getCreationTimestamp))
        			.orElse(null); 
        	
        	if(neg != null) negotiations.add(neg);
        }
        
        return negotiations;
   */

  const playersAtTable = new Set(negotiations.map((i) => i.negotiator));

  const negs = [];

  for (const negotiator of Array.from(playersAtTable)) {
    // get player negotiations
    const playerNegotiations = negotiations.filter(
      (n) => n.negotiator == negotiator
    );

    // filter for offers, expect requester
    const offers = playerNegotiations.filter(
      (n) => isOffering(n) && n.negotiator !== requester
    );

    // get last offer
    const lastElement = arrMax(offers, 'created');

    if (lastElement !== undefined) negs.push(lastElement);
  }

  res.send(negs);
});

app.get('/answers', (req, res) => {
  const requester = Number.parseInt(req.query.requester);

  const playerNegotiations = negotiations
    .filter((n) => n.negotiator == requester)
    .filter((n) => isAnswering(n));

  const max = arrMax(playerNegotiations, 'identity');

  res.send(!!max ? [max] : []);
});

app.get('/negotiations', (req, res) => {
  // grab user

  // grab table
  // offerIdentity
  const offerIdentity = Number.parseInt(req.query.offerIdentity);
  const requester = Number.parseInt(req.query.requester);

  console.log('offerIdentity', offerIdentity);

  if (!Number.isNaN(offerIdentity)) {
    const requestNegotiation = negotiations.find(
      (i) => i.identity == offerIdentity
    );
    // Object.equals && isAnswering()
    let neg = negotiations.filter(
      (n) => n.offer == requestNegotiation.offer && n.answer !== null
    );

    res.send(neg);
    return;
  }

  // get last request offers for requester

  // get unique player ids
  const playersAtTable = new Set(negotiations.map((i) => i.negotiator));

  console.log('playersAtTable', playersAtTable);
  const negs = [];
  console.log('negotiations', negotiations);

  for (const playerID of Array.from(playersAtTable)) {
    console.log('playerID', playerID, requester);
    if (playerID == requester) continue;

    let neg = negotiations.filter((n) => n.negotiator !== playerID);
    //.filter((n) => n.offer !== null && n.answer == null)
    //.sort((a, b) => b.created - a.created);
    console.log('neg', neg);

    negs.push(neg[0]);
  }

  console.log('negs', negs);
  res.send(negs);
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
