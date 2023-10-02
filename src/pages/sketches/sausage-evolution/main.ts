// @ts-nocheck

import './style.css'

import { map } from './utils/map'
import { getDistance2d } from './utils/distance';

//let videoElement, sourceElement;
let timerID = 0;
let isMouseDowned = false;
let firstMouseDowned = false;

let videoElement1, sourceElement1;
let videoElement2, sourceElement2;

let leftSec, rightSec;
let selectedSide;

window.addEventListener('load', init);

function init(){

    initVideo(1);
    initVideo(2);

    // Set left side interaction
    leftSec = document.getElementById('wrap-left-sec');
    leftSec.addEventListener("mousedown", e => {
        if (e.buttons === 1) {
            isMouseDowned = true;
            if(selectedSide != "left"){
                initInteraction("left");
            }
            selectedSide = "left"
        }
    }, { passive: true });
    leftSec.addEventListener("touchstart", e => {
        e.preventDefault();
        isMouseDowned = true;
        if(selectedSide != "left"){
            initInteraction("left");
        }
        selectedSide = "left"
    }, { passive: true });

    // Set right side interaction
    rightSec = document.getElementById('wrap-right-sec');
    rightSec.addEventListener("mousedown", e => {
        if (e.buttons === 1) {
            isMouseDowned = true;
            if(selectedSide != "right"){
                initInteraction("right");
            }
            selectedSide = "right";
        }
    }, { passive: true });
    rightSec.addEventListener("touchstart", e => {
        e.preventDefault();
        isMouseDowned = true;
        if(selectedSide != "right"){
            initInteraction("right");
        }
        selectedSide = "right";
    }, { passive: true });
}

function initInteraction(side){
    if(!firstMouseDowned){
        firstMouseDowned = true;
        eraseWrapSec();
    }

    if(side == "left"){
        //videoElement.playbackRate = -1.0; // Reverse playback is limited to some browsers such as Safari
        // videoElement.src = '/vite-ts-web-sketches/video/sausage1.mp4';
        
        videoElement1.currentTime = videoElement2.duration-videoElement2.currentTime;
        videoElement1.addEventListener("seeked", () => {
            videoElement1.play();
            swapZindex(side)
        });
    }else if(side == "right"){
        console.log("rrrr")
        //videoElement.playbackRate = 1.0;
        //videoElement.src = '/vite-ts-web-sketches/video/sausage2.mp4';
        
        videoElement2.currentTime = videoElement1.duration-videoElement1.currentTime;
        videoElement2.addEventListener("seeked", () => {
            videoElement2.play();
            swapZindex(side)
        });
    }
}

function eraseWrapSec(){
    leftSec.classList.toggle("transparent");
    rightSec.classList.toggle("transparent");
}

function initVideo(id){
    // Create video element
    let videoElement = document.createElement('video');
    videoElement.id = 'sausageVideo' + String(id);
    //videoElement.setAttribute("muted", "");
    videoElement.setAttribute("autoplay", "");
    videoElement.setAttribute("playsinline", "");
    //videoElement.setAttribute("webkit-playsinline", "");
    videoElement.controls = false;
    videoElement.oncontextmenu = function(){ // Disable right-click to prevent video control
        return false;
    }

    /*
    NOTE: 
    For PC, the video will automatically play unless the autoplay attribute is disabled.
    For iOS, the video will not be displayed without the autoplay attribute. However, since the muted attribute is not set, the video can be displayed but not automatically played.
    These logics are not smart, but I couldn't think of a better way to do it when verifying the operation.
    */
    if (!navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
        videoElement.autoplay = false;
    }

    // Set css
    videoElement.style.maxWidth = "100%";
    videoElement.style.maxHeight = "100%";
    videoElement.style.objectFit = "contain"; // Fit in a container while maintaining the aspect ratio
    videoElement.style.display = "block";
    //videoElement.style.zIndex = String(id);

    // Set url of video file
    let sourceElement = document.createElement('source');
    sourceElement.src = '/vite-ts-web-sketches/video/sausage' + String(id) + '.mp4';
    sourceElement.type = 'video/mp4';
    videoElement.appendChild(sourceElement);

    videoElement.addEventListener("loadedmetadata", () => {
        videoElement.currentTime = videoElement.duration/2;

        // videoElement.play();
        // videoElement.pause();

        if(id==1){
            videoElement1 = videoElement
            //videoElement1 = videoElement.cloneNode(true);
            const videoContainer = document.getElementById('video-sec1');
            videoContainer.appendChild(videoElement1);
        }else if(id==2){
            videoElement2 = videoElement
            //videoElement2 = videoElement.cloneNode(true);
            const videoContainer = document.getElementById('video-sec2');
            videoContainer.appendChild(videoElement2);
        }
    });
}

function swapZindex(side){
    console.log("swapZindex...");
    let video1 = document.getElementById('video-sec1');
    let video2 = document.getElementById('video-sec2');

    if(side == "left"){
        video1.style.zIndex = "1"
        video2.style.zIndex = "0"
    }else if(side == "right"){
        video1.style.zIndex = "0"
        video2.style.zIndex = "1"
    }
}