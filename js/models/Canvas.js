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

    var counts = 30;

    var count = 0;

    var summer = {

      volume: [],
      frequency: []

    };

    self.set_max = function(sound){

      if(summer.volume.length < counts) {
        summer.frequency.push(sound.frequency);
        summer.volume.push(sound.volume);
      }
      else {
        summer.frequency.splice(0,1);
        summer.frequency.push(sound.frequency);
        summer.volume.splice(0,1);
        summer.volume.push(sound.volume);

      }

      function get_array_max(numArray) {
        return Math.max.apply(null, numArray);
      }

      function get_array_min(numArray) {
        return Math.min.apply(null, numArray);
      }

      self.max_frequency = get_array_max(summer.frequency);
      self.min_frequency = get_array_min(summer.frequency);

      self.max_volume = get_array_max(summer.volume);
      self.min_volume = get_array_min(summer.volume);

    };

  };

}());
