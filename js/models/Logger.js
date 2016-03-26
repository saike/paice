(function () {

  window.Logger = (function(){

    var logger = function(){

      var self = this;
      riot.observable(self);
      console.log(self);

    };

    logger.prototype.log = function(data){

      this.trigger('log', data);

    };

    return new logger();

  }());

}());
