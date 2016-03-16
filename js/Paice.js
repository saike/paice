(function () {

  window.Paice = (function(){

    var paice = function(){

      this.current_canvas = false;

      this.constants = {

        FREQUENCY: {
          MIN: 1,
          MAX: 6000
        },

        VOLUME: {

          MIN: 0,
          MAX: 0.5

        },

        CENTS: {

          MIN: 0,
          MAX: 100

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

    };

    var current_log = {};

    paice.prototype.log = function(obj){

      for(var p in obj){
        current_log[p] = obj[p];
      }

      var log = '';

      for(var l in current_log){

        log+=l + ': ' + current_log[l] + ' ';

      }

      this.logger.innerHTML = log;

    };

    return new paice;

  }());

  window.addEventListener('load', function(){
    Paice.start();
  });

}());
