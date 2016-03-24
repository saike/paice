(function () {

  window.Painter = (function(){

    var painter = function(){

      this.drawing = false;

      this.ctx = false;

    };

    painter.prototype.draw = function(pixel, canvas){

      var self = this;

      if(!self.drawing && pixel) {

        self.drawing = true;

        console.log('start');

        self.ctx = canvas.dom.getContext("2d");

        self.ctx.strokeStyle = '#' + pixel.fill;
        self.ctx.fillStyle = '#' + pixel.fill;
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
        self.ctx.lineWidth = pixel.size[0];
        //self.ctx.strokeStyle = '#' + pixel.fill;
        //self.ctx.fillStyle = '#' + pixel.fill;
        self.ctx.beginPath();

        self.ctx.moveTo(pixel.x, pixel.y); // Курсор на начальную позицию

      }

      else if(!pixel && self.drawing) {
        console.log('finish');

        self.ctx.lineTo(pixel.x, pixel.y);
        self.ctx.stroke();
        self.ctx.closePath();
        self.drawing = false;
        self.ctx = false;

      }

      pixel && Paice.log({ x: pixel.x, y: pixel.y, fill: pixel.fill });

    };

    return new painter();

  }());


}());
