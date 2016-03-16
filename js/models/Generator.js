(function () {

  window.Generator = (function(){

    var generator = {};

    var frame = false;

    generator.sounds = {

      run: false,

      start: function(){

        generator.sounds.run = true;

        function generate_sound(){

          var sound = new Sound().random();

          //Paice.logger.innerText = sound.frequency + ' ' + sound.volume;

          generator.sounds.on_create(sound);

          frame = setTimeout(generate_sound, 1000/Paice.constants.FPS);

        }

        generate_sound();

      },

      stop: function(){

        generator.sounds.run = false;

        frame && clearTimeout(frame);

      },

      on_create: function(sound){

        var r = Math.floor((sound.frequency / Paice.constants.FREQUENCY.MAX) * 255);
        var g = Math.floor((Math.abs(sound.volume) / Paice.constants.VOLUME.MAX) * 255);
        var b =  Math.floor(((sound.frequency * Math.abs(sound.volume)) / ( Paice.constants.FREQUENCY.MAX * Paice.constants.VOLUME.MAX)) * 255);

        var pixel_data = {

          x: (sound.frequency / Paice.constants.FREQUENCY.MAX) * Paice.current_canvas.width,
          y: (Math.abs(sound.volume) / Paice.constants.VOLUME.MAX) * Paice.current_canvas.height,
          fill: [ r,g,b,1 ]

        };

        var pixel = new Pixel(pixel_data.x, pixel_data.y, pixel_data.fill);

        Paice.current_canvas && pixel.render(Paice.current_canvas);

      }

    };

    return generator;

  }());

}());
