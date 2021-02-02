const peerConnectionsMap = new Map();
let offeredPeerConnection = null;
let localStream = null;
let videoContainers = [];
let playerId = 0;

/// ############## WebRTC ##############

const PEER_CONFIG = {
  // iceServers: [
  //   { urls: 'stun:stun.services.mozilla.com' },
  //   { urls: 'stun:stun.l.google.com:19302' },
  // ],
};

/**
 * Returns a promise that resolves to an RTC peer connection's updated local description
 * once the given connection's ICE candidates have been negotiated.
 * @param {RTCPeerConnection} connection the RTC peer connection
 * @param {Boolean} offering wether an offer or an answer shall be negotiated
 * @return {Promise} the promise of an updated local description
 */
const negotiateLocalDescription = (connection, offering) => {
  return new Promise((resolve, reject) => {
    //console.log('waiting for ice candidate');
    connection.onicecandidate = (event) => {
      //console.log('found ice candidate', event);
      if (!event.candidate) {
        delete connection.onicecandidate;
        resolve(connection.localDescription);
      }
      // api call post
      if (offering) {
        setOffer(JSON.stringify(event.candidate));
      } else {
        setAnswer(JSON.stringify(event.candidate));
      }
    };

    let promise = offering
      ? connection.createOffer()
      : connection.createAnswer();

    promise
      .then((sessionDescription) =>
        connection.setLocalDescription(sessionDescription)
      )
      .then(() =>
        console.log(`set ${offering ? 'offer' : 'answer'} successfully!`)
      );
  });
};

const createPeerConnection = async () => {
  //
  const pc = new RTCPeerConnection(PEER_CONFIG);

  pc.onaddstream = (obj) => {
    console.log('onaddstream', obj);
    let vid = document.createElement('video');
    vid.autoplay = true;
    videoGrid.appendChild(vid);
    vid.srcObject = obj.stream;
  };

  // add media track

  const localVideoStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  // localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  pc.onaddstream({ stream: localVideoStream });
  pc.addStream(localVideoStream);

  pc.addEventListener('connectionstatechange', () =>
    console.log(pc.connectionState)
  );

  return pc;
};

/**
 *
 */
const init = async () => {
  console.log('init');

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  videoContainers = document.querySelectorAll('.js-video');

  for (const iterator of videoContainers) {
    videoContainers[iterator].srcObject =
      iterator === playerId ? localStream : new MediaStream();
  }

  // Handle incoming RTC offers from other players at the table
  await handleIncomingPeerConnectionOffers();

  // Create a new peer connection with an offer
  offeredPeerConnection = await createPeerConnectionOffer(localStream);
};

const handleIncomingPeerConnectionOffers = async () => {
  const negotiations = await fetchOfferForUser(user);
};

const createPeerConnectionOffer = async (steam) => {};

const joinUser = () => {
  playerId = +document.getElementById('player-id').value;

  fetch('http://localhost:3030/persons', {
    method: 'POST',
    body: JSON.stringify({ id: playerId }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  init();
};

const fetchUsers = async () => {
  let response = fetch('http://localhost:3030/persons', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return (await response).json();
};

const setOffer = async (offer) => {
  if (offer === 'null') return;

  let negotiator = +document.getElementById('player-id').value;

  const negotation = {
    offer,
    answer: null,
    negotiator,
  };

  fetch('http://localhost:3030/offer', {
    method: 'POST',
    body: JSON.stringify(negotation),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const setAnswer = async (answer) => {
  if (answer === 'null') return;
  let negotiator = +document.getElementById('player-id').value;

  const negotation = {
    offer: null,
    answer,
    negotiator,
  };

  fetch('http://localhost:3030/answer', {
    method: 'POST',
    body: JSON.stringify(negotation),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const fetchOfferForUser = async (user) => {
  let response = fetch(`http://localhost:3030/offer/${user}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return (await response).json();
};

const fetchAnswerForUser = async (user) => {
  let response = fetch(`http://localhost:3030/answer/${user}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return (await response).json();
};

document.getElementById('btn-join').addEventListener('click', joinUser);
