// @ts-nocheck

import './style.css'

let myp5 = new p5(( sketch ) => {
  
  sketch.setup = () => {
    sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
  };

  sketch.draw = () => {
    // sketch.background(0, 255, 255);
    if (sketch.mouseIsPressed) {
      sketch.fill(0);
    } else {
      sketch.fill(255);
    }
    sketch.ellipse(sketch.mouseX, sketch.mouseY, 80, 80);
  };

  sketch.windowResized = () => {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
  }
  
  sketch.keyTyped = () => {
    switch (sketch.key) {
      case 'f':
        let fs = sketch.fullscreen();
        sketch.fullscreen(!fs);
        break;
      default:
        break;
    }
  }
});