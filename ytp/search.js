let search_on = false

function search_main() {	
    $('#search_pan').hide()

    $("#search").click(function() { 
        $('#search_pan').toggle(); search_on = ! search_on
        if( ! search_on ) return

        const search = elasticlunr( function() {
            this.addField('title');
            this.setRef('id');
        });

        items = [];
        vids.forEach( (v, idx) => items.push({ id: idx+1, title: v.title.substring(0, 60) }))
        items.forEach( i => search.addDoc(i) );

        $('#search-results').hide();
        $('#count').html("");

        $("#search-input").keyup( function() {
            const searchKW = $( "#search-input" ).val();
            $("#count").html("")
            $('#search-results').empty();
            if(searchKW.length < 3) return $('#search-results').hide();

            const searchResult = search.search(searchKW, {bool: "AND", expand: true}) || [];
            $("#count").html("" + searchResult.length)
            for( const item of searchResult.sort( (a, b) => a.ref - b.ref ) ) {
                const dispHtml = pad(item.ref) + " ~~~ " + item.doc.title;
                $('#search-results').append( new Option( dispHtml, item.ref ) );
            }

            const size = Math.min( 10, searchResult.length );
            $('#search-results').attr('size', size);
            $('#search-results').toggle( size > 0 );
        })

    })

    $('#search-results').on('click', function() {
        console.log($(this).val())            
    })

/*
    $("#search_pan").hide();
    $("#search").toggle( vids.length > 0 );
    $("#search-done").click( () => $("#search_pan").hide() );

    $("#search").click( () => {
        const search = elasticlunr( function() {
            this.addField('title');
            this.setRef('id');
        });

        items = [];
        vids.forEach( (v, idx) => items.push({ id: idx+1, title: v.title.substring(0, 60) }))
        items.forEach( i => search.addDoc(i) );

        $("#search_pan").show();
        $('#search-results').hide();
        $('#count').html("");

        $("#search-input").keyup( function() {
            const searchKW = $( "#search-input" ).val();
            $("#count").html("")
            $('#search-results').empty();
            if(searchKW.length < 3) return $('#search-results').hide();

            const searchResult = search.search(searchKW, {bool: "AND", expand: true}) || [];
            $("#count").html("" + searchResult.length)
            for( const item of searchResult.sort( (a, b) => a.ref - b.ref ) ) {
                const dispHtml = pad(item.ref) + " ~~~ " + item.doc.title;
                $('#search-results').append( new Option( dispHtml, item.ref ) );
            }

            const size = Math.min( 10, searchResult.length );
            $('#search-results').attr('size', size);
            $('#search-results').toggle( size > 0 );
        });
        
        document.getElementById("search-input").addEventListener("search", function(event) {
            $('#search-results').hide();
        });
        
        $('#search-results').on('click', function() {
            playVideo( $(this).val() - 1 )            
        });
    });
*/
}
