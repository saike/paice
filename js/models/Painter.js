(function () {

  window.Painter = (function(){

    var painter = function(){

      this.drawing = false;

      this.ctx = false;

      this.sequences = {
        line: []
      };

    };

    painter.prototype.hex_to_int = function(hex){

      return parseInt(hex, 16);

    };

    painter.prototype.int_to_hex = function(int){

      return int.toString(16);

    };

    painter.prototype.make_color = function(pixel){

      var self = this;

      var arr = self.sequences.line;

      if(arr.length < 1) return pixel.fill;

      var sum = 0;
      for( var i = 0; i < arr.length; i++ ){
        sum += parseInt( self.hex_to_int(arr[i].fill), 10 ); //don't forget to add the base
      }

      return self.int_to_hex(Math.floor(sum/arr.length));

    };

    painter.prototype.draw = function(pixel, canvas){

      var self = this;

      if(!self.drawing && pixel) {

        self.sequences.line = [];

        self.drawing = true;

        console.log('start');

        self.ctx = canvas.dom.getContext("2d");

        var color = self.make_color(pixel);

        self.ctx.strokeStyle = '#' + color;
        self.ctx.fillStyle = '#' + color;
        self.ctx.lineWidth = pixel.size[0];
        self.ctx.lineCap = 'round';
        self.ctx.moveTo(pixel.x, pixel.y); // Курсор на начальную позицию
        self.ctx.beginPath();
        self.ctx.lineTo(pixel.x, pixel.y);
        self.ctx.stroke();
        self.sequences.line.push(pixel);

      }

      else if ( pixel && self.drawing ) {
        console.log('move');

        // Текущее положение мыши - начальные координаты
        self.ctx.lineTo(pixel.x, pixel.y);

        self.ctx.stroke();
        //self.ctx.closePath();
        self.sequences.line.push(pixel);
        self.ctx.lineWidth = pixel.size[0];
        self.ctx.strokeStyle = '#' + pixel.fill;
        self.ctx.fillStyle = '#' + pixel.fill;
        //self.ctx.beginPath();

        self.ctx.moveTo(pixel.x, pixel.y); // Курсор на начальную позицию

      }

      else if(!pixel && self.drawing) {
        console.log('finish');

        self.ctx.lineTo(pixel.x, pixel.y);
        self.ctx.stroke();
        self.ctx.closePath();
        self.drawing = false;
        self.ctx = false;
        self.sequences.line = [];

      }

      pixel && Paice.log({ x: pixel.x, y: pixel.y, fill: pixel.fill, sequence: self.sequences.line.map(function(pixel){ return pixel.fill; }) });

    };

    return new painter();

  }());


}());
