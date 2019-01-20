(function () {

  window.Canvas = function(w, h){

    var self = this;

    self.width = window.innerWidth || w || Paice.constants.CANVAS[0].WIDTH;

    self.height = window.innerHeight || h || Paice.constants.CANVAS[0].HEIGHT;

    window.addEventListener('resize', function(){

      self.width = window.innerWidth;
      self.height = window.innerHeight;
      self.dom.width = self.width;
      self.dom.height =self.height;

    });

    var dom = document.createElement('canvas');
    dom.width = self.width;
    dom.height =self.height;

    self.dom = dom;

    self.clear = function(){

      self.dom.getContext('2d').clearRect(0, 0, self.width, self.height);

    };

    self.min_frequency = Paice.constants.FREQUENCY.MIN;

    self.max_frequency = Paice.constants.FREQUENCY.MAX;

    self.min_volume = Paice.constants.VOLUME.MIN;

    self.max_volume = Paice.constants.VOLUME.MAX;

    self.average_frequency = (Paice.constants.FREQUENCY.MIN + Paice.constants.FREQUENCY.MAX)/2;
    self.average_volume = (Paice.constants.VOLUME.MIN + Paice.constants.VOLUME.MAX)/2;

    var counts = 144;

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

      var new_max_frequency = get_array_max(summer.frequency);
      var new_min_frequency = get_array_min(summer.frequency);

      var new_max_volume = get_array_max(summer.volume);
      var new_min_volume = get_array_min(summer.volume);

      self.max_frequency = self.max_frequency < new_max_frequency ? Paice.constants.FREQUENCY.MAX : new_max_frequency;
      self.min_frequency = self.min_frequency > new_min_frequency ? Paice.constants.FREQUENCY.MIN : new_min_frequency;
      self.max_volume = self.max_volume < new_max_volume ? Paice.constants.VOLUME.MAX : new_max_volume;
      self.min_volume = self.min_volume < new_min_volume ? Paice.constants.VOLUME.MAX : new_min_volume;

      self.average_frequency = summer.frequency.reduce(function(a, b) { return a + b; })/summer.frequency.length;
      self.average_volume =  summer.volume.reduce(function(a, b) { return a + b; })/summer.volume.length;

      Logger.log({
        avg_freq: self.average_frequency,
        avg_vol: self.average_volume
      });

    };

    self.get_image = function(){

      return self.dom.toDataURL("image/png");

    };

  };

}());
