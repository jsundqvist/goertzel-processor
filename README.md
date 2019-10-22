# goertzel-processor
Usage:

    let context = new (window.AudioContext || window.webkitAudioContext)();

    await context.audioWorklet.addModule('goertzel-processor.js');
    let goertzelNode = new AudioWorkletNode(context, 'goertzel-processor', {
        processorOptions: { // explicit defaults, can be omitted
            frequencies: [697, 770, 852, 941, 1209, 1336, 1477, 1633],
            blockSize: 512
        }
    });
    goertzelNode.port.onmessage = (e) => this.handleData(e.data); // <--
    goertzelNode.connect(context.destination);

    navigator.getUserMedia({audio: true}, (stream) => {
        let microphone = this.context.createMediaStreamSource(stream);
        microphone.connect(goertzelNode);
    }, (e) => {
        console.error('Error getting microphone', e);
    });
    
Then it's up to you to decide when you think a signal is detected :)

Inspired by https://github.com/sveljko/goertzel
