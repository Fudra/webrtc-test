(async () => {
  const videoGrid = document.getElementById('video-grid');

  let negotiator = 0;

  const peerConnectionsMap = new Map();

  let localVideoStream = null;

  let peerConnectionOffered = null;

  // get user media
  const CONSTRAINTS = {
    video: true,
    audio: false,
  };

  const PEER_CONFIG = {
    // iceServers: [
    //  { urls: 'stun:stun.services.mozilla.com' },
    //  { urls: 'stun:stun.l.google.com:19302' },
    // ],
  };

  // -------- api calls ---------
  const findAnswer = async (offer) => {
    try {
      const response = await fetch(
        `http://localhost:3030/negotiations?offer=${offer.identity}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );
      return response.status === 200 ? await response.json() : null;
    } catch (err) {
      console.error(err);
    }
  };

  const findOffers = async () => {
    try {
      const response = await fetch(`http://localhost:3030/negotiations`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      return await response.json();
    } catch (err) {
      console.error(err);
    }
  };

  const sendAnswer = async (offer, answer) => {
    try {
      await fetch(`http://localhost:3030/negotiations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negotiator,
          offer: offer.offer,
          answer: answer.sdp,
        }),
      });
    } catch (error) {
      this.displayError(error);
    }
  };

  const sendOffer = async (offer) => {
    try {
      await fetch(`http://localhost:3030/negotiations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negotiator,
          offer: offer.sdp,
          answer: null,
        }),
      });
    } catch (error) {
      this.displayError(error);
    }
  };

  // -------- /api calls ---------

  /**
   *
   * @param {*} connection
   * @param {*} offering
   */
  const negotiateLocalDescription = (connection, offering) => {
    return new Promise((resolve) => {
      console.log('search for ice candidate');
      connection.onicecandidate = (event) => {
        console.log('found ice candidate!');
        if (!event.candidate) {
          delete connection.onicecandidate;
          resolve(connection.localDescription);
        }
      };
      let promise = offering
        ? connection.createOffer()
        : connection.createAnswer();
      promise.then((sessionDescription) =>
        connection.setLocalDescription(sessionDescription)
      );
    });
  };

  const handleIncommingOffers = async () => {
    const offers = await findOffers();

    console.log(offers);

    for (const offer of offers) {
    }
  };

  const initPeer = () => {
    const pc = new RTCPeerConnection(PEER_CONFIG);
    pc.onaddstream = (obj) => {
      // todo handle video position
      console.log('onaddstream', obj);
      let vid = document.createElement('video');
      vid.autoplay = true;
      videoGrid.appendChild(vid);
      vid.srcObject = obj.stream;
    };

    pc.onaddstream({ stream: localVideoStream });
    pc.addStream(localVideoStream);

    pc.onconnectionstatechange = (e) =>
      console.log('onconnectionstatechange', pc.connectionState);

    return pc;
  };

  const createPeerOffer = async () => {
    const pc = initPeer();

    const offer = await negotiateLocalDescription(pc, true);
    console.log('createPeerOffer', offer);

    await sendOffer(offer);

    return pc;
  };

  const createPeerAnswer = async (offer) => {
    const pc = initPeer();

    // create answer

    await pc.setRemoteDescription({ type: 'offer', sdp: offer.offer });
    const answer = await this.negotiateLocalDescription(pc, false);
    await this.sendAnswer(offer, answer);

    return pc;
  };

  const init = async () => {
    negotiator = +document.getElementById('user-value').value;

    localVideoStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    await handleIncommingOffers();

    peerConnectionOffered = await createPeerOffer();
  };

  // buttons
  document.querySelector('[name=btn-join]').addEventListener('click', init);
})();
