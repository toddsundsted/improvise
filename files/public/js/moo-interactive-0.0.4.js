/* global Moo SocketManager Socket */

if (!window.Moo && !document.Moo)
  Moo = {};

(function(Moo) {

  Moo.Interactive = function(host, port, options) {
    var interactive = this;
    var authenticity_token = options.authenticity_token; // may be undefined
    var session_state = options.session_state; // may be undefined
    var callback = options.callback;
    var force = options.force;

    /* If both the flash component and the javascript component loaded
     * and are available, set up a socket-based connection.
     */
    if (force ||
        ((window.JavascriptSocket || document.JavascriptSocket) &&
         (window.SocketManager || document.SocketManager))) {
      var socket;
      SocketManager.observe('loaded', function() {
        socket = new Socket({
          ready: function() {
            socket.connect(host, port);
          },
          connected: function() {
            socket.send('GET / HTTP/1.1\n');
            socket.send('Host: ' + host + ':' + port + '\n');
            socket.send('Cookie: ' + session_state + '\n');
            socket.send('X-Break-A-Leg: stunt\n');
            socket.send('Upgrade: moo\n');
            socket.send('\n\n');
          },
          receive: function(text) {
            callback && callback(text);
          }
        }, true);
      });

      interactive.send = function(message) {
        socket.send(message);
      };
    }

    /* Otherwise, fall back to long-polling.
     */
    else {
      var xhr;
      var delay = 1;
      var length = 0;

      function output() {
        var text = xhr.responseText,
            limit = Math.max(length, 2048); // the server sends 2048 bytes to get chrome off its ass
        length = xhr.responseText.length;
        text = text.slice(limit, length);
        text && callback && callback(text);
      }

      function poll(cmd) {
        length = 0;
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 1)
            ;
          else if (xhr.readyState === 2)
            ;
          else if (xhr.readyState === 3) {
            output();
          }
          else if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              delay = 1;
              output();
            } else {
              delay *= 2;
              output();
            }
            if (!xhr.beenAborted)
              setTimeout(poll, delay * 1000);
            xhr = null;
          }
        };
        if (cmd)
          xhr.open("POST", "/__long_poll");
        else
          xhr.open("GET", "/__long_poll");
        xhr.setRequestHeader('X-Authenticity-Token', authenticity_token);
        xhr.setRequestHeader("X-Break-A-Leg", 'stunt');
        xhr.send(cmd);
      }

      poll();

      interactive.send = function(message) {
        message = message.trim();
        xhr.beenAborted = true;
        xhr.abort();
        poll(message);
      };
    }

    return interactive;
  };

})(Moo);
