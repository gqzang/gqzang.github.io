let search_on = false

function search_main() {	
    $('#search_pan').hide()

    $("#search").click(function() { 
        $('#search_pan').toggle(); search_on = ! search_on
        if( ! search_on ) return

        const search = elasticlunr( function() {
            this.setRef('id')
            this.addField('title')
        });
        vids2_.forEach( (v, idx) => search.addDoc({ id: idx, title: v.title.substring(0, 60) }))

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
                const dispHtml = pad(item.ref, 3) + " ~~~ " + item.doc.title;
                $('#search-results').append( new Option( dispHtml, item.ref ) );
            }

            const size = Math.min( 10, searchResult.length );
            $('#search-results').attr('size', size);
            $('#search-results').toggle( size > 0 );
        })

    })

    $('#search-results').on('click', function() {
        restoreVideo($(this).val())
        $('#search_pan').hide()
        search_on = false
    })
}
