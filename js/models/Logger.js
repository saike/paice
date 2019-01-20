(function () {

  window.Logger = (function(){

    var logger = function(){

      var self = this;
      riot.observable(self);
      console.log(self);

      var log_process;

      self.log_data = {};

      function trigger(){

        self.trigger('log', self.log_data);

        setTimeout(trigger, 20);

      }

      trigger();

    };

    logger.prototype.log = function(data){

      var self = this;

      for(var p in data){
        self.log_data[p] = data[p];
      }


    };



    return new logger();

  }());

}());
