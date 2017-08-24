AFRAME.registerComponent('log-on', {

  init: function () {
    $("#dialog").dialog({
      autoOpen: false, modal: true, height: 200, width: 300, resizable: false, beforeClose: function (event, ui) {
        if ($("#username").val().length == 0) {
          return false;
        }
      }, buttons: [
        {
          text: "Ok",
          click: function () {
            $(this).dialog("close");
          }
        }
      ], close: function () {
        document.cookie = "name=" + $("#username").val() + ";path=/"
      }
    });
    $(document).ready(function () {
      const name = readCookie('name');
      if (!name) {
        $("#dialog").dialog("open");
      }
    });

  }
});

AFRAME.registerComponent('spawn-in-circle', {
  schema: {
    radius: {type: 'number', default: 1}
  },

  init: function () {
    var el = this.el;
    var center = el.getAttribute('position');

    var angleRad = this.getRandomAngleInRadians();
    var circlePoint = this.randomPointOnCircle(this.data.radius, angleRad);
    var worldPoint = {x: circlePoint.x + center.x, y: center.y, z: circlePoint.y + center.z};
    el.setAttribute('position', worldPoint);

    var angleDeg = angleRad * 180 / Math.PI;
    var angleToCenter = -1 * angleDeg + 90;
    var rotationStr = '0 ' + angleToCenter + ' 0';
    el.setAttribute('rotation', rotationStr);
  },

  getRandomAngleInRadians: function () {
    return Math.random() * Math.PI * 2;
  },

  randomPointOnCircle: function (radius, angleRad) {
    x = Math.cos(angleRad) * radius;
    y = Math.sin(angleRad) * radius;
    return {x: x, y: y};
  }
});

AFRAME.registerComponent('switch-environment', {
  schema: {type: 'string'},
  init: function () {
    var self = this;
    var up = (this.data == "up");
    this.el.addEventListener('click', function (evt) {
      self.system.switchEnvironment(up);
    });
  }
});

AFRAME.registerComponent('init-environment', {
  init: function () {
    this.el.systems['switch-environment'].initAfterLoaded();
  }
});

AFRAME.registerSystem('switch-environment', {
  initAfterLoaded: function () {
    var self = this;
    this.fieldName = "envName";
    this.environment = document.querySelector("#environment");
    this.name = document.querySelector("#name");
    this.names = ['default', 'contact', 'egypt', 'checkerboard', 'forest', 'goaland', 'yavapai', 'goldmine', 'threetowers', 'poison', 'arches', 'tron', 'japan', 'dream', 'volcano', 'starry', 'osiris'];
    this.curIndex = this.names.indexOf(this.environment.getAttribute("environment").preset);
    this.name.setAttribute('text', 'value', this.names[this.curIndex]);

    this.eventName = "switch-environment";
    NAF.connection.subscribeToDataChannel(this.eventName, function (senderRtcId, dataType, data, targetRtcId) {
      self.setEnvironmentIndex(data);
    });
    NAF.connection.onOccupantReceived = function (occupant) {
      if (occupant.apiField) {
        var field = occupant.apiField.envName;
        if (field) {
          var value = field.fieldValue;
          var values = value.split(/;/);
          var time = parseInt(values[1]);
          if (!self.lastTime || time > self.lastTime) {
            self.lastTime = time;
            self.setEnvironmentIndex(values[0]);
          }
        }
      }
    };
  },

  switchEnvironment: function (up) {
    if (up) {
      if (++this.curIndex == this.names.length) {
        this.curIndex = 0;
      }
    } else {
      if (--this.curIndex == -1) {
        this.curIndex = this.names.length - 1;
      }
    }
    var name = this.names[this.curIndex];
    this.setEnvironment(name);
    var fields = {envName: name+";"+(new Date()).getTime()};
    NAF.connection.setApiFields(fields);
  },

  setEnvironmentIndex: function (name) {
    if (name!= this.environment.getAttribute("environment").preset) {
      this.curIndex = this.names.indexOf(name);
      this.setEnvironment(name);
    }
  },

  setEnvironment: function (name) {
    this.environment.setAttribute('environment', 'preset', name);
    this.name.setAttribute('text', 'value', name);
  }
});
