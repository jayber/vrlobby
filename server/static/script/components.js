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
        this.environment = document.querySelector("#environment");
        this.name = document.querySelector("#name");
        this.names = ['default', 'contact', 'egypt', 'checkerboard', 'forest', 'goaland', 'yavapai', 'goldmine', 'threetowers', 'poison', 'arches', 'tron', 'japan', 'dream', 'volcano', 'starry', 'osiris'];
        this.curIndex = this.names.indexOf(this.environment.getAttribute("environment").preset);
        this.name.setAttribute('text', 'value', this.names[this.curIndex]);

        this.eventName = "switch-environment";
        NAF.connection.subscribeToDataChannel(this.eventName, function(senderRtcId, dataType, data, targetRtcId) {
            self.curIndex = self.names.indexOf(data);
            self.setEnvironment(data);
        })
    },

    switchEnvironment: function(up) {
        if (up) {
            if (++this.curIndex == this.names.length) {
                this.curIndex = 0;
            }
        } else {
            if (--this.curIndex == -1) {
                this.curIndex = this.names.length - 1;
            }
        }
        this.setEnvironment(this.names[this.curIndex]);
        NAF.connection.broadcastDataGuaranteed(this.eventName, this.names[this.curIndex]);
    },

    setEnvironment: function(name) {
        this.environment.setAttribute('environment', 'preset', name);
        this.name.setAttribute('text', 'value', name);
    }
});
