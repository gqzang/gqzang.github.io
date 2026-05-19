var player = null;

// This code loads the IFrame Player API code asynchronously.
function loadYTVideoFrame() {
    if( player ) {
        player.loadVideoById(vids[0].id);
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
        videoId: vids[0].id,
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
    console.log(state);
    
    if( state == YT.PlayerState.ENDED ) {
        playNext();
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
    player.loadVideoById( vids[curIdx].id );
    $('#curv').html( pad(curIdx+1, 3) );
    $('#list').val("" + curIdx)
}

function playNext() {
    curIdx = ( curIdx + 1 ) % vids.length;
    playCurVid();
}

function playPrev() {
    curIdx = ( curIdx <= 0 ? vids.length : curIdx ) - 1;
    playCurVid();
}

// prepare video list

let vids = [];
let curIdx = -1;
let curPid = null;
let statStr = '';
        
$(document).ready(function() {
    $('#list').hide();
    $("#prev").prop('disabled',true).css('opacity',0.5);
    $("#next").prop('disabled',true).css('opacity',0.5);
    
    $("#shuffle").click(function() { 
        vids = []; 
        statStr = '';
        getVids();				
    }); 

    $("#prev").click(function() { 
        playPrev();
    }); 
    
    $("#next").click(function() { 
        playNext();
    }); 
    
    $('#list').on('change', function() {
        curIdx = parseInt( $(this).val(), 10 );
        playCurVid();
    });
    
    $('#videoSizeSel').on('change', function() {
        if( loaded ) {
            var h = $(this).val();
            var w = '' + (parseInt(h, 10) * 4 / 3);
            player.setSize(width=w, height=h);
        }
    });
}); 

function getVids(PageToken=null){
    pid = $("#pid").val().trim();
    console.log(pid)
    if( pid == '' ) pid = 'PLd-qt_xzUXS7oNqHCn4OHy9mmQiakRaZ7'

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

    nextPageToken = data.nextPageToken;
    pageLen = data.items.length;
    for( i=0; i < pageLen; i ++ ) {
        snippet = data.items[i].snippet;
        title = snippet.title;
        title = title.length > 80 ? title.substr(0, 79) : title;
        video = {"id": snippet.resourceId.videoId, "title": title};
        vids.push(video)
    }
    if( typeof nextPageToken == 'undefined' ) {
        total = data.pageInfo.totalResults;
        $('#all').html(vids.length + '/' + total + ' videos');
        
        console.log("Playlist loaded");
        playVids();
    } else {
        getVids(nextPageToken);
    }
}

function playVids() {
    $('#list').empty();
    select = document.getElementById('list');
    for( i = 0; i < vids.length; i ++ ) {
        var opt = document.createElement('option');
        opt.value = "" + i;
        opt.innerHTML = pad(i+1, 3) + " ~~ " + vids[i].title;
        select.appendChild(opt);
    }
    curIdx = 0;
    
    $('#list').show();
    document.getElementById('list').size = vids.length > 10 ? 10 : vids.length;
    
    // *** Can only load video after all video id are loaded ***
    loadYTVideoFrame();

    $("#prev").prop('disabled',false).css('opacity', 1);
    $("#next").prop('disabled',false).css('opacity', 1);
    $('#curv').html( pad(curIdx+1, 3) );
    
    $('#list').val("0");
    $('#list').css("background-color","Lavender");
}

function pad(number, length) {
    var str = '' + number;
    while( str.length < length ) { str = '0' + str; }
    return str;
}
