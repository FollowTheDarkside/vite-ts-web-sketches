// @ts-nocheck

import './style.css'

let videoElement;
let videoTime = 0;
let timerID = 0;
let isMouseDowned = false;
let firstMouseDowned = false;

window.addEventListener('load', init);

function init(){
    // Create video element
    videoElement = document.createElement('video');
    videoElement.id = 'onikuVideo';
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
    videoElement.style.cursor = "pointer";

    // Set url of video file
    const sourceElement = document.createElement('source');
    sourceElement.src = '/vite-ts-web-sketches/video/oniku.mp4';
    sourceElement.type = 'video/mp4';
    videoElement.appendChild(sourceElement);

    const videoContainer = document.getElementById('video-sec');
    videoContainer.appendChild(videoElement);

    // videoElement.play();
    // videoElement.pause();

    // Set interaction
    videoContainer.addEventListener("mousedown", e => {
        isMouseDowned = true;
        initOnikuInteraction();
    }, { passive: true });
    videoContainer.addEventListener("touchstart", e => {
        e.preventDefault();
        isMouseDowned = true;
        initOnikuInteraction();
    }, { passive: true });

    videoContainer.addEventListener("mouseup", e => {
        isMouseDowned = false;
    }, { passive: true });
    videoContainer.addEventListener("touchend", e => {
        e.preventDefault();
        isMouseDowned = false;
    }, { passive: true });
}

function initOnikuInteraction(){
    if(!firstMouseDowned){
        firstMouseDowned = true;
        eraseTitleText();
    }

    clearInterval(timerID);
    timerID = setInterval(setPlaybackPosition, 100);
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

function eraseTitleText(){
    let titleText = document.getElementById('title-text');
    titleText.classList.toggle("transparent");
}