"use strict"

var player = null;

// This code loads the IFrame Player API code asynchronously.
function loadYTVideoFrame() {
    if( player ) {
        player.loadVideoById(vids1[0] || VID0);
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
        videoId: vids1[0] || VID0,
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
        setupBothVideoLists()
        playCurVid();
    }
    
    if( state == YT.PlayerState.PLAYING ) {
        started = true;
    }

    // if player can't start and tried to buffer a video before => video is not good.
    if( started && state == -1 && prev_state == YT.PlayerState.BUFFERING ) {
        // console.log( "Ad" );
        // setTimeout( playNext, 1000);
    }
    
    prev_state = state;
}

function onError(event) {
    console.log( "Bad Video" );
    prev_state = YT.PlayerState.ENDED;			// prevent into Ad state.
    setTimeout( playNext, 2000);
}

function playCurVid() {
    player.loadVideoById( vids1[curIdx] || VID0 );
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
let vids2_ = []                      // finished videos (id: title)
let curIdx = -1
let statStr = ''
        
const PID = 'ytp-pid'
const PID0 = 'PLd-qt_xzUXS7oNqHCn4OHy9mmQiakRaZ7'
const VID0 = 'eUZhgWZV2JQ'
let pid = ''
let title = ''
let pSet = {}
let pHist = {}
const FVL = 'ytp-finished'

function showPLhistory() {
    const pSet = JSON.parse( localStorage.getItem(PID + 'set') ) || {}
    $('#plhis').empty();
    let select = document.getElementById('plhis'), j = 0
    for (const [pid_, title_] of Object.entries(pSet)) {
        var opt = document.createElement('option');
        opt.value = "" + j
        opt.innerHTML = title_ + " ~~ " + pid_
        pHist[j] = pid_
        select.appendChild(opt)
        j ++
    }
    $('#plhis').val("0");  
    document.getElementById('plhis').size = j > 10 ? 10 : j
}

$(document).ready(function() {
    $('#search').hide()
    $('#pan_pl').hide()
    $('#list').hide()
    $('#list2d').hide() 
    $("#prev").prop('disabled',true).css('opacity',0.5)
    $("#next").prop('disabled',true).css('opacity',0.5)
    $("#cmd").hide()

    $('#cmd').on('change', function() {
        if($(this).val() == 'reset') {
            if(confirm("Are you sure to clear history list")) {
                localStorage.setItem(FVL+pid, JSON.stringify([]))
                playVids()
            }
        }
        if($(this).val() == 'done') {
            if(confirm("Are you sure to move all videos to finished list")) {
                localStorage.setItem(FVL+pid, JSON.stringify(vids.map(x => x.id)))
                playVids()
            }
        }
        $('#cmd').val('')
    })

    showPLhistory()
   
    $("#btn_pl").click(function() { 
        $('#pan_pl').toggle();
    }); 

    $("#play").click(function() { 
        vids = []
        statStr = ''
        getVids()
        $('#rorder').hide()
        $('#lorder').hide()
        $('#pan_pl').hide()
        $("#btn_pl").hide()
    });

    $("#prev").click(function() { playPrev() }) 
    $("#next").click(function() { playNext() }) 
    
    $('#list').on('change', function() {
        curIdx = parseInt( $(this).val(), 10 )
        playCurVid();
    })

    $("#list").click(function() {
        if(vids1.length == 1) {
            curIdx = 0
            playCurVid()
        } 
    })
    
    $("#plhis").click(function() { 
        let idx = parseInt( $(this).val(), 10 )
        $("#pid").val(pHist[idx])
    }) 

    $("#list2").click(function() { 
        restoreVideo($(this).val())
    })

    $('#videoSizeSel').on('change', function() {
        if( loaded ) {
            var h = $(this).val();
            var w = '' + (parseInt(h, 10) * 4 / 3)
            player.setSize(w, h);
        }
    })

    search_main()
})

function getVids(PageToken=null) {
    const pid_ = localStorage.getItem(PID) || PID0
    pid = $("#pid").val().trim() || pid_
    localStorage.setItem(PID, pid);
    $("#pid").val(pid)

    // let apiKey = "AIzaSyBeU6QR1y884A_GwIjjBx9zAmR4FF_EGFE";				// ytplr-srv-1
    let apiKey = "AIzaSyCZ2Tbynge8XFLghYlOPXif6u9vGnjaZ7U"				// gq_yt
    $.get(
        "https://www.googleapis.com/youtube/v3/playlists",{
            part: 'snippet',
            id: pid,
            key: apiKey
        },
        function(data){
            title = data.items[0].snippet.title
        }        
    ).fail(() => {title = ''})
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
    .fail(() => {
        alert("Can't load playlist: wrong key or quota exceeded.")
        localStorage.setItem(PID, '')
        $("#pid").val('')
    })
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
        if(vids.length > 1) $('#search').show()
    } else {
        getVids(nextPageToken);
    }
}

function setupVideoList(lstName, vlst2, rev=false) {
    $(`#${lstName}`).empty()
    let vlst = []
    let select = document.getElementById(lstName)
    for(let i = 0, j = 0; i < vids.length; i ++) {
        let vid = vids[rev ? i: vids.length - 1 - i]
        if((rev ^ vlst2.includes(vid.id)) | (vid.title.trim() == 'Private video'))
            continue
        let opt = document.createElement('option')
        opt.value = "" + j
        opt.innerHTML = pad(j, 3) + " ~~ " + vid.title;
        select.appendChild(opt)
        j ++
        vlst.push(vid.id)
        if(rev) vids2_.push(vid)            // for finished, populate this for search
    }
    $(`#${lstName}`).val('0')
    document.getElementById(lstName).size = vlst.length > 10 ? 10 : vlst.length
    return vlst
}

function setupBothVideoLists() {
    localStorage.setItem(FVL+pid, JSON.stringify(vids2))
    vids2_ = []                                         // info used for search
    vids2 = setupVideoList('list2', vids2, true)
    $('#nfv').html(vids2.length)

    vids1 = setupVideoList('list', vids2)
    $("#title").html('[' + title + ']: ')
    $('#all').html(vids1.length + ' videos');
}

function restoreVideo(sel) {
    vids2.splice(parseInt(sel, 10), 1)
    setupBothVideoLists()
}

function playVids() {
    if ($('#rorder').is(':checked')) vids.reverse()
    $("#cmd").show()

    const vidsf = JSON.parse( localStorage.getItem(FVL+pid) ) || [];
    vids2 = vids.map(x => x.id).filter(x => vidsf.includes(x))
    setupBothVideoLists()
    curIdx = 0;
    
    $('#list').show();
    $('#list2d').show();

    // *** Can only load video after all video id are loaded ***
    loadYTVideoFrame();

    $("#prev").prop('disabled',false).css('opacity', 1);
    $("#next").prop('disabled',false).css('opacity', 1);
    $('#curv').html( pad(curIdx+1, 3) );
    
    $('#list').css("background-color","Lavender")

    const pSet = JSON.parse( localStorage.getItem(PID + 'set') ) || {}
    pSet[pid] = title
    delete pSet['WL']
    localStorage.setItem(PID + 'set', JSON.stringify(pSet));
}

function pad(number, length) {
    let str = '' + number;
    while( str.length < length ) { str = '0' + str; }
    return str;
}
