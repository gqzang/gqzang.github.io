"use strict"

var player = null;

// This code loads the IFrame Player API code asynchronously.
function loadYTVideoFrame() {
    if( player ) {
        player.loadVideoById(vids1[0].id);
        return;
    }
    
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);			
}

function onYouTubeIframeAPIReady() {
    var h = $("#videoSizeSel").val();
    var w = '' + (parseInt(h, 10) * 4 / 3);
    player = new YT.Player('video-placeholder', {
        width: w,
        height: h,
        videoId: vids1[0],
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

let loaded = false;			// iFrame is loaded.

function onPlayerReady(event) {
    event.target.playVideo();
    loaded = true;
}

let prev_state = 100;
let started = false;			// Player is started.

function onPlayerStateChange(event) {
    var state = event.data;
    
    if( state == YT.PlayerState.ENDED ) {
        vids2.push(vids1[curIdx])
        setFinishedVideoList()
        updateVideoList()
        playCurVid();
    }
    
    if( state == YT.PlayerState.PLAYING ) {
        started = true;
    }

    // if player can't start and tried to buffer a video before => video is not good.
    if( started && state == -1 && prev_state == YT.PlayerState.BUFFERING ) {
        console.log( "Ad" );
        var allowAd = $('#allowAd').is(":checked");
        if( ! allowAd ) {				
            setTimeout( playNext, 1000);
        }
    }
    
    prev_state = state;
}

function onError(event) {
    console.log( "Bad Video" );
    prev_state = YT.PlayerState.ENDED;			// prevent into Ad state.
    setTimeout( playNext, 2000);
}

function playCurVid() {
    player.loadVideoById( vids1[curIdx] );
    $('#curv').html( pad(curIdx+1, 3) );
    $('#list').val("" + curIdx)
}

function playNext() {
    curIdx = ( curIdx + 1 ) % vids1.length;
    playCurVid();
}

function playPrev() {
    curIdx = ( curIdx <= 0 ? vids1.length : curIdx ) - 1;
    playCurVid();
}

let vids = []
let vids1 = []                      // un-finished videos ids
let vids2 = []                      // finished videos ids
let curIdx = -1
let statStr = ''
        
const PID = 'ytp-pid'
const FVL = 'ytp-finished'

$(document).ready(function() {
    $('#list').hide();
    $('#list2d').hide();    
    $("#prev").prop('disabled',true).css('opacity',0.5);
    $("#next").prop('disabled',true).css('opacity',0.5);
    
    $("#shuffle").click(function() { 
        vids = []; 
        statStr = '';
        getVids();				
    }); 

    $("#reset").click(function() { 
        const userConfirmed = confirm("Do you want to reset?")
        if (userConfirmed) {
            localStorage.removeItem(PID)
            localStorage.removeItem(FVL)
            alert("PID and FVL are cleared.")   
        }        
    }); 

    $("#prev").click(function() { playPrev() }) 
    $("#next").click(function() { playNext() }) 
    
    $('#list').on('change', function() {
        curIdx = parseInt( $(this).val(), 10 );
        playCurVid();
    });
    
    $("#list2").click(function() { 
        idx = parseInt( $(this).val(), 10 )
        vids2.splice(idx, 1)
        setFinishedVideoList()
        updateVideoList()
    }); 

    $('#videoSizeSel').on('change', function() {
        if( loaded ) {
            var h = $(this).val();
            var w = '' + (parseInt(h, 10) * 4 / 3);
            player.setSize(width=w, height=h);
        }
    });
}); 

function getVids(PageToken=null) {
    const pid_ = localStorage.getItem(PID) || 'PLd-qt_xzUXS7oNqHCn4OHy9mmQiakRaZ7'
    pid = $("#pid").val().trim() || pid_
    localStorage.setItem(PID, pid);
    $("#pid").val(pid)

    let apiKey = "AIzaSyBeU6QR1y884A_GwIjjBx9zAmR4FF_EGFE";				// ytplr-srv-1
    $.get(
        "https://www.googleapis.com/youtube/v3/playlistItems",{
            part: 'snippet', 
            maxResults: 50,
            playlistId: pid,
            pageToken: PageToken,
            key: apiKey
        },
        function(data){
            myPlan(data);
        }        
    )
    .fail(function() {
        alert("Can't load playlist: wrong key or quota exceeded.")
    });  
}	

function myPlan(data){
    statStr = statStr + '.';
    $('#status').html(statStr);

    let nextPageToken = data.nextPageToken;
    let pageLen = data.items.length;
    for(let i = 0; i < pageLen; i ++) {
        let snippet = data.items[i].snippet;
        let title = snippet.title;
        title = title.length > 80 ? title.substr(0, 79) : title;
        let video = {"id": snippet.resourceId.videoId, "title": title};
        vids.push(video)
    }
    if( typeof nextPageToken == 'undefined' ) {
        playVids();
    } else {
        getVids(nextPageToken);
    }
}

function updateVideoList() {
    $('#list').empty();
    vids1 = []
    let select = document.getElementById('list');
    for(let i = 0, j = 0; i < vids.length; i ++) {
        if(vids2.includes(vids[i].id))
            continue
        let opt = document.createElement('option');
        opt.value = "" + j
        opt.innerHTML = pad(j+1, 3) + " ~~ " + vids[i].title;
        select.appendChild(opt);
        j ++
        vids1.push(vids[i].id)
    }
    $('#list').val("0");
    $('#all').html(vids1.length + ' videos');
    document.getElementById('list').size = vids1.length > 10 ? 10 : vids1.length;
}

function getFinishedVideoList() {
    vids2 = []
    const vidsf = JSON.parse( localStorage.getItem(FVL) ) || [];
    for(const v of vids) 
        if(vidsf.includes(v.id)) vids2.push(v.id)
    setFinishedVideoList()
}

function setFinishedVideoList() {
    localStorage.setItem(FVL, JSON.stringify(vids2));

    $('#list2').empty();
    let select = document.getElementById('list2');
    for(let i = 0, j = 0; i < vids.length; i ++) {
        if(! vids2.includes(vids[i].id))
            continue
        var opt = document.createElement('option');
        opt.value = "" + j
        opt.innerHTML = pad(j+1, 3) + " ~~ " + vids[i].title;
        select.appendChild(opt);
        j ++
    }
    $('#list2').val("0");  
    document.getElementById('list2').size = vids2.length > 10 ? 10 : vids2.length;  
}

function playVids() {
    getFinishedVideoList()
    updateVideoList()
    curIdx = 0;
    
    $('#list').show();
    $('#list2d').show();

    // *** Can only load video after all video id are loaded ***
    loadYTVideoFrame();

    $("#prev").prop('disabled',false).css('opacity', 1);
    $("#next").prop('disabled',false).css('opacity', 1);
    $('#curv').html( pad(curIdx+1, 3) );
    
    $('#list').css("background-color","Lavender");
}

function pad(number, length) {
    let str = '' + number;
    while( str.length < length ) { str = '0' + str; }
    return str;
}
