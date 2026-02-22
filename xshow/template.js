async function impl_temp(file, kvMap) {
    const res = await fetch(file)
    var html = await res.text()
    for(const [k, v] of Object.entries(kvMap))
        html = html.replaceAll('${' + k + '}', v)
    return html
}