/**
 * Live reload
 */
(function({origin}) {
  (new EventSource(origin)).onmessage = function() {
    location.reload()
  }
})
(new URL(document.currentScript.src))