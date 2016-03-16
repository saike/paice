(function () {

  window.Canvas = function(w, h){

    this.width = w || Paice.constants.CANVAS[0].WIDTH;

    this.height = h || Paice.constants.CANVAS[0].HEIGHT;

    var dom = document.createElement('canvas');
    dom.width = w || 1280;
    dom.height = h || 720;

    this.dom = dom;

  };

}());
