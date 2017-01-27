(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("api/index.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _repositories = require('./repositories');

Object.defineProperty(exports, 'numberOfRepositories', {
  enumerable: true,
  get: function get() {
    return _repositories.numberOfRepositories;
  }
});

});

require.register("api/repositories.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.numberOfRepositories = numberOfRepositories;
var baseURL = 'https://api.github.com/search/';

var fetchNumber = function fetchNumber(language) {
  return fetch(baseURL + 'repositories?q=+language:' + language).then(function (response) {
    return response.json().then(function (json) {
      return json['total_count'];
    });
  });
};

var cachedNumber = function cachedNumber(language) {
  return localStorage.getItem('repo_viz_numbers_' + language);
};

var saveCachedNumber = function saveCachedNumber(language, number) {
  localStorage.setItem('repo_viz_numbers_' + language, number);
};

// returns a promise with a value
function numberOfRepositories(language) {
  if (cachedNumber(language)) {
    return new Promise(function (resolve) {
      return resolve(cachedNumber(language));
    });
  }
  var number = fetchNumber(language);

  number.then(function (n) {
    return saveCachedNumber(language, n);
  });

  return number;
}

});

;require.register("app.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.App = App;

var _api = require('api');

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);

var _d3Scale = require('d3-scale');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var languages = ['ruby', 'javascript', 'java', 'go', 'elixir', 'haskell', 'c', 'cpp', 'lua', 'python'];

var forceStrength = 0.063;
var color = d3.scaleOrdinal(_d3Scale.schemeCategory10);

var formatNumber = function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

var renderChart = function renderChart(data) {
  var maxHeight = window.innerHeight;
  var maxWidth = window.innerWidth;

  var radiusScale = d3.scalePow().exponent(0.5).range([50, maxHeight * 0.3]).domain([0, 40 * d3.max(data, function (d) {
    return d.amount;
  })]);

  var svg = d3.select('body').append('svg').attr('width', maxWidth).attr('height', maxHeight).attr('class', 'bubbles');

  var charge = function charge(d) {
    Math.pow(d.radius, 2.0) * forceStrength;
  };

  var ticked = function ticked() {
    svg.selectAll('.bubble').attr('transform', function (d) {
      return 'translate(' + (d.x - d.radius / 2) + ', ' + (d.y - d.radius / 2) + ')';
    });
  };

  var simulation = d3.forceSimulation().velocityDecay(0.2).force('x', d3.forceX().strength(forceStrength).x(maxWidth / 2)).force('y', d3.forceY().strength(forceStrength).y(maxHeight / 2)).force('collide', d3.forceCollide(function (d) {
    return d.radius * 1.2;
  }).iterations(2)).on('tick', ticked);

  var nodes = data.map(function (d) {
    return {
      radius: radiusScale(d.amount),
      x: Math.random() * maxWidth,
      y: Math.random() * maxHeight,
      amount: d.amount,
      name: d.name
    };
  });

  var bubbles = svg.selectAll('.bubble').data(nodes, function (d) {
    return d.id;
  });

  var bubblesE = bubbles.enter().append('g').classed('bubble', true).attr('transform', function (d) {
    return 'translate(' + d.x + ', ' + d.y + ')';
  });

  bubblesE.append('circle').attr('r', function (d) {
    return d.radius;
  }).style('fill', function (d) {
    return color(d.amount);
  });

  bubblesE.append('text').attr('text-anchor', 'middle').style('fill', 'white').text(function (d) {
    return d.name;
  });

  bubblesE.append('text').attr('y', '15').attr('text-anchor', 'middle').style('fill', 'white').text(function (d) {
    return formatNumber(d.amount) + ' repos';
  });

  bubbles = bubbles.merge(bubblesE);

  simulation.nodes(nodes);
};

var fetchData = function fetchData() {
  var data = [];

  return new Promise(function (resolve, _) {
    languages.forEach(function (lang) {
      (0, _api.numberOfRepositories)(lang).then(function (number) {
        console.log(lang + ' has ' + number + ' repos on github.');
        data.push({ name: lang, amount: number });
      });
    });
    resolve(data);
  });
};

function App() {
  return {
    render: function render(container) {
      fetchData().then(function (data) {
        renderChart(data);
      });
    }
  };
}

});

;require.register("initialize.js", function(exports, require, module) {
'use strict';

var _app = require('app');

document.addEventListener('DOMContentLoaded', function () {
  // do your setup here
  console.log('Initialized app');

  var container = document.getElementById('app');
  var body = (0, _app.App)().render(container);

  document.body.appendChild(container);
});

});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map