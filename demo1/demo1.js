(async () => {
  let localVideoStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  localVideo.srcObject = localVideoStream;

  // init
  const pc = new RTCPeerConnection();

  pc.onaddstream = (obj) => {
    console.log('onaddstream', obj);
    let vid = document.createElement('video');
    vid.autoplay = true;
    videoGrid.appendChild(vid);
    vid.srcObject = obj.stream;
  };

  pc.onicecandidate = (e) => {
    console.log('onicecandidate', JSON.stringify(e.candidate.candidate));
    document.querySelector('[name=ice]').value = JSON.stringify(
      pc.localDescription
    );
  };

  pc.onconnectionstatechange = (e) =>
    console.log('onconnectionstatechange', pc.connectionState);

  const setRemoteDesciption = () => {
    const description = document.querySelector('[name=description]').value;

    pc.setRemoteDescription(JSON.parse(description)).then((e) =>
      console.log('set foreign description')
    );
  };

  const createOffer = () => {
    pc.onaddstream({ stream: localVideoStream });
    pc.addStream(localVideoStream);

    pc.createOffer()
      .then((o) => pc.setLocalDescription(o))
      .then((e) => console.log('set offer successfully!'));
  };

  const createAnswer = async () => {
    pc.onaddstream({ stream: localVideoStream });
    pc.addStream(localVideoStream);

    pc.createAnswer()
      .then((a) => pc.setLocalDescription(a))
      .then((a) => console.log('answer created successfully!'));
  };

  document
    .querySelector('[name=btn-set–description]')
    .addEventListener('click', setRemoteDesciption);

  document
    .querySelector('[name=btn-offer]')
    .addEventListener('click', createOffer);

  document
    .querySelector('[name=btn-answer]')
    .addEventListener('click', createAnswer);
})();
