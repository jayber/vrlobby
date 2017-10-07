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

AFRAME.registerSystem('switch-environment', {
  init: function () {
    var self = this;
    this.el.addEventListener("loaded", function () {
      self.environment = document.querySelector("#environment");
      self.name = document.querySelector("#name");
      self.names = ['default', 'contact', 'egypt', 'checkerboard', 'forest', 'goaland', 'yavapai', 'goldmine', 'threetowers', 'poison', 'arches', 'tron', 'japan', 'dream', 'volcano', 'starry', 'osiris'];
      self.curIndex = self.names.indexOf(self.environment.getAttribute("environment").preset);
      //self.name.setAttribute('text', 'value', self.names[self.curIndex]);

      var wevrSystem = self.el.systems.wevr;
      self.stateHandler = wevrSystem.stateHandler;
      self.stateHandler.addStateListener("#environment", function (data) {
       self.setEnvironmentIndex(data.envName);
       });
    });
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
    var fields = {envName: name};
    this.stateHandler.updateState("#environment", fields);
  },

  setEnvironmentIndex: function (name) {
    if (name != this.environment.getAttribute("environment").preset) {
      this.curIndex = this.names.indexOf(name);
      this.setEnvironment(name);
    }
  },

  setEnvironment: function (name) {
    this.environment.setAttribute('environment', 'preset', name);
    //this.name.setAttribute('text', 'value', name);
  }
});