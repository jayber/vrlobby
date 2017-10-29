var count = new Count();

count.addEventListener("count", function(data) {
  var element = document.getElementById(data.roomId);
  if (element) {
    element.innerHTML = data.count;
  }
});

count.start();

function Count() {
  var host = "wss://wevr.vrlobby.co/count";
  var secondsTilRetry = 2;
  var listeners = {};
  var ws;
  var self = this;

  this.start = function() {
    if (ws) {
      this.close();
    }
    ws = this.connect(host);
  };

  this.close = function() {
    if (ws) {
      ws.close();
    }
  };

  this.connect = function(host) {
    var ws = new WebSocket(host);
    ws.onclose = function () {
      if (secondsTilRetry < 33) {
        secondsTilRetry = secondsTilRetry * 2;
        console.debug("ws closed! - trying to reopen in " + secondsTilRetry + " seconds");
        setTimeout(function () {
          try {
            self.start();
          } catch (e) {
            console.error(e);
          }
        }, 1000 * secondsTilRetry);
      } else {
        console.log("ws closed! - giving up");
      }
    };

    ws.onopen = function () {
      secondsTilRetry = 2;
      console.log("ws opened");
    };

    ws.onerror = function (error) {
      console.error(error);
    };

    ws.onmessage = function (event) {
      try {
        var msg = JSON.parse(event.data);
        if (msg.event != "ping") {
          console.debug("ws received: " + event.data);
        }
        self.dispatch(msg);
      } catch (e) {
        console.error(e);
      }
    };
    return ws;
  };

  this.addEventListener = function(type, listener) {
    if (!(type in listeners)) {
      listeners[type] = [];
    }
    listeners[type].push(listener);
  };

  this.dispatch = function(msg) {
    var type = msg.event;
    var param = msg.data;
    if (!(type in listeners)) {
      return true;
    }
    var stack = listeners[type];
    stack.forEach(function (element) {
      element(param);
    });
  };

  this.send = function(msg) {
    var msgString = JSON.stringify(msg);
    console.debug("sending: " + msgString);
    ws.send(msgString);
  };
}