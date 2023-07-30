// @ts-nocheck

import './style.css'

let videoElement;
let videoTime = 0;
let timerID = 0;
let isMouseDowned = false;

window.addEventListener('load', init);

function init(){
    // Create video element
    videoElement = document.createElement('video');
    videoElement.id = 'onikuVideo';
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.controls = false;
    videoElement.oncontextmenu = function(){ // Disable right-click to prevent video control
        return false;
    }

    // Set css
    videoElement.style.maxWidth = "100%";
    videoElement.style.maxHeight = "100%";
    videoElement.style.objectFit = "contain"; // Fit in a container while maintaining the aspect ratio
    videoElement.style.display = "block";
    videoElement.style.cursor = "pointer";

    // Set url of video file
    const sourceElement = document.createElement('source');
    sourceElement.src = '/vite-ts-web-sketches/video/oniku.mp4';
    sourceElement.type = 'video/mp4';
    videoElement.appendChild(sourceElement);

    const videoContainer = document.getElementById('video-sec');
    videoContainer.appendChild(videoElement);

    // videoElement.play();

    // Set interaction
    videoContainer.addEventListener("mousedown", e => {
        isMouseDowned = true;

        clearInterval(timerID);
        timerID = setInterval(setPlaybackPosition, 100);
    }, { passive: true });
    videoContainer.addEventListener("touchstart", e => {
        e.preventDefault();
        isMouseDowned = true;

        clearInterval(timerID);
        timerID = setInterval(setPlaybackPosition, 100);
    }, { passive: true });

    videoContainer.addEventListener("mouseup", e => {
        isMouseDowned = false;
    }, { passive: true });
    videoContainer.addEventListener("touchend", e => {
        e.preventDefault();
        isMouseDowned = false;
    }, { passive: true });
}

function setPlaybackPosition(){
    // console.log("videoTime:", videoTime, "/", videoElement.duration);
    videoTime = isMouseDowned ? videoTime+=0.1 : videoTime-=0.1;
    if(videoTime > videoElement.duration){
        videoTime = videoElement.duration;
    }else if(videoTime < 0){
        videoTime = 0.0;
        clearInterval(timerID);
    }
    videoElement.currentTime = videoTime;
};