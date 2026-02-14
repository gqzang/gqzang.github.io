"use strict"

const src_info = {
    '1/B-sel/': 6811,
    '1/B-sel-x/': 2026,
    '2/MA-p1/': 4198,
    '3/MA-p2/': 4158,
    '4/MA-x/': 7561
}

function get_rand_image_ref(src) {
    const n = src_info[src]
    const i = Math.floor(Math.random() * n) + 1
    return src + 'x' + String(i).padStart(4, '0') + '.xef'
}
