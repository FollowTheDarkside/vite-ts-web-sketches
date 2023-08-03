// @ts-nocheck

import './style.css'

import { map } from './utils/map'
import { getDistance2d } from './utils/distance';

let videoElement;
let timerID = 0;
let isMouseDowned = false;
let firstMouseDowned = false;

let startPosY = 0;
let playbackMovement = 0;

window.addEventListener('load', init);

function init(){
    // Create video element
    videoElement = document.createElement('video');
    videoElement.id = 'cucumberVideo';
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

    // Set url of video file
    const sourceElement = document.createElement('source');
    sourceElement.src = '/vite-ts-web-sketches/video/cucumber.mp4';
    sourceElement.type = 'video/mp4';
    videoElement.appendChild(sourceElement);

    const videoContainer = document.getElementById('video-sec');
    videoContainer.appendChild(videoElement);

    // videoElement.play();
    // videoElement.pause();

    // Set interaction
    videoContainer.addEventListener("mousedown", e => {
        if (e.buttons === 1) {
            isMouseDowned = true;
            document.body.style.cursor = "grabbing";
            initInteraction();
            startPosY = e.clientY;
        }
    }, { passive: true });
    videoContainer.addEventListener("touchstart", e => {
        e.preventDefault();
        isMouseDowned = true;
        document.body.style.cursor = "grabbing";
        initInteraction();
        startPosY = e.touches[0].pageY;
    }, { passive: true });

    videoContainer.addEventListener("mouseup", e => {
        isMouseDowned = false;
        document.body.style.cursor = "grab";
        clearInterval(timerID);
    }, { passive: true });
    videoContainer.addEventListener("touchend", e => {
        e.preventDefault();
        isMouseDowned = false;
        document.body.style.cursor = "grab";
        clearInterval(timerID);
    }, { passive: true });

    videoContainer.addEventListener("mousemove", e => {
        if (e.buttons === 1) {
            playbackMovement = 0.1*map(Math.abs(startPosY - e.clientY), 0, window.innerHeight, 0, videoElement.duration);
            if(startPosY > e.clientY)playbackMovement *= -1;
        }
    }, { passive: true });
    videoContainer.addEventListener("touchmove", e => {
        e.preventDefault();
        playbackMovement = 0.2*map(Math.abs(startPosY - e.touches[0].pageY), 0, window.innerHeight, 0, videoElement.duration);
        if(startPosY > e.touches[0].pageY)playbackMovement *= -1;
    }, { passive: true });
}

function initInteraction(){
    if(!firstMouseDowned){
        firstMouseDowned = true;
        eraseTitleText();
    }

    clearInterval(timerID);
    playbackMovement = 0;
    timerID = setInterval(setPlaybackPosition, 100);
}

function setPlaybackPosition(){
    // console.log("videoTime:", playbackMovement, "/", videoElement.duration);
    videoElement.currentTime += playbackMovement;
};

function eraseTitleText(){
    let titleText = document.getElementById('title-text');
    titleText.classList.toggle("transparent");
}