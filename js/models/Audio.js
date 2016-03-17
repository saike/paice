(function () {

  window.Audio = (function(){

    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    var audio = function(){

      var self = this;

      var audioContext = null;
      var isPlaying = false;
      var isLiveInput = false;
      var sourceNode = null;
      var analyser = null;
      var theBuffer = null;
      var DEBUGCANVAS = null;
      var mediaStreamSource = null;
      var meter = null;
      var detectorElem,
        canvasElem,
        waveCanvas,
        pitchElem,
        noteElem,
        detuneElem,
        detuneAmount,
        MAX_SIZE,
        logger;

      self.run = false;

      audio.prototype.start = function() {
        audioContext = new AudioContext();

        var screen = Paice.screen();

        logger = document.createElement('h2');
        screen.insertBefore(logger, screen.firstChild);

        screen.ondragenter = function (e) {
          //this.classList.add("droptarget");
          console.dir(e);
          return false;
        };
        screen.ondragleave = function () {
          //this.classList.remove("droptarget");
          return false;
        };

        screen.ondragover = function(e){
          e = e || event;
          e.preventDefault();
        };
        screen.ondrop = function (e) {
          console.dir(e);
          //this.classList.remove("droptarget");
          e.preventDefault();
          theBuffer = null;

          var reader = new FileReader();
          reader.onload = function (event) {
            console.dir(event);
            audioContext.decodeAudioData( event.target.result, function(buffer) {
              theBuffer = buffer;
            }, function(){alert("error loading!");} );

          };
          reader.onerror = function (event) {
            alert("Error: " + reader.error );
          };
          reader.readAsArrayBuffer(e.dataTransfer.files[0]);

          return false;
        };

      };

      function error() {
        alert('Stream generation failed.');
      }

      function getUserMedia(dictionary, callback) {
        try {
          navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;
          navigator.getUserMedia(dictionary, callback, error);
        } catch (e) {
          alert('getUserMedia threw exception :' + e);
        }
      }

      function gotStream(stream) {
        // Create an AudioNode from the stream.
        mediaStreamSource = audioContext.createMediaStreamSource(stream);

        // Connect it to the destination.
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        mediaStreamSource.connect( analyser );

        // Create a new volume meter and connect it.
        meter = createAudioMeter(audioContext);

        mediaStreamSource.connect(meter);

        updatePitch();
      }

      audio.prototype.listen = function() {
        if (isPlaying) {
          //stop playing and return
          sourceNode.stop( 0 );
          sourceNode = null;
          analyser = null;
          isPlaying = false;
          if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
          window.cancelAnimationFrame( rafID );
        }
        isLiveInput = true;
        self.run = true;
        getUserMedia(
          {
            "audio": {
              "mandatory": {
                "googEchoCancellation": "false",
                "googAutoGainControl": "false",
                "googNoiseSuppression": "false",
                "googHighpassFilter": "false"
              },
              "optional": []
            }
          }, gotStream);
      };

      audio.prototype.play = function togglePlayback() {
        if (isPlaying) {
          //stop playing and return
          sourceNode.stop( 0 );
          sourceNode = null;
          analyser = null;
          isPlaying = false;
          if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
          window.cancelAnimationFrame( rafID );
          return "start";
        }

        self.run = true;

        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = theBuffer;
        sourceNode.loop = true;

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        sourceNode.connect( analyser );
        analyser.connect( audioContext.destination );
        sourceNode.start( 0 );
        meter = createAudioMeter(audioContext);
        sourceNode.connect(meter);
        isPlaying = true;
        isLiveInput = false;
        updatePitch();

        return "stop";

      };

      audio.prototype.deaf = function(){

        self.run = false;
        if (!window.cancelAnimationFrame)
          window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );

      };

      audio.prototype.toggle = function(){

        //Generator.sounds.run ? Generator.sounds.stop() : Generator.sounds.start();

        if(self.run) self.deaf();
        else self.listen();


      };

      var rafID = null;
      var tracks = null;
      var buflen = 1024;
      var buf = new Float32Array( buflen );

      var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

      function noteFromPitch( frequency ) {
        var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
        return Math.round( noteNum ) + 69;
      }

      function frequencyFromNoteNumber( note ) {
        return 440 * Math.pow(2,(note-69)/12);
      }

      function centsOffFromPitch( frequency, note ) {
        return Math.floor( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
      }

      var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.

      function autoCorrelate( buf, sampleRate ) {
        var SIZE = buf.length;
        var MAX_SAMPLES = Math.floor(SIZE/2);
        var best_offset = -1;
        var best_correlation = 0;
        var rms = 0;
        var foundGoodCorrelation = false;
        var correlations = new Array(MAX_SAMPLES);

        for (var i=0;i<SIZE;i++) {
          var val = buf[i];
          rms += val*val;
        }
        rms = Math.sqrt(rms/SIZE);
        if (rms<0.01) // not enough signal
          return -1;

        var lastCorrelation=1;
        for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
          var correlation = 0;

          for (var i=0; i<MAX_SAMPLES; i++) {
            correlation += Math.abs((buf[i])-(buf[i+offset]));
          }
          correlation = 1 - (correlation/MAX_SAMPLES);
          correlations[offset] = correlation; // store it, for the tweaking we need to do below.
          if ((correlation>0.9) && (correlation > lastCorrelation)) {
            foundGoodCorrelation = true;
            if (correlation > best_correlation) {
              best_correlation = correlation;
              best_offset = offset;
            }
          } else if (foundGoodCorrelation) {
            // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
            // Now we need to tweak the offset - by interpolating between the values to the left and right of the
            // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
            // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
            // (anti-aliased) offset.

            // we know best_offset >=1,
            // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
            // we can't drop into this clause until the following pass (else if).
            var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];
            return sampleRate/(best_offset+(8*shift));
          }
          lastCorrelation = correlation;
        }
        if (best_correlation > 0.01) {
          // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
          return sampleRate/best_offset;
        }
        return -1;
//	var best_frequency = sampleRate/best_offset;
      }

      var is_painting = false;

      function updatePitch( time ) {
        var cycles = new Array;
        analyser.getFloatTimeDomainData( buf );
        var ac = autoCorrelate( buf, audioContext.sampleRate );
        // TODO: Paint confidence meter on canvasElem here.

        if (ac == -1) {

          Paice.log({ frequency: 'vague', cents: '-', volume: '-', note: '-' });
          is_painting = false;
          Paice.current_canvas && Painter.draw(false, Paice.current_canvas);

        } else {

          var pitch = ac;
          var note =  noteFromPitch( pitch );
          var detune = centsOffFromPitch( pitch, note );

          var sound = new Sound();

          pitch = Math.round( pitch );

          sound.frequency = is_painting && ( Math.abs(is_painting.frequency/pitch) < 0.8 || Math.abs(is_painting.frequency/pitch) > 1.2) ? is_painting.frequency : pitch;

          sound.volume = is_painting && ( Math.abs(is_painting.volume/meter.volume) < 0.8 || Math.abs(is_painting.volume/meter.volume) > 1.2) ? is_painting.volume : meter.volume;

          sound.cents = is_painting && ( Math.abs(is_painting.cents/detune) < 0.8 || Math.abs(is_painting.cents/detune) > 1.2) ? is_painting.cents : detune;

          if(!is_painting) {

            is_painting = sound;

          }

          var r = Math.floor((is_painting.frequency / Paice.constants.FREQUENCY.MAX) * 255);
          var g = Math.floor((Math.abs(is_painting.volume) / Paice.constants.VOLUME.MAX) * 255);
          var b =  Math.floor((Math.abs(is_painting.cents) / Paice.constants.CENTS.MAX) * 255);
          var alpha = Math.abs(1/(Paice.constants.VOLUME.MAX/is_painting.volume));
          var width = Math.floor((sound.volume / Paice.constants.VOLUME.MAX) * Paice.constants.SIZE.MAX);
          var height = Math.floor((sound.frequency / Paice.constants.FREQUENCY.MAX) * Paice.constants.SIZE.MAX);

          var pixel_data = {

            x: Math.floor((Math.abs(sound.cents) / (Paice.constants.CENTS.MAX)) * Paice.current_canvas.width),
            y: Math.floor((sound.volume / Paice.constants.VOLUME.MAX) * Paice.current_canvas.height),
            fill: [ r,g,b,alpha ],
            size: [width,height]

          };

          var pixel = new Pixel(pixel_data.x, pixel_data.y, pixel_data.fill, pixel_data.size);

          Paice.current_canvas && Painter.draw(pixel, Paice.current_canvas);

          //Paice.current_canvas && pixel.render(Paice.current_canvas);

          Paice.log({ frequency: pitch, cents: ( detune == 0 ? '--' : Math.abs( detune ) ), volume: meter.volume, note: noteStrings[note%12], width: width, height: height });

        }

        if (!window.requestAnimationFrame)
          window.requestAnimationFrame = window.webkitRequestAnimationFrame;
        rafID = window.requestAnimationFrame( updatePitch );
      }

      function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
        var processor = audioContext.createScriptProcessor(512);
        processor.onaudioprocess = volumeAudioProcess;
        processor.clipping = false;
        processor.lastClip = 0;
        processor.volume = 0;
        processor.clipLevel = clipLevel || 0.98;
        processor.averaging = averaging || 0.95;
        processor.clipLag = clipLag || 750;

        // this will have no effect, since we don't copy the input to the output,
        // but works around a current Chrome bug.
        processor.connect(audioContext.destination);

        processor.checkClipping =
          function(){
            if (!this.clipping)
              return false;
            if ((this.lastClip + this.clipLag) < window.performance.now())
              this.clipping = false;
            return this.clipping;
          };

        processor.shutdown =
          function(){
            this.disconnect();
            this.onaudioprocess = null;
          };

        return processor;
      }

      function volumeAudioProcess( event ) {
        var buf = event.inputBuffer.getChannelData(0);
        var bufLength = buf.length;
        var sum = 0;
        var x;

        // Do a root-mean-square on the samples: sum up the squares...
        for (var i=0; i<bufLength; i++) {
          x = buf[i];
          if (Math.abs(x)>=this.clipLevel) {
            this.clipping = true;
            this.lastClip = window.performance.now();
          }
          sum += x * x;
        }

        // ... then take the square root of the sum.
        var rms =  Math.sqrt(sum / bufLength);

        // Now smooth this out with the averaging factor applied
        // to the previous sample - take the max here because we
        // want "fast attack, slow release."
        this.volume = Math.max(rms, this.volume*this.averaging);
      }

    };



    return new audio();

  }());


}());
