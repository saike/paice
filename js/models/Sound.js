(function () {

  window.Sound = function(frequency, volume, cents){

    this.frequency = frequency || 0;

    this.volume = volume || 0;

    this.cents = cents || 0;

    Sound.prototype.random = function(){

      var self = this;

      self.frequency = Math.floor(Math.random() * Paice.constants.FREQUENCY.MAX) + Paice.constants.FREQUENCY.MIN;

      self.volume = Math.floor(Math.random() * Paice.constants.VOLUME.MAX) + Paice.constants.VOLUME.MIN;

      self.cents = Math.floor(Math.random() * 100);

      return self;

    };

  };

}());
