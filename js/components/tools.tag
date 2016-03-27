<tools>

  <div class="tools">
    <div class="clearfix">
      <button class="btn btn-round mic { active: listening() } pull_left" onclick="{ listen }"></button>
      <button class="btn btn-round play { active: playing() } pull_left" onclick="{ play }"></button>
      <!--<button class="btn btn-round play { active: playing() } pull_left" onclick="{ play }"></button>-->

      <button class="btn btn-round clear pull_right" onclick="{ clear }"></button>
      <a name="save">
        <button class="btn btn-round save pull_right"></button>
      </a>
    </div>
  </div>

  <script>

    var self = this;

    self.listening = function(){
      return Audio.state === 1;
    };

    self.listen = function(){

      switch (Audio.state){

        case 0:

          Audio.listen();
          break;

        case 1:

          Audio.deaf();
          break;

        case 2:

          Audio.stop();
          Audio.listen();
          break;

      }

    };

    self.playing = function(){
      return Audio.state === 2;
    };

    self.play = function(){
      switch (Audio.state){

        case 0:

          Audio.play();
          break;

        case 1:

          Audio.deaf();
          Audio.play();
          break;

        case 2:

          Audio.stop();
          break;

      }
    };

    self.clear = function(){

      Paice.current_canvas && Paice.current_canvas.clear();

    };

    self.save.addEventListener('click', function(e){

      console.dir(e);
      var image = Paice.current_canvas && Paice.current_canvas.get_image();
      e.target.parentNode.href = image;
      e.target.parentNode.download = 'Paice_Drawing_' + new Date().toISOString() + '.png';

    }, false);

  </script>

</tools>