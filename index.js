
var { ToggleButton } = require("sdk/ui/button/toggle");
var { Cc, Ci } = require('chrome');
var tabs = require("sdk/tabs");



var cors = {

    enabled: false,
    observerService: null,

    init: function () {
        // observer service
        cors.observerService =
            Cc["@mozilla.org/observer-service;1"]
                .getService(Ci.nsIObserverService);

    },

    /****************************************************************** toggle */
    toggle: function (state) {
        // set state by input
        if (typeof state === 'boolean') {
            cors.enabled = state;
        }
        // set state by toggle
        else {
            cors.enabled = !cors.enabled;
        }

        // notification topic
        var topic = cors.enabled
            ? 'cors_enabled'
            : 'cors_disabled';

        // notify
        cors.observerService.notifyObservers(
            null,
            topic,
            null
        );

        // add observer, observe http responses
        if (cors.enabled) {
            cors.observerService.addObserver(
                cors.observerHandler,
                'http-on-examine-response',
                false
            );
            button.badge = 'on';
            button.badgeColor = "#FF2222";
        }

        // remove observer
        else {
            cors.observerService.removeObserver(
                cors.observerHandler,
                'http-on-examine-response'
            );
            button.badge = 'off';
            button.badgeColor = "#333333";
        }
    },

    /******************************************************** observer handler */
    observerHandler: {
        observe: function (subject, topic, data) {
            // http interface
            var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
            if (httpChannel === null) {
                return;
            }

            var url = httpChannel.getRequestHeader('Origin');

            if (url == 'url1'
                || url == 'url2'
            ) {
                httpChannel.setResponseHeader(
                    'Access-Control-Allow-Origin',
                    url,
                    false
                );
                httpChannel.setResponseHeader(
                    'Access-Control-Allow-Headers',
                    '',
                    false
                );
                httpChannel.setResponseHeader(
                    'Access-Control-Allow-Credentials',
                    "true",
                    false
                );
            }
        }
    },
};

var button = ToggleButton({
    id: "icon",
    label: "スマリザアドオン",
    icon: {
        "16": "chrome://cors-smartreserve/content/icon-16.png",
        "32": "chrome://cors-smartreserve/content/icon-32.png"
    },
    badge: 'off',
    onChange: changed,
    badgeColor: "#333333"
  });



tabs.on("ready", cors.init);
tabs.on("ready", function () {

    var obs = Cc["@mozilla.org/observer-service;1"]
      .getService(Ci.nsIObserverService);
    // observe: enable
   obs.addObserver(
      {observe:function(subject, topic, data){
         button.checked = true;
      }},
      'cors_enabled',
      false
   );

   // observe: disable
   obs.addObserver(
      {observe:function(subject, topic, data){
          button.checked = false;
      }},
      'cors_disabled',
      false
   );

   // check if enabled for proper init
   if(cors.enabled) {
      button.checked = true;
   }
});

function changed(state) {
    cors.toggle(state.checked);
}


