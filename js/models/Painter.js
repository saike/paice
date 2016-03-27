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

    painter.prototype.hex_to_rgb = function(hex) {
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    painter.prototype.rgb_to_hex = function(r, g, b) {
      return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    painter.prototype.make_color = function(pixel){

      var self = this;

      var arr = self.sequences.line;

      if(!pixel) return;

      if(arr.length < 1) return pixel.fill;

      var sum = {
        r: 0,
        g: 0,
        b: 0
      };

      for( var p = 0; p < arr.length; p++ ){
        var pix = arr[p];
        var rgb = self.hex_to_rgb(pix.fill);
        if(rgb){
          sum.r += rgb.r;
          sum.g += rgb.g;
          sum.b += rgb.b;
        }

      }

      return self.rgb_to_hex(sum.r/arr.length, sum.g/arr.length, sum.b/arr.length);

    };

    painter.prototype.draw = function(pixel, canvas){

      var self = this;

      var color;

      if(!self.drawing && pixel) {

        self.sequences.line = [];

        self.drawing = true;

        console.log('start');

        self.ctx = canvas.dom.getContext("2d");

        self.sequences.line.push(pixel);
        color = self.make_color(pixel);

        self.ctx.strokeStyle = '#' + color;
        self.ctx.fillStyle = '#' + color;
        self.ctx.lineWidth = pixel.size[0];
        self.ctx.lineCap = 'round';
        self.ctx.moveTo(pixel.x, pixel.y); // Курсор на начальную позицию
        self.ctx.beginPath();
        self.ctx.lineTo(pixel.x, pixel.y);
        self.ctx.stroke();

      }

      else if ( pixel && self.drawing ) {
        console.log('move');

        // Текущее положение мыши - начальные координаты
        self.ctx.lineTo(pixel.x, pixel.y);

        self.ctx.stroke();
        self.ctx.closePath();
        self.sequences.line.push(pixel);
        color = self.make_color(pixel);
        self.ctx.strokeStyle = '#' + color;
        self.ctx.fillStyle = '#' + color;
        self.ctx.lineWidth = pixel.size[0];
        self.ctx.beginPath();

        self.ctx.moveTo(pixel.x, pixel.y); // Курсор на начальную позицию

      }

      else if(!pixel && self.drawing) {
        console.log('finish');
        color = self.make_color();
        self.ctx.strokeStyle = '#' + color;
        self.ctx.fillStyle = '#' + color;

        self.ctx.lineTo(pixel.x, pixel.y);
        self.ctx.stroke();
        self.ctx.closePath();
        self.drawing = false;
        self.ctx = false;
        self.sequences.line = [];

      }
      console.log(color);

      pixel && Logger.log({ x: pixel.x, y: pixel.y, fill: pixel.fill });

    };

    return new painter();

  }());


}());
