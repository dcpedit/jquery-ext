!function (factory) {
  if ( typeof define === 'function' && define.amd ) {
    define(['jquery', 'mustache'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    factory(jQuery, window.Mustache);
  }
}(function ($, Mustache) {
  var _tmplRegex = /\s*<!\[CDATA\[\s*|\s*\]\]>\s*|[\r\n\t]/g,
      _scriptFragment = /<script[^>]*>([\S\s]*?)<\/script>/img,
      _htmlTag = /<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi,
      _htmlComment = /<!--(.(?!-->))*.-->/g,
      _protocolRegex = /^https?:/;

  function mustacheCheck() {
    var msg = "Mustache is not defined";
    if (typeof Mustache == 'undefined') {
      console.log(msg);
      throw msg;
    }
  }

  $.fn.templateText = function() {
    return this.html().replace(_tmplRegex, '');
  };

  $.fn.mustacheCompile = function () {
    mustacheCheck();
    var text = this.eq(0).templateText();
    return Mustache.compile(text);
  };

  $.fn.mustacheCompilePartial = function (name) {
    mustacheCheck();
    var text = this.eq(0).templateText();
    return Mustache.compilePartial(name, text);
  };

  $.fn.mustacheRender = function (view, partials) {
    mustacheCheck();
    return this.map(function (i, elm) {
      var template = $(elm).templateText();
      var output = Mustache.render(template, view, partials);
      return $(output).get();
    });
  };

  $.fn.truncateList = function (max, cb) {
    if (!max) throw 'Must specifiy a maximum';
    var list = this;
    var rt;
    if (list.length > max) {
      var len = list.length;
      for (var i = max; i < len; i++) {
        list.eq(i).remove();
      }
      rt = list.slice(0, max);
      if (cb) cb(rt, list.slice(max));
      return rt;
    }
    if (cb) cb(list, [])
    return list;
  };

  $.fn.serializeJSON = function () {
    var arr = this.serializeArray();
    var rt = {};
    var i, item, len = arr.length;

    for (i = 0; i < len; i++) {
      item = arr[i];
      if (typeof rt[item.name] == 'string')
        rt[item.name] += '\t' + item.value;
      else
        rt[item.name] = item.value;
    }

    return rt;
  };

  $.fn.initScrollArea = function() {
    if (!this.mousewheel) return;
    this.mousewheel(function(ev, d, dx, dy) {
      var scroll = this;
      var val = scroll.offsetTop + (dy || d*40);
      var offsetHeight = 0 - scroll.offsetHeight + 300;

      if (val > 0) {
        scroll.style.top = '0px';
      }
      else if (val < offsetHeight) {
        scroll.style.top = offsetHeight + 'px';
      }
      else {
        scroll.style.top = val + 'px';
      }
      return false;
    });
  };

  $.stripTags = function(str) {
    return str.replace(_htmlTag, '').replace(_htmlComment, '');
  };

  $.stripScripts = function(str) {
    return str.replace(_scriptFragment, '');
  };

  $.truncate = function(str, length, truncation) {
    length = length || 30;
    truncation = (typeof truncation == 'undefined') ? '...' : truncation;
    return str.length > length ?
      str.slice(0, length - truncation.length) + truncation : String(str);
  };

  $.getQuery = function(str) {
    var q = str || window.location.search,
      rt = {};

    if (q) {
      if (q.indexOf('?') == 0) {
        q = q.substring(1);
      }
      var list = q.split('&'), pair;

      while (list.length) {
        pair = list.pop().split('=');
        rt[pair[0]] = decodeURIComponent(pair[1]);
      }
    }
    return rt;
  };
  
  $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
    options.url = options.url.replace(_protocolRegex, '');
  });

  if (window.Global && !Global.disable_xd_ajax && $.xsubdomain) {
    $.xsubdomain(Global.CROSS_DOMAIN_SERVER + '/js/' + Global.JS_VERSION + '/jquery/jquery.xsubdomain.html');
  }

  return $;
});
