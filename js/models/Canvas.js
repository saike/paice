(function () {

  window.Canvas = function(w, h){

    var self = this;

    self.width = w || Paice.constants.CANVAS[0].WIDTH;

    self.height = h || Paice.constants.CANVAS[0].HEIGHT;

    var dom = document.createElement('canvas');
    dom.width = w || 1280;
    dom.height = h || 720;

    self.dom = dom;

    self.clear = function(){



    };

    self.min_frequency = 0;

    self.max_frequency = 0;

    self.min_volume = 0;

    self.max_volume = 0;

    self.set_max = function(sound){


      if(self.min_frequency === 0 || sound.frequency < self.min_frequency){

        self.min_frequency = sound.frequency;

      }

      if(self.min_volume === 0 || sound.volume < self.min_volume){

        self.min_volume = sound.volume;

      }

      if(self.max_frequency === 0 || sound.frequency > self.max_frequency){

        self.max_frequency = sound.frequency;

      }

      if(self.max_volume === 0 || sound.volume > self.max_volume){

        self.max_volume = sound.volume;

      }

    };

  };

}());
