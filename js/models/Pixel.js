(function () {

  window.Pixel = function(x,y,fill,size){

    this.x = x || 0;

    this.y = y || 0;

    this.fill = fill || [ 0,0,0,1 ];

    this.size = size || [ 5,5 ];

    Pixel.prototype.render = function(canvas){

      var self = this;
      var ctx = canvas.dom.getContext("2d");

//      var id = ctx.createImageData(2,2); // only do this once per page
//      id.data = self.fill;                        // only do this once per page
//      ctx.putImageData(id , self.x, self.y );

      console.dir(ctx);
      ctx.fillStyle = "rgba("+self.fill[0]+","+self.fill[1]+","+self.fill[2]+","+self.fill[3]+")";
      ctx.fillRect( self.x, self.y, self.size[0], self.size[1] );

      Paice.log({ x: self.x, y: self.y, fill: self.fill });

      console.log(self.x + ' ' + self.y + ' ' + self.fill);

    };

    Pixel.prototype.random = function(canvas){

      var self = this;
      self.x = Math.floor(Math.random() * canvas.width);
      self.y = Math.floor(Math.random() * canvas.height);

      var r = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      var b = Math.floor(Math.random() * 255);
      var alpha = Math.random().toFixed(1);

      self.fill = [r,g,b,alpha];

      return self;

    };

  };

}());
