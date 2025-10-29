let player = null;
var vid = "HKxALQvzpF0";

function loadYTVideoFrame() {
    if( player ) return player.loadVideoById(vid);
    
    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);			
}

function onYouTubeIframeAPIReady() {
    let h = $("#videoSizeSel").val();
    let w = '' + (parseInt(h, 10) * 4 / 3);
    player = new YT.Player('video-placeholder', {
        width: w,
        height: h,
        videoId: vid,
        playerVars: {
            'autoplay': 1,
            'controls': 1,
            'showinfo': 0,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onError
        }
    });
}

let playing = false;
let loaded = false;

function onPlayerReady(event) {
    event.target.playVideo();
    loaded = true;
}

function onPlayerStateChange(event) {
    let state = event.data;        
    if( state == YT.PlayerState.ENDED ) playVideo();    
    playing = ( state == YT.PlayerState.PLAYING );
}

function onError(event) {
    setTimeout( playVideo, 100000);
}

function playVideo() {
    player.loadVideoById( vid );
}	

function ytp_main() {       
    loadYTVideoFrame();

    $('#videoSizeSel').on('change', function() {
        if( loaded ) {
            let h = $(this).val();
            let w = '' + (parseInt(h, 10) * 4 / 3);
            player.setSize(width=w, height=h);
        }
    });

    $('#vid').on('change', function() {
        vid = $('#vid').val()
        console.log(vid)
        playVideo()
    });
}