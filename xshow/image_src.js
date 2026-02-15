"use strict"

const src_info = {
    '1/B-sel/': 6811,
    '1/B-sel-x/': 2026,
    '2/MA-p1/': 4198,
    '3/MA-p2/': 4158,
    '4/MA-x/': 7561
}

function get_rand_image_ref(src_lst) {
    var n = 0
    for(const x of src_lst) n += src_info[x]
    var i = Math.floor(Math.random() * n) + 1

    for(const x of src_lst) {
        if(i <= src_info[x]) 
            return x + 'x' + String(i).padStart(4, '0') + '.xef'            
        i -= src_info[x]
    }
}

const src_rotation = {
    '1/B-sel/': 0,
    '1/B-sel-x/': 0,
    '2/MA-p1/': 270,
    '3/MA-p2/': 270,
    '4/MA-x/': 270
}

function get_rotation(ref) {
    const src = ref.split("/x")[0] + '/'
    return src_rotation[src]
}