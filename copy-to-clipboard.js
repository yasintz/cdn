function fallbackCopyTextToClipboard(o,cb) {
    var e = document.createElement("textarea");
    e.value = o, e.style.top = "0", e.style.left = "0", e.style.position = "fixed", document.body.appendChild(e), e.focus(), e.select();
    try {
        var c = document.execCommand("copy") ? "successful" : "unsuccessful";
        console.log("Fallback: Copying text command was " + c)
        cb(null)
    } catch (o) {
        console.error("Fallback: Oops, unable to copy", o)
        cb(o)
    }
    document.body.removeChild(e)
}

function copy(o,cb) {
    navigator.clipboard ? navigator.clipboard.writeText(o).then(function() {
        console.log("Async: Copying to clipboard was successful!")
        cb(null)
    }, function(o) {
        console.error("Async: Could not copy text: ", o)
        cb(o)
    }) : fallbackCopyTextToClipboard(o,cb)
}
