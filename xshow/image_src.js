"use strict"

const src_info = {
    '1/B-sel/': 6811,
    '1/B-sel-x/': 2026,
    '2/MA-p1/': 4198,
    '3/MA-p2/': 4158,
    '4/MA-x/': 7561
}

const r_s = []                          // contains all selected refs
function get_rand_image_ref(src_lst) {
    var n = 0; for(const x of src_lst) n += src_info[x]
    for(const k = 0; k < 10; k ++) {            // only try 10 times
        var i = Math.floor(Math.random() * n) + 1, j
        for(j = 0; j < src_lst.length; j ++) {
            if(i <= src_info[src_lst[j]]) break
            i -= src_info[src_lst[j]]
        }
        const ref = src_lst[j] + 'x' + String(i).padStart(4, '0') + '.xef'   
        if(r_s.includes(ref)) continue
        r_s.push(ref)
        return ref
    }
    return null
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