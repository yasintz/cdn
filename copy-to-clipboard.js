function fallbackCopyTextToClipboard(o) {
    var e = document.createElement("textarea");
    e.value = o, e.style.top = "0", e.style.left = "0", e.style.position = "fixed", document.body.appendChild(e), e.focus(), e.select();
    try {
        var c = document.execCommand("copy") ? "successful" : "unsuccessful";
        console.log("Fallback: Copying text command was " + c)
    } catch (o) {
        console.error("Fallback: Oops, unable to copy", o)
    }
    document.body.removeChild(e)
}

function copy(o) {
    navigator.clipboard ? navigator.clipboard.writeText(o).then(function() {
        console.log("Async: Copying to clipboard was successful!")
    }, function(o) {
        console.error("Async: Could not copy text: ", o)
    }) : fallbackCopyTextToClipboard(o)
}
