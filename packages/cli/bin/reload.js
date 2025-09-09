function reload({origin}) {
  (new EventSource(origin)).onmessage = function() {
    location.reload()
  }
}
reload(new URL(document.currentScript.src))