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
      var mediaStreamSource = null;
      var meter = null;

      self.state = 0;

      audio.prototype.start = function() {

        var screen = Paice.screen();

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

          audioContext = new AudioContext();

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
        console.dir(stream);
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

      audio.prototype.listen = function(elm) {
        audioContext = new AudioContext();
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
        self.state = 1;
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

      audio.prototype.play = function(callback) {
        if (isPlaying) {
          self.stop();
        }

        self.state = 2;

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

      audio.prototype.stop = function(){
        //stop playing and return
        self.state = 0;
        if(!sourceNode) return;
        sourceNode.stop( 0 );
        sourceNode = null;
        analyser = null;
        isPlaying = false;
        if (!window.cancelAnimationFrame)
          window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );
        return "start";
      };

      audio.prototype.deaf = function(){

        self.state = 0;
        if (!window.cancelAnimationFrame)
          window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );

      };

      audio.prototype.toggle = function(callback){

        //Generator.sounds.run ? Generator.sounds.stop() : Generator.sounds.start();

        if(self.state > 0) {
          self.deaf();
          callback && callback(0);
        }
        else {
          self.listen();
          callback && callback(1);
        }


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

      var last_pixel = false;
      var last_sound = false;

      function updatePitch( time ) {
        var cycles = new Array;
        analyser.getFloatTimeDomainData( buf );

        var ac = autoCorrelate( buf, audioContext.sampleRate );
        // TODO: Paint confidence meter on canvasElem here.

        var canvas = Paice.current_canvas;

        function cancel_draw(){
          Logger.log({ frequency: 'vague', cents: '-', volume: '-', note: '-' });
          is_painting = false;
          last_sound = false;
          last_pixel = false;
          canvas && Painter.draw(false, canvas);
        }

        if (ac == -1) {

          cancel_draw();

        } else {

          var pitch = ac;
          var note =  noteFromPitch( pitch );
          var detune = centsOffFromPitch( pitch, note );
          var volume = meter.volume < 0.1 ? meter.volume*10 : meter.volume;


          var sound = new Sound();

          pitch = Math.round( pitch );

          sound.frequency = last_sound && ( Math.abs(last_sound.frequency/pitch) < 0.2 || Math.abs(last_sound.frequency/pitch) > 5) ? last_sound.frequency : pitch;

          sound.volume = last_sound && ( Math.abs(last_sound.volume/volume) < 0.2 || Math.abs(last_sound.volume/volume) > 5) ? last_sound.volume : volume;

          sound.cents = last_sound && ( Math.abs(last_sound.cents/detune) < 0.2 || Math.abs(last_sound.cents/detune) > 5) ? last_sound.cents : detune;

          canvas.set_max(sound);

          Logger.log({
            min_frequency: canvas.min_frequency,
            max_frequency: canvas.max_frequency,
            min_volume: canvas.min_volume,
            max_volume: canvas.max_volume
          });

          var color = Math.floor((sound.frequency / canvas.max_frequency) * Paice.constants.COLORS.MAX).toString(16);
          var width = Math.floor((sound.volume / canvas.max_volume) * Paice.constants.SIZE.MAX);
          var height = Math.floor((sound.frequency / canvas.max_frequency) * Paice.constants.SIZE.MAX);


          var vector = false;

          var pixel_data = {

            fill: color,
            size: [width,height]

          };

          if(last_pixel) {
            //vector = {
            //
            //  x: Math.floor((last_sound.frequency/sound.frequency)*(last_sound.frequency-sound.frequency < 0 ? -Paice.constants.STEP.MAX : Paice.constants.STEP.MAX)),
            //  y: Math.floor((last_sound.volume/sound.volume)*(last_sound.volume-sound.volume < 0 ? -Paice.constants.STEP.MAX : Paice.constants.STEP.MAX))
            //
            //};

            vector = {

              x: Math.floor(((sound.frequency-last_sound.frequency)*8/canvas.max_frequency)*Paice.constants.STEP.MAX),
              y: Math.floor(((sound.volume-last_sound.volume)*8/canvas.max_volume)*Paice.constants.STEP.MAX)

            };

            Logger.log({ vector_x: vector.x, vector_y: vector.y });

            pixel_data.x = last_pixel.x + vector.x;
            pixel_data.y = last_pixel.y + vector.y;

          }

          else {

            var volume_impulse;
            var frequency_impulse;
            //
            frequency_impulse = canvas.max_frequency-sound.frequency;

            volume_impulse = canvas.max_volume/sound.volume;

            //
            //Logger.log({ frequency_impulse: frequency_impulse, volume_impulse: volume_impulse  });
            //
            //vector = {
            //
            //  x: Math.floor((canvas.width/2) + ((canvas.width/2) * frequency_impulse)),
            //  y: Math.floor((canvas.height/2) + ((canvas.height/2) * volume_impulse))
            //
            //};

            pixel_data.x = Math.floor((((canvas.average_frequency+(canvas.average_frequency - sound.frequency))/canvas.max_frequency))*canvas.width);
            pixel_data.y = canvas.height - Math.floor((((canvas.average_volume+(canvas.average_volume-sound.volume))/canvas.max_volume))*canvas.height);

          }

          if(pixel_data.x < -400 || pixel_data.x > (canvas.width + 400) || pixel_data.y < -400 || pixel_data.y > (canvas.height + 400)) {

            cancel_draw();

          }
          else {
            var pixel = new Pixel(pixel_data.x, pixel_data.y, pixel_data.fill, pixel_data.size);
            last_pixel = pixel;
            last_sound = sound;
            is_painting = true;

            canvas && Painter.draw(pixel, canvas);

            //Paice.current_canvas && pixel.render(Paice.current_canvas);

            Logger.log({ frequency: sound.frequency, cents: sound.cents , volume: sound.volume, note: noteStrings[note%12], width: width, height: height });
            //console.log(vector.x, vector.y);
          }


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
        processor.averaging = averaging || 0.90;
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
