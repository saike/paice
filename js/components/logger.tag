<logger>

  <div show="{ show }" class="logger" name="logger"></div>

  <style type="text/css">

    .logger {
      position: fixed;
      left: 0;
      top: 0;
      text-align: left;
      display: block;
      padding: 8px;
      right: 0;
      word-break: break-all;
    }

  </style>

  <script>

    var self = this;

    self.current = {};

    self.show = false;

    self.log = function(obj){

      for(var p in obj){
        self.current[p] = obj[p];
      }

      var log = '';

      for(var l in self.current){

        log+=l + ': ' + self.current[l] + '</br> ';

      }

      self.logger.innerHTML = log;

    };

    Logger.on('log', function(data){

      self.log(data);

    });

    window.addEventListener('keyup', function(e){
      if(e.keyCode === 76){

        self.show = !self.show;

        self.update();

      }
    });

  </script>

</logger>