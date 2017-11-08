/*******************************************************************************
 Docs
 https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
 *******************************************************************************/

var EXPORTED_SYMBOLS = ["cors"];

var cors = {

    enabled: false,
    observerService: null,

    init: function () {

        // observer service
        cors.observerService =
            Components.classes["@mozilla.org/observer-service;1"]
                .getService(Components.interfaces.nsIObserverService);
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
        }

        // remove observer
        else {
            cors.observerService.removeObserver(
                cors.observerHandler,
                'http-on-examine-response'
            );
        }
    },

    /******************************************************** observer handler */
    observerHandler: {
        observe: function (subject, topic, data) {

            // http interface
            var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
            if (httpChannel === null) {
                return;
            }

            var url = httpChannel.getRequestHeader('Origin');
            if (url == 'https://smartreserve.jp'
                || url == 'https://smartreserve.gmoc.jp'
                || url == 'http://192.168.33.30'
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
