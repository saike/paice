(function () {

  window.Paice = (function(){

    var paice = function(){

      this.current_canvas = false;

      this.constants = {

        FREQUENCY: {
          MIN: 50,
          MAX: 12000
        },

        VOLUME: {

          MIN: 0,
          MAX: 0.7

        },

        CENTS: {

          MIN: -40,
          MAX: 40

        },

        SIZE: {

          MIN: 5,
          MAX: 50

        },

        CANVAS: [
          {
            WIDTH: 1280,
            HEIGHT: 720
          }
        ],

        COLORS: {
          MAX: 16777216
        },

        STEP: {
          MAX: 40,
          MIN: 0
        },

        FPS: 100

      };

      this.logger = document.getElementById('logger');

    };

    paice.prototype.screen = function(){

      return document.getElementById('screen');

    };

    paice.prototype.start = function(){

      var canvas = this.current_canvas = new Canvas();

      this.screen().appendChild(canvas.dom);

      //Generator.sounds.start();

      Audio.start();

      riot.mount('paice');

    };

    return new paice;

  }());

  window.addEventListener('load', function(){
    Paice.start();
  });

}());
