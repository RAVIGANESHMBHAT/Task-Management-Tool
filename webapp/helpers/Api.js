sap.ui.define([], function () {
  "use strict";

  var _token = function (url) {
    var payload = {
      url: url,
      type: "GET",
      dataType: "json",
      contentType: "application/json",
      headers: {
        "X-CSRF-Token": "Fetch",
        "X-REQUEST-TAG": "CSRF-FETCH",
        "Accept-Language": sap.ui.getCore().getConfiguration().getLanguageTag()
      }
    };

    var def = jQuery.Deferred();

    jQuery.ajax(payload)
      .done(function (d, s, x) {
        var token = x.getResponseHeader("x-csrf-token");
        def.resolve(token);
      })
      .fail(function (d, s, x) {
        var token = d.getResponseHeader("x-csrf-token");
        if (d.status == 200) {
          def.resolve(token);
        } else {
          def.reject(d, s, x);
        }
      });

    return def.promise();
  };

  var _call = function (payload) {
    var def = jQuery.Deferred();
    _token(payload.url)
      .done(function (token) {
        payload.headers = {
          "X-CSRF-Token": token
        };
        jQuery.ajax(payload).done(function (d, s, x) {
          def.resolve(d, s, x);
        })
          .fail(function (d, s, x) {
            def.reject(d, s, x);
          });
      })
      .fail(function (d, s, x) {
        def.reject(d, s, x);
      });
    return def.promise();
  };

  var get = function (url, opts) {
    opts = (opts) ? opts : {};
    var payload = {
      url: url,
      type: "GET",
      dataType: opts.dataType || "json",
      async: opts.async || false,
      contentType: opts.contentType || "application/json",
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Accept-Language": sap.ui.getCore().getConfiguration().getLanguageTag()
      }
    };
    return jQuery.ajax(payload);
  };


  var post = function (url, data, opts) {
    opts = (opts) ? opts : {};
    var payload = {
      url: url,
      type: "POST",
      dataType: opts.dataType || "json",
      contentType: opts.contentType || "application/json",
      data: data
    };
    //return _call(payload);
    return jQuery.ajax(payload);
  };

  var put = function (url, data, opts) {
    opts = (opts) ? opts : {};
    var payload = {
      url: url,
      type: "PUT",
      dataType: opts.dataType || "json",
      contentType: opts.contentType || "application/json",
      data: data
    };
    return _call(payload);
  };

  var del = function (url, opts) {
    opts = (opts) ? opts : {};
    var payload = {
      url: url,
      type: "DELETE",
      dataType: opts.dataType || "json",
      contentType: opts.contentType || "application/json"
    };
    return jQuery.ajax(payload);
  };

  return {
    get: get,
    post: post,
    put: put,
    del: del
  };
});
