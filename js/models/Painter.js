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

        self.ctx.strokeStyle = "rgba("+pixel.fill[0]+","+pixel.fill[1]+","+pixel.fill[2]+","+pixel.fill[3]+")";
        self.ctx.fillStyle = "rgba("+pixel.fill[0]+","+pixel.fill[1]+","+pixel.fill[2]+","+pixel.fill[3]+")";
        self.ctx.lineWidth = pixel.size[0];
        self.ctx.lineCap = 'round';
        self.ctx.moveTo(pixel.x, pixel.y); // Курсор на начальную позицию
        self.ctx.beginPath();
        self.ctx.lineTo(pixel.x, pixel.y);
        self.ctx.stroke();

      }

      else if ( pixel && self.drawing ) {
        console.log('move');

        self.ctx.lineWidth = pixel.size[0];
        self.ctx.strokeStyle = "rgba("+pixel.fill[0]+","+pixel.fill[1]+","+pixel.fill[2]+","+pixel.fill[3]+")";
        self.ctx.fillStyle = "rgba("+pixel.fill[0]+","+pixel.fill[1]+","+pixel.fill[2]+","+pixel.fill[3]+")";

        // Текущее положение мыши - начальные координаты
        self.ctx.lineTo(pixel.x, pixel.y);
        self.ctx.stroke();
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
