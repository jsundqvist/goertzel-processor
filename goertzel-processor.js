class GoertzelProcessor extends AudioWorkletProcessor {
  constructor (options) {
    super();
    this.filters = [];
    this.frequencies = options.processorOptions.frequencies || [697, 770, 852, 941, 1209, 1336, 1477, 1633]; // DTMF
    this.frequencies.forEach(frequency => {
        this.filters.push(new GoertzelFilter(frequency, options.processorOptions.blockSize));
    }, this);
  }
  process (inputs, outputs, parameters) {
    const input = inputs[0]
    const channel = input[0];
    let data = this.gather(channel);
    if(data)
        this.port.postMessage(data);
    return true;
  }
  gather(channel) {
    let done = false;
    this.filters.forEach(filter => done |= filter.process(channel));
    if(!done)
      return;
    const data = {}
    for(let i=0; i<this.filters.length; i++) {
      data[this.frequencies[i]] = this.filters[i].magnitude;
    }
    return data;
  }
}
registerProcessor('goertzel-processor', GoertzelProcessor)

class GoertzelFilter {
  constructor(targetFrequency, blockSize) {
    this.k = 2 * Math.cos(2 * Math.PI * targetFrequency / sampleRate);
    this.n = blockSize || 512; // minimum block size with good result
    this.q0 = 0;
    this.q1 = 0;
    this.q2 = 0;
    this.j = 0;
  }
  process(channel) {
    let done = false;
    for (let i = 0; i < channel.length; i++) {
      this.q0 = this.k * this.q1 - this.q2 + channel[i];
      this.q2 = this.q1;
      this.q1 = this.q0;
      if(++this.j >= this.n) {
        this.magnitude = (this.q1*this.q1 + this.q2*this.q2 - this.q1*this.q2*this.k) / (this.n*this.n);
        this.q0 = 0;
        this.q1 = 0;
        this.q2 = 0;
        this.j = 0;
        done = true;
      }
    }
    return done;
  }
}
