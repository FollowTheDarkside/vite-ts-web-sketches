import './style.css'
import Sketch from "./Sketch";

const canvas = document.getElementById("myCanvas")!;

new Sketch({
    $canvas: canvas
});