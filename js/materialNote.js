/**
 * v1.1.0
 * Super simple wysiwyg editor on Materialize
 * a fork of materialnote.js => http://materialnote.org/
 *
 * original summernote credits:
 * summernote.js
 * Copyright 2013-2015 Alan Hong. and other contributors
 * summernote may be freely distributed under the MIT license./
 *
 * edited by CK (http://www.web-forge.info)
 * thanks to Tox for code review (http://emanuele.itoscano.com/)
 */
(function(factory) {
  /* global define */
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals: jQuery
    factory(window.jQuery);
  }
}(function($) {

  if (!Array.prototype.reduce) {
    /**
     * Array.prototype.reduce polyfill
     * @param {Function} callback
     * @param {Value} [initialValue]
     * @return {Value}
     * @see http://goo.gl/WNriQD
     */
    Array.prototype.reduce = function(callback) {
      var t = Object(this), len = t.length >>> 0, k = 0, value;

      if (arguments.length === 2) {
        value = arguments[1];
      } else {
        while (k < len && !(k in t)) {
          k++;
        }
        if (k >= len) {
          throw new TypeError('Reduce of empty array with no initial value');
        }
        value = t[k++];
      }
      for (; k < len; k++) {
        if (k in t) {
          value = callback(value, t[k], k, t);
        }
      }
      return value;
    };
  }

  if ('function' !== typeof Array.prototype.filter) {
    /**
     * Array.prototype.filter polyfill
     * @param {Function} func
     * @return {Array}
     * @see http://goo.gl/T1KFnq
     */
    Array.prototype.filter = function(func) {
      var t = Object(this), len = t.length >>> 0;
      var res = [];
      var thisArg = arguments.length >= 2 ? arguments[1] : void 0;

      for (var i = 0; i < len; i++) {
        if (i in t) {
          var val = t[i];

          if (func.call(thisArg, val, i, t)) {
            res.push(val);
          }
        }
      }
      return res;
    };
  }

var isSupportAmd = typeof define === 'function' && define.amd;

/**
* returns whether font is installed or not.
* @param {String} fontName
* @return {Boolean}
*/
var isFontInstalled = function(fontName) {
    if (fontName === "Roboto") return true;
    var testFontName = fontName === 'Comic Sans MS' ? 'Courier New' : 'Comic Sans MS';
    var $tester = $('<div>').css({
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      fontSize: '200px'
    }).text('mmmmmmmmmwwwwwww').appendTo(document.body);

    var originalWidth = $tester.css('fontFamily', testFontName).width();
    var width = $tester.css('fontFamily', fontName + ',' + testFontName).width();

    $tester.remove();

    return originalWidth !== width;
};


var userAgent = navigator.userAgent;

/**
* @class core.agent
* Object which check platform and agent
* @singleton
* @alternateClassName agent
*/
var agent = {
    /** @property {Boolean} [isMac=false] true if this agent is Mac  */
    isMac: navigator.appVersion.indexOf('Mac') > -1,
    /** @property {Boolean} [isMSIE=false] true if this agent is a Internet Explorer  */
    isMSIE: /MSIE|Trident/i.test(userAgent),
    /** @property {Boolean} [isFF=false] true if this agent is a Firefox  */
    isFF: /firefox/i.test(userAgent),
    isWebkit: /webkit/i.test(userAgent),
    /** @property {Boolean} [isSafari=false] true if this agent is a Safari  */
    isSafari: /safari/i.test(userAgent),
    /** @property {String} jqueryVersion current jQuery version string  */
    jqueryVersion: parseFloat($.fn.jquery),
    isSupportAmd: isSupportAmd,
    hasCodeMirror: isSupportAmd ? require.specified('CodeMirror') : !!window.CodeMirror,
    isFontInstalled: isFontInstalled,
    isW3CRangeSupport: !!document.createRange
};

/**
* @class core.func
* func utils (for high-order func's arg)
* @singleton
* @alternateClassName func
*/
var func = (function() {
    var eq = function(itemA) {
      return function(itemB) {
        return itemA === itemB;
      };
    };

    var eq2 = function(itemA, itemB) {
      return itemA === itemB;
    };

    var peq2 = function(propName) {
      return function(itemA, itemB) {
        return itemA[propName] === itemB[propName];
      };
    };

    var ok = function() {
      return true;
    };

    var fail = function() {
      return false;
    };

    var not = function(f) {
      return function() {
        return !f.apply(f, arguments);
      };
    };

    var and = function(fA, fB) {
      return function(item) {
        return fA(item) && fB(item);
      };
    };

    var self = function(a) {
      return a;
    };

    var idCounter = 0;

    /**
     * generate a globally-unique id
     * @param {String} [prefix]
     */
    var uniqueId = function(prefix) {
      var id = ++idCounter + '';

      return prefix ? prefix + id : id;
    };

    /**
     * returns bnd (bounds) from rect
     * - IE Compatability Issue: http://goo.gl/sRLOAo
     * - Scroll Issue: http://goo.gl/sNjUc
     * @param {Rect} rect
     * @return {Object} bounds
     * @return {Number} bounds.top
     * @return {Number} bounds.left
     * @return {Number} bounds.width
     * @return {Number} bounds.height
     */
    var rect2bnd = function(rect) {
      var $document = $(document);
      return {
        top: rect.top + $document.scrollTop(),
        left: rect.left + $document.scrollLeft(),
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
      };
    };

    /**
     * returns a copy of the object where the keys have become the values and the values the keys.
     * @param {Object} obj
     * @return {Object}
     */
    var invertObject = function(obj) {
      var inverted = {};

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          inverted[obj[key]] = key;
        }
      }
      return inverted;
    };

    /**
     * @param {String} namespace
     * @param {String} [prefix]
     * @return {String}
     */
    var namespaceToCamel = function(namespace, prefix) {
      prefix = prefix || '';
      return prefix + namespace.split('.').map(function(name) {
        return name.substring(0, 1).toUpperCase() + name.substring(1);
      }).join('');
    };

    return {
      eq: eq,
      eq2: eq2,
      peq2: peq2,
      ok: ok,
      fail: fail,
      self: self,
      not: not,
      and: and,
      uniqueId: uniqueId,
      rect2bnd: rect2bnd,
      invertObject: invertObject,
      namespaceToCamel: namespaceToCamel
    };
})(); //end func


/**
* @class core.list
* list utils
* @singleton
* @alternateClassName list
*/
var list = (function() {
    /**
    * returns the first item of an array.
    * @param {Array} array
    */
    var head = function(array) {
      return array[0];
    };

    /**
     * returns the last item of an array.
     * @param {Array} array
     */
    var last = function(array) {
      return array[array.length - 1];
    };

    /**
     * returns everything but the last entry of the array.
     * @param {Array} array
     */
    var initial = function(array) {
      return array.slice(0, array.length - 1);
    };

    /**
     * returns the rest of the items in an array.
     * @param {Array} array
     */
    var tail = function(array) {
      return array.slice(1);
    };

    /**
     * returns item of array
     */
    var find = function(array, pred) {
      for (var idx = 0, len = array.length; idx < len; idx ++) {
        var item = array[idx];

        if (pred(item)) {
          return item;
        }
      }
    };

    /**
     * returns true if all of the values in the array pass the predicate truth test.
     */
    var all = function(array, pred) {
        for (var idx = 0, len = array.length; idx < len; idx ++) {
            if (!pred(array[idx])) {
                return false;
            }
        }
        return true;
    };

    /**
     * returns true if the value is present in the list.
     */
    var contains = function(array, item) {
        return $.inArray(item, array) !== -1;
    };

    /**
     * get sum from a list
     * @param {Array} array - array
     * @param {Function} fn - iterator
     */
    var sum = function(array, fn) {
        fn = fn || func.self;
        return array.reduce(function(memo, v) {
            return memo + fn(v);
        }, 0);
    };

    /**
     * returns a copy of the collection with array type.
     * @param {Collection} collection - collection eg) node.childNodes, ...
     */
    var from = function(collection) {
        var result = [], idx = -1, length = collection.length;
        while (++idx < length) {
            result[idx] = collection[idx];
        }
        return result;
    };

    /**
     * cluster elements by predicate function.
     * @param {Array} array - array
     * @param {Function} fn - predicate function for cluster rule
     * @param {Array[]}
     */
    var clusterBy = function(array, fn) {
        if (!array.length) { return []; }
        var aTail = tail(array);

        return aTail.reduce(function(memo, v) {
            var aLast = last(memo);
            if (fn(last(aLast), v)) {
                aLast[aLast.length] = v;
            } else {
                memo[memo.length] = [v];
            }
            return memo;
        }, [[head(array)]]);
    };

    /**
     * returns a copy of the array with all falsy values removed
     * @param {Array} array - array
     * @param {Function} fn - predicate function for cluster rule
     */
    var compact = function(array) {
        var aResult = [];

        for (var idx = 0, len = array.length; idx < len; idx ++) {
            if (array[idx]) { aResult.push(array[idx]); }
        }
        return aResult;
    };

    /**
     * produces a duplicate-free version of the array
     * @param {Array} array
     */
    var unique = function(array) {
        var results = [];

        for (var idx = 0, len = array.length; idx < len; idx ++) {
            if (!contains(results, array[idx])) {
                results.push(array[idx]);
            }
        }
        return results;
    };

    /**
     * returns next item.
     * @param {Array} array
     */
    var next = function(array, item) {
        var idx = array.indexOf(item);

        if (idx === -1) {return null;}
        return array[idx + 1];
    };

    /**
     * returns prev item.
     * @param {Array} array
     */
    var prev = function(array, item) {
        var idx = array.indexOf(item);

        if (idx === -1) {return null;}
        return array[idx - 1];
    };


    return {head: head, last: last, initial: initial, tail: tail, prev: prev, next: next, find: find, contains: contains, all: all, sum: sum, from: from, clusterBy: clusterBy, compact: compact, unique: unique};
})(); //end list


var NBSP_CHAR = String.fromCharCode(160);
var ZERO_WIDTH_NBSP_CHAR = '\ufeff';

/**
* @class core.dom
* Dom functions
* @singleton
* @alternateClassName dom
*/
var dom = (function() {
    /**
    * @method isEditable
    * returns whether node is `note-editable` or not.
    * @param {Node} node
    * @return {Boolean}
    */
    var isEditable = function(node) {
        return node && $(node).hasClass('note-editable');
    };

    /**
    * @method isControlSizing
    * returns whether node is `note-control-sizing` or not.
    * @param {Node} node
    * @return {Boolean}
    */
    var isControlSizing = function(node) {
        return node && $(node).hasClass('note-control-sizing');
    };

    /**
    * @method  buildLayoutInfo
    * build layoutInfo from $editor(.note-editor)
    * @param {jQuery} $editor
    * @return {Object}
    * @return {Function} return.editor
    * @return {Node} return.dropzone
    * @return {Node} return.toolbar
    * @return {Node} return.editable
    * @return {Node} return.codable
    * @return {Node} return.popover
    * @return {Node} return.handle
    * @return {Node} return.dialog
    */
    var buildLayoutInfo = function($editor) {
      var makeFinder;

      // air mode
      if ($editor.hasClass('note-air-editor')) {
        var id = list.last($editor.attr('id').split('-'));

        makeFinder = function(sIdPrefix) {
          return function() { return $(sIdPrefix + id); };
        };

        return {
          editor: function() { return $editor; },
          holder : function() { return $editor.data('holder'); },
          editable: function() { return $editor; },
          popover: makeFinder('#note-popover-'),
          handle: makeFinder('#note-handle-'),
          dialog: makeFinder('#note-dialog-')
        };
      // frame mode
      } else {
        makeFinder = function(sClassName) {
          return function() { return $editor.find(sClassName); };
        };
        return {
          editor: function() { return $editor; },
          holder : function() { return $editor.data('holder'); },
          dropzone: makeFinder('.note-dropzone'),
          toolbar: makeFinder('.note-toolbar'),
          editable: makeFinder('.note-editable'),
          codable: makeFinder('.note-codable'),
          statusbar: makeFinder('.note-statusbar'),
          popover: makeFinder('.note-popover'),
          handle: makeFinder('.note-handle'),
          dialog: makeFinder('.note-dialog')
        };
      }
    };

    /**
    * returns makeLayoutInfo from editor's descendant node.
    * @private
    * @param {Node} descendant
    * @return {Object}
    */
    var makeLayoutInfo = function(descendant) {
      var $target = $(descendant).closest('.note-editor, .note-air-editor, .note-air-layout');

      if (!$target.length) {
        return null;
      }
      var $editor;

      if ($target.is('.note-editor, .note-air-editor')) {
        $editor = $target;
      } else {
        $editor = $('#note-editor-' + list.last($target.attr('id').split('-')));
      }
      return buildLayoutInfo($editor);
    };

    /**
    * @method makePredByNodeName
    * returns predicate which judge whether nodeName is same
    * @param {String} nodeName
    * @return {Function}
    */
    var makePredByNodeName = function(nodeName) {
      nodeName = nodeName.toUpperCase();
      return function(node) {
        return node && node.nodeName.toUpperCase() === nodeName;
      };
    };

    /**
    * @method isText
    * @param {Node} node
    * @return {Boolean} true if node's type is text(3)
    */
    var isText = function(node) {
      return node && node.nodeType === 3;
    };

    /**
     * ex) br, col, embed, hr, img, input, ...
     * @see http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
     */
    var isVoid = function(node) {
      return node && /^BR|^IMG|^HR/.test(node.nodeName.toUpperCase());
    };

    var isPara = function(node) {
      if (isEditable(node)) {
        return false;
      }
      // Chrome(v31.0), FF(v25.0.1) use DIV for paragraph
      return node && /^DIV|^P|^LI|^H[1-7]/.test(node.nodeName.toUpperCase());
    };

    var isLi = makePredByNodeName('LI');

    var isPurePara = function(node) {
      return isPara(node) && !isLi(node);
    };

    var isTable = makePredByNodeName('TABLE');

    var isInline = function(node) {
      return !isBodyContainer(node) && !isList(node) && !isPara(node) && !isTable(node) && !isBlockquote(node);
    };

    var isList = function(node) {
      return node && /^UL|^OL/.test(node.nodeName.toUpperCase());
    };

    var isCell = function(node) {
      return node && /^TD|^TH/.test(node.nodeName.toUpperCase());
    };

    var isBlockquote = makePredByNodeName('BLOCKQUOTE');

    var isBodyContainer = function(node) {
      return isCell(node) || isBlockquote(node) || isEditable(node);
    };

    var isAnchor = makePredByNodeName('A');

    var isParaInline = function(node) {
      return isInline(node) && !!ancestor(node, isPara);
    };

    var isBodyInline = function(node) {
      return isInline(node) && !ancestor(node, isPara);
    };

    var isBody = makePredByNodeName('BODY');

    /**
    * returns whether nodeB is closest sibling of nodeA
    * @param {Node} nodeA
    * @param {Node} nodeB
    * @return {Boolean}
    */
    var isClosestSibling = function(nodeA, nodeB) {
      return nodeA.nextSibling === nodeB || nodeA.previousSibling === nodeB;
    };

    /**
    * returns array of closest siblings with node
    * @param {Node} node
    * @param {function} [pred] - predicate function
    * @return {Node[]}
    */
    var withClosestSiblings = function(node, pred) {
      pred = pred || func.ok;
      var siblings = [];

      if (node.previousSibling && pred(node.previousSibling)) {
        siblings.push(node.previousSibling);
      }
      siblings.push(node);
      if (node.nextSibling && pred(node.nextSibling)) {
        siblings.push(node.nextSibling);
      }
      return siblings;
    };

    /**
    * blank HTML for cursor position
    * - [workaround] for MSIE IE doesn't works with bogus br
    */
    var blankHTML = agent.isMSIE ? '&nbsp;' : '<br>';

    /**
    * @method nodeLength
    * returns #text's text size or element's childNodes size
    * @param {Node} node
    */
    var nodeLength = function(node) {
      if (isText(node)) {
        return node.nodeValue.length;
      }
      return node.childNodes.length;
    };

    /**
    * returns whether node is empty or not.
    * @param {Node} node
    * @return {Boolean}
    */
    var isEmpty = function(node) {
      var len = nodeLength(node);

      if (len === 0) {
        return true;
      } else if (!isText(node) && len === 1 && node.innerHTML === blankHTML) {
        return true;
      } else if (list.all(node.childNodes, isText) && node.innerHTML === '') {
        return true;
      }
      return false;
    };

    /**
    * padding blankHTML if node is empty (for cursor position)
    */
    var paddingBlankHTML = function(node) {
      if (!isVoid(node) && !nodeLength(node)) {
        node.innerHTML = blankHTML;
      }
    };

    /**
     * find nearest ancestor predicate hit
     *
     * @param {Node} node
     * @param {Function} pred - predicate function
     */
    var ancestor = function(node, pred) {
      while (node) {
        if (pred(node)) { return node; }
        if (isEditable(node)) { break; }

        node = node.parentNode;
      }
      return null;
    };

    /**
     * find nearest ancestor only single child blood line and predicate hit
     *
     * @param {Node} node
     * @param {Function} pred - predicate function
     */
    var singleChildAncestor = function(node, pred) {
      node = node.parentNode;

      while (node) {
        if (nodeLength(node) !== 1) { break; }
        if (pred(node)) { return node; }
        if (isEditable(node)) { break; }

        node = node.parentNode;
      }
      return null;
    };

    /**
     * returns new array of ancestor nodes (until predicate hit).
     *
     * @param {Node} node
     * @param {Function} [optional] pred - predicate function
     */
    var listAncestor = function(node, pred) {
      pred = pred || func.fail;

      var ancestors = [];
      ancestor(node, function(el) {
        if (!isEditable(el)) {
          ancestors.push(el);
        }

        return pred(el);
      });
      return ancestors;
    };

    /**
     * find farthest ancestor predicate hit
     */
    var lastAncestor = function(node, pred) {
      var ancestors = listAncestor(node);
      return list.last(ancestors.filter(pred));
    };

    /**
     * returns common ancestor node between two nodes.
     *
     * @param {Node} nodeA
     * @param {Node} nodeB
     */
    var commonAncestor = function(nodeA, nodeB) {
      var ancestors = listAncestor(nodeA);
      for (var n = nodeB; n; n = n.parentNode) {
        if ($.inArray(n, ancestors) > -1) { return n; }
      }
      return null; // difference document area
    };

    /**
     * listing all previous siblings (until predicate hit).
     *
     * @param {Node} node
     * @param {Function} [optional] pred - predicate function
     */
    var listPrev = function(node, pred) {
      pred = pred || func.fail;

      var nodes = [];
      while (node) {
        if (pred(node)) { break; }
        nodes.push(node);
        node = node.previousSibling;
      }
      return nodes;
    };

    /**
     * listing next siblings (until predicate hit).
     *
     * @param {Node} node
     * @param {Function} [pred] - predicate function
     */
    var listNext = function(node, pred) {
      pred = pred || func.fail;

      var nodes = [];
      while (node) {
        if (pred(node)) { break; }
        nodes.push(node);
        node = node.nextSibling;
      }
      return nodes;
    };

    /**
     * listing descendant nodes
     *
     * @param {Node} node
     * @param {Function} [pred] - predicate function
     */
    var listDescendant = function(node, pred) {
      var descendents = [];
      pred = pred || func.ok;

      // start DFS(depth first search) with node
      (function fnWalk(current) {
        if (node !== current && pred(current)) {
          descendents.push(current);
        }
        for (var idx = 0, len = current.childNodes.length; idx < len; idx++) {
          fnWalk(current.childNodes[idx]);
        }
      })(node);

      return descendents;
    };

    /**
     * wrap node with new tag.
     *
     * @param {Node} node
     * @param {Node} tagName of wrapper
     * @return {Node} - wrapper
     */
    var wrap = function(node, wrapperName) {
      var parent = node.parentNode;
      var wrapper = $('<' + wrapperName + '>')[0];

      parent.insertBefore(wrapper, node);
      wrapper.appendChild(node);

      return wrapper;
    };

    /**
     * insert node after preceding
     *
     * @param {Node} node
     * @param {Node} preceding - predicate function
     */
    var insertAfter = function(node, preceding) {
      var next = preceding.nextSibling, parent = preceding.parentNode;
      if (next) {
        parent.insertBefore(node, next);
      } else {
        parent.appendChild(node);
      }
      return node;
    };

    /**
     * append elements.
     *
     * @param {Node} node
     * @param {Collection} aChild
     */
    var appendChildNodes = function(node, aChild) {
      $.each(aChild, function(idx, child) {
        node.appendChild(child);
      });
      return node;
    };

    /**
     * returns whether boundaryPoint is left edge or not.
     *
     * @param {BoundaryPoint} point
     * @return {Boolean}
     */
    var isLeftEdgePoint = function(point) {
      return point.offset === 0;
    };

    /**
     * returns whether boundaryPoint is right edge or not.
     *
     * @param {BoundaryPoint} point
     * @return {Boolean}
     */
    var isRightEdgePoint = function(point) {
      return point.offset === nodeLength(point.node);
    };

    /**
     * returns whether boundaryPoint is edge or not.
     *
     * @param {BoundaryPoint} point
     * @return {Boolean}
     */
    var isEdgePoint = function(point) {
      return isLeftEdgePoint(point) || isRightEdgePoint(point);
    };

    /**
     * returns wheter node is left edge of ancestor or not.
     *
     * @param {Node} node
     * @param {Node} ancestor
     * @return {Boolean}
     */
    var isLeftEdgeOf = function(node, ancestor) {
      while (node && node !== ancestor) {
        if (position(node) !== 0) {
          return false;
        }
        node = node.parentNode;
      }

      return true;
    };

    /**
     * returns whether node is right edge of ancestor or not.
     *
     * @param {Node} node
     * @param {Node} ancestor
     * @return {Boolean}
     */
    var isRightEdgeOf = function(node, ancestor) {
      while (node && node !== ancestor) {
        if (position(node) !== nodeLength(node.parentNode) - 1) {
          return false;
        }
        node = node.parentNode;
      }

      return true;
    };

    /**
     * returns offset from parent.
     *
     * @param {Node} node
     */
    var position = function(node) {
      var offset = 0;
      while ((node = node.previousSibling)) {
        offset += 1;
      }
      return offset;
    };

    var hasChildren = function(node) {
      return !!(node && node.childNodes && node.childNodes.length);
    };

    /**
     * returns previous boundaryPoint
     *
     * @param {BoundaryPoint} point
     * @param {Boolean} isSkipInnerOffset
     * @return {BoundaryPoint}
     */
    var prevPoint = function(point, isSkipInnerOffset) {
      var node, offset;

      if (point.offset === 0) {
        if (isEditable(point.node)) {
          return null;
        }

        node = point.node.parentNode;
        offset = position(point.node);
      } else if (hasChildren(point.node)) {
        node = point.node.childNodes[point.offset - 1];
        offset = nodeLength(node);
      } else {
        node = point.node;
        offset = isSkipInnerOffset ? 0 : point.offset - 1;
      }

      return {
        node: node,
        offset: offset
      };
    };

    /**
     * returns next boundaryPoint
     *
     * @param {BoundaryPoint} point
     * @param {Boolean} isSkipInnerOffset
     * @return {BoundaryPoint}
     */
    var nextPoint = function(point, isSkipInnerOffset) {
      var node, offset;

      if (nodeLength(point.node) === point.offset) {
        if (isEditable(point.node)) {
          return null;
        }

        node = point.node.parentNode;
        offset = position(point.node) + 1;
      } else if (hasChildren(point.node)) {
        node = point.node.childNodes[point.offset];
        offset = 0;
      } else {
        node = point.node;
        offset = isSkipInnerOffset ? nodeLength(point.node) : point.offset + 1;
      }

      return {
        node: node,
        offset: offset
      };
    };

    /**
     * returns whether pointA and pointB is same or not.
     *
     * @param {BoundaryPoint} pointA
     * @param {BoundaryPoint} pointB
     * @return {Boolean}
     */
    var isSamePoint = function(pointA, pointB) {
      return pointA.node === pointB.node && pointA.offset === pointB.offset;
    };

    /**
     * returns whether point is visible (can set cursor) or not.
     *
     * @param {BoundaryPoint} point
     * @return {Boolean}
     */
    var isVisiblePoint = function(point) {
      if (isText(point.node) || !hasChildren(point.node) || isEmpty(point.node)) {
        return true;
      }

      var leftNode = point.node.childNodes[point.offset - 1];
      var rightNode = point.node.childNodes[point.offset];
      if ((!leftNode || isVoid(leftNode)) && (!rightNode || isVoid(rightNode))) {
        return true;
      }

      return false;
    };

    /**
     * @method prevPointUtil
     *
     * @param {BoundaryPoint} point
     * @param {Function} pred
     * @return {BoundaryPoint}
     */
    var prevPointUntil = function(point, pred) {
      while (point) {
        if (pred(point)) {
          return point;
        }

        point = prevPoint(point);
      }

      return null;
    };

    /**
     * @method nextPointUntil
     *
     * @param {BoundaryPoint} point
     * @param {Function} pred
     * @return {BoundaryPoint}
     */
    var nextPointUntil = function(point, pred) {
      while (point) {
        if (pred(point)) {
          return point;
        }

        point = nextPoint(point);
      }

      return null;
    };

    /**
     * returns whether point has character or not.
     *
     * @param {Point} point
     * @return {Boolean}
     */
    var isCharPoint = function(point) {
      if (!isText(point.node)) {
        return false;
      }

      var ch = point.node.nodeValue.charAt(point.offset - 1);
      return ch && (ch !== ' ' && ch !== NBSP_CHAR);
    };

    /**
     * @method walkPoint
     *
     * @param {BoundaryPoint} startPoint
     * @param {BoundaryPoint} endPoint
     * @param {Function} handler
     * @param {Boolean} isSkipInnerOffset
     */
    var walkPoint = function(startPoint, endPoint, handler, isSkipInnerOffset) {
      var point = startPoint;

      while (point) {
        handler(point);

        if (isSamePoint(point, endPoint)) {
          break;
        }

        var isSkipOffset = isSkipInnerOffset &&
                           startPoint.node !== point.node &&
                           endPoint.node !== point.node;
        point = nextPoint(point, isSkipOffset);
      }
    };

    /**
     * @method makeOffsetPath
     *
     * return offsetPath(array of offset) from ancestor
     *
     * @param {Node} ancestor - ancestor node
     * @param {Node} node
     */
    var makeOffsetPath = function(ancestor, node) {
      var ancestors = listAncestor(node, func.eq(ancestor));
      return $.map(ancestors, position).reverse();
    };

    /**
     * @method fromOffsetPath
     *
     * return element from offsetPath(array of offset)
     *
     * @param {Node} ancestor - ancestor node
     * @param {array} offsets - offsetPath
     */
    var fromOffsetPath = function(ancestor, offsets) {
      var current = ancestor;
      for (var i = 0, len = offsets.length; i < len; i++) {
        if (current.childNodes.length <= offsets[i]) {
          current = current.childNodes[current.childNodes.length - 1];
        } else {
          current = current.childNodes[offsets[i]];
        }
      }
      return current;
    };

    /**
     * @method splitNode
     *
     * split element or #text
     *
     * @param {BoundaryPoint} point
     * @param {Object} [options]
     * @param {Boolean} [options.isSkipPaddingBlankHTML] - default: false
     * @param {Boolean} [options.isNotSplitEdgePoint] - default: false
     * @return {Node} right node of boundaryPoint
     */
    var splitNode = function(point, options) {
      var isSkipPaddingBlankHTML = options && options.isSkipPaddingBlankHTML;
      var isNotSplitEdgePoint = options && options.isNotSplitEdgePoint;

      // edge case
      if (isEdgePoint(point) && (isText(point.node) || isNotSplitEdgePoint)) {
        if (isLeftEdgePoint(point)) {
          return point.node;
        } else if (isRightEdgePoint(point)) {
          return point.node.nextSibling;
        }
      }

      // split #text
      if (isText(point.node)) {
        return point.node.splitText(point.offset);
      } else {
        var childNode = point.node.childNodes[point.offset];
        var clone = insertAfter(point.node.cloneNode(false), point.node);
        appendChildNodes(clone, listNext(childNode));

        if (!isSkipPaddingBlankHTML) {
          paddingBlankHTML(point.node);
          paddingBlankHTML(clone);
        }

        return clone;
      }
    };

    /**
     * @method splitTree
     *
     * split tree by point
     *
     * @param {Node} root - split root
     * @param {BoundaryPoint} point
     * @param {Object} [options]
     * @param {Boolean} [options.isSkipPaddingBlankHTML] - default: false
     * @param {Boolean} [options.isNotSplitEdgePoint] - default: false
     * @return {Node} right node of boundaryPoint
     */
    var splitTree = function(root, point, options) {
      // ex) [#text, <span>, <p>]
      var ancestors = listAncestor(point.node, func.eq(root));

      if (!ancestors.length) {
        return null;
      } else if (ancestors.length === 1) {
        return splitNode(point, options);
      }

      return ancestors.reduce(function(node, parent) {
        if (node === point.node) {
          node = splitNode(point, options);
        }

        return splitNode({
          node: parent,
          offset: node ? dom.position(node) : nodeLength(parent)
        }, options);
      });
    };

    /**
     * split point
     *
     * @param {Point} point
     * @param {Boolean} isInline
     * @return {Object}
     */
    var splitPoint = function(point, isInline) {
      // find splitRoot, container
      //  - inline: splitRoot is a child of paragraph
      //  - block: splitRoot is a child of bodyContainer
      var pred = isInline ? isPara : isBodyContainer;
      var ancestors = listAncestor(point.node, pred);
      var topAncestor = list.last(ancestors) || point.node;

      var splitRoot, container;
      if (pred(topAncestor)) {
        splitRoot = ancestors[ancestors.length - 2];
        container = topAncestor;
      } else {
        splitRoot = topAncestor;
        container = splitRoot.parentNode;
      }

      // if splitRoot is exists, split with splitTree
      var pivot = splitRoot && splitTree(splitRoot, point, {
        isSkipPaddingBlankHTML: isInline,
        isNotSplitEdgePoint: isInline
      });

      // if container is point.node, find pivot with point.offset
      if (!pivot && container === point.node) {
        pivot = point.node.childNodes[point.offset];
      }

      return {
        rightNode: pivot,
        container: container
      };
    };

    var create = function(nodeName) {
      return document.createElement(nodeName);
    };

    var createText = function(text) {
      return document.createTextNode(text);
    };

    /**
     * @method remove
     *
     * remove node, (isRemoveChild: remove child or not)
     *
     * @param {Node} node
     * @param {Boolean} isRemoveChild
     */
    var remove = function(node, isRemoveChild) {
      if (!node || !node.parentNode) { return; }
      if (node.removeNode) { return node.removeNode(isRemoveChild); }

      var parent = node.parentNode;
      if (!isRemoveChild) {
        var nodes = [];
        var i, len;
        for (i = 0, len = node.childNodes.length; i < len; i++) {
          nodes.push(node.childNodes[i]);
        }

        for (i = 0, len = nodes.length; i < len; i++) {
          parent.insertBefore(nodes[i], node);
        }
      }

      parent.removeChild(node);
    };

    /**
     * @method removeWhile
     *
     * @param {Node} node
     * @param {Function} pred
     */
    var removeWhile = function(node, pred) {
      while (node) {
        if (isEditable(node) || !pred(node)) {
          break;
        }

        var parent = node.parentNode;
        remove(node);
        node = parent;
      }
    };

    /**
     * @method replace
     *
     * replace node with provided nodeName
     *
     * @param {Node} node
     * @param {String} nodeName
     * @return {Node} - new node
     */
    var replace = function(node, nodeName) {
      if (node.nodeName.toUpperCase() === nodeName.toUpperCase()) {
        return node;
      }

      var newNode = create(nodeName);

      if (node.style.cssText) {
        newNode.style.cssText = node.style.cssText;
      }

      appendChildNodes(newNode, list.from(node.childNodes));
      insertAfter(newNode, node);
      remove(node);

      return newNode;
    };

    var isTextarea = makePredByNodeName('TEXTAREA');

    /**
     * @param {jQuery} $node
     * @param {Boolean} [stripLinebreaks] - default: false
     */
    var value = function($node, stripLinebreaks) {
      var val = isTextarea($node[0]) ? $node.val() : $node.html();
      if (stripLinebreaks) {
        return val.replace(/[\n\r]/g, '');
      }
      return val;
    };

    /**
     * @method html
     *
     * get the HTML contents of node
     *
     * @param {jQuery} $node
     * @param {Boolean} [isNewlineOnBlock]
     */
    var html = function($node, isNewlineOnBlock) {
      var markup = value($node);

      if (isNewlineOnBlock) {
        var regexTag = /<(\/?)(\b(?!!)[^>\s]*)(.*?)(\s*\/?>)/g;
        markup = markup.replace(regexTag, function(match, endSlash, name) {
          name = name.toUpperCase();
          var isEndOfInlineContainer = /^DIV|^TD|^TH|^P|^LI|^H[1-7]/.test(name) &&
                                       !!endSlash;
          var isBlockNode = /^BLOCKQUOTE|^TABLE|^TBODY|^TR|^HR|^UL|^OL/.test(name);

          return match + ((isEndOfInlineContainer || isBlockNode) ? '\n' : '');
        });
        markup = $.trim(markup);
      }

      return markup;
    };

    return {
      /** @property {String} NBSP_CHAR */
      NBSP_CHAR: NBSP_CHAR,
      /** @property {String} ZERO_WIDTH_NBSP_CHAR */
      ZERO_WIDTH_NBSP_CHAR: ZERO_WIDTH_NBSP_CHAR,
      /** @property {String} blank */
      blank: blankHTML,
      /** @property {String} emptyPara */
      emptyPara: '<p>' + blankHTML + '</p>',
      makePredByNodeName: makePredByNodeName,
      isEditable: isEditable,
      isControlSizing: isControlSizing,
      buildLayoutInfo: buildLayoutInfo,
      makeLayoutInfo: makeLayoutInfo,
      isText: isText,
      isVoid: isVoid,
      isPara: isPara,
      isPurePara: isPurePara,
      isInline: isInline,
      isBlock: func.not(isInline),
      isBodyInline: isBodyInline,
      isBody: isBody,
      isParaInline: isParaInline,
      isList: isList,
      isTable: isTable,
      isCell: isCell,
      isBlockquote: isBlockquote,
      isBodyContainer: isBodyContainer,
      isAnchor: isAnchor,
      isDiv: makePredByNodeName('DIV'),
      isLi: isLi,
      isBR: makePredByNodeName('BR'),
      isSpan: makePredByNodeName('SPAN'),
      isB: makePredByNodeName('B'),
      isU: makePredByNodeName('U'),
      isS: makePredByNodeName('S'),
      isI: makePredByNodeName('I'),
      isImg: makePredByNodeName('IMG'),
      isTextarea: isTextarea,
      isEmpty: isEmpty,
      isEmptyAnchor: func.and(isAnchor, isEmpty),
      isClosestSibling: isClosestSibling,
      withClosestSiblings: withClosestSiblings,
      nodeLength: nodeLength,
      isLeftEdgePoint: isLeftEdgePoint,
      isRightEdgePoint: isRightEdgePoint,
      isEdgePoint: isEdgePoint,
      isLeftEdgeOf: isLeftEdgeOf,
      isRightEdgeOf: isRightEdgeOf,
      prevPoint: prevPoint,
      nextPoint: nextPoint,
      isSamePoint: isSamePoint,
      isVisiblePoint: isVisiblePoint,
      prevPointUntil: prevPointUntil,
      nextPointUntil: nextPointUntil,
      isCharPoint: isCharPoint,
      walkPoint: walkPoint,
      ancestor: ancestor,
      singleChildAncestor: singleChildAncestor,
      listAncestor: listAncestor,
      lastAncestor: lastAncestor,
      listNext: listNext,
      listPrev: listPrev,
      listDescendant: listDescendant,
      commonAncestor: commonAncestor,
      wrap: wrap,
      insertAfter: insertAfter,
      appendChildNodes: appendChildNodes,
      position: position,
      hasChildren: hasChildren,
      makeOffsetPath: makeOffsetPath,
      fromOffsetPath: fromOffsetPath,
      splitTree: splitTree,
      splitPoint: splitPoint,
      create: create,
      createText: createText,
      remove: remove,
      removeWhile: removeWhile,
      replace: replace,
      html: html,
      value: value
    };
  })();


  var range = (function() {

    /**
     * return boundaryPoint from TextRange, inspired by Andy Na's HuskyRange.js
     *
     * @param {TextRange} textRange
     * @param {Boolean} isStart
     * @return {BoundaryPoint}
     *
     * @see http://msdn.microsoft.com/en-us/library/ie/ms535872(v=vs.85).aspx
     */
    var textRangeToPoint = function(textRange, isStart) {
      var container = textRange.parentElement(), offset;

      var tester = document.body.createTextRange(), prevContainer;
      var childNodes = list.from(container.childNodes);
      for (offset = 0; offset < childNodes.length; offset++) {
        if (dom.isText(childNodes[offset])) {
          continue;
        }
        tester.moveToElementText(childNodes[offset]);
        if (tester.compareEndPoints('StartToStart', textRange) >= 0) {
          break;
        }
        prevContainer = childNodes[offset];
      }

      if (offset !== 0 && dom.isText(childNodes[offset - 1])) {
        var textRangeStart = document.body.createTextRange(), curTextNode = null;
        textRangeStart.moveToElementText(prevContainer || container);
        textRangeStart.collapse(!prevContainer);
        curTextNode = prevContainer ? prevContainer.nextSibling : container.firstChild;

        var pointTester = textRange.duplicate();
        pointTester.setEndPoint('StartToStart', textRangeStart);
        var textCount = pointTester.text.replace(/[\r\n]/g, '').length;

        while (textCount > curTextNode.nodeValue.length && curTextNode.nextSibling) {
          textCount -= curTextNode.nodeValue.length;
          curTextNode = curTextNode.nextSibling;
        }

        /* jshint ignore:start */
        var dummy = curTextNode.nodeValue; // enforce IE to re-reference curTextNode, hack
        /* jshint ignore:end */

        if (isStart && curTextNode.nextSibling && dom.isText(curTextNode.nextSibling) &&
            textCount === curTextNode.nodeValue.length) {
          textCount -= curTextNode.nodeValue.length;
          curTextNode = curTextNode.nextSibling;
        }

        container = curTextNode;
        offset = textCount;
      }

      return {
        cont: container,
        offset: offset
      };
    };

    /**
     * return TextRange from boundary point (inspired by google closure-library)
     * @param {BoundaryPoint} point
     * @return {TextRange}
     */
    var pointToTextRange = function(point) {
      var textRangeInfo = function(container, offset) {
        var node, isCollapseToStart;

        if (dom.isText(container)) {
          var prevTextNodes = dom.listPrev(container, func.not(dom.isText));
          var prevContainer = list.last(prevTextNodes).previousSibling;
          node =  prevContainer || container.parentNode;
          offset += list.sum(list.tail(prevTextNodes), dom.nodeLength);
          isCollapseToStart = !prevContainer;
        } else {
          node = container.childNodes[offset] || container;
          if (dom.isText(node)) {
            return textRangeInfo(node, 0);
          }

          offset = 0;
          isCollapseToStart = false;
        }

        return {
          node: node,
          collapseToStart: isCollapseToStart,
          offset: offset
        };
      };

      var textRange = document.body.createTextRange();
      var info = textRangeInfo(point.node, point.offset);

      textRange.moveToElementText(info.node);
      textRange.collapse(info.collapseToStart);
      textRange.moveStart('character', info.offset);
      return textRange;
    };

    /**
     * Wrapped Range
     *
     * @constructor
     * @param {Node} sc - start container
     * @param {Number} so - start offset
     * @param {Node} ec - end container
     * @param {Number} eo - end offset
     */
    var WrappedRange = function(sc, so, ec, eo) {
      this.sc = sc;
      this.so = so;
      this.ec = ec;
      this.eo = eo;

      // nativeRange: get nativeRange from sc, so, ec, eo
      var nativeRange = function() {
        if (agent.isW3CRangeSupport) {
          var w3cRange = document.createRange();
          w3cRange.setStart(sc, so);
          w3cRange.setEnd(ec, eo);

          return w3cRange;
        } else {
          var textRange = pointToTextRange({
            node: sc,
            offset: so
          });

          textRange.setEndPoint('EndToEnd', pointToTextRange({
            node: ec,
            offset: eo
          }));

          return textRange;
        }
      };

      this.getPoints = function() {
        return {
          sc: sc,
          so: so,
          ec: ec,
          eo: eo
        };
      };

      this.getStartPoint = function() {
        return {
          node: sc,
          offset: so
        };
      };

      this.getEndPoint = function() {
        return {
          node: ec,
          offset: eo
        };
      };

      /**
       * select update visible range
       */
      this.select = function() {
        var nativeRng = nativeRange();
        if (agent.isW3CRangeSupport) {
          var selection = document.getSelection();
          if (selection.rangeCount > 0) {
            selection.removeAllRanges();
          }
          selection.addRange(nativeRng);
        } else {
          nativeRng.select();
        }

        return this;
      };

      /**
       * @return {WrappedRange}
       */
      this.normalize = function() {

        /**
         * @param {BoundaryPoint} point
         * @return {BoundaryPoint}
         */
        var getVisiblePoint = function(point) {
          if (!dom.isVisiblePoint(point)) {
            if (dom.isLeftEdgePoint(point)) {
              point = dom.nextPointUntil(point, dom.isVisiblePoint);
            } else {
              point = dom.prevPointUntil(point, dom.isVisiblePoint);
            }
          }
          return point;
        };

        var startPoint = getVisiblePoint(this.getStartPoint());
        var endPoint = getVisiblePoint(this.getEndPoint());

        return new WrappedRange(
          startPoint.node,
          startPoint.offset,
          endPoint.node,
          endPoint.offset
        );
      };

      /**
       * returns matched nodes on range
       *
       * @param {Function} [pred] - predicate function
       * @param {Object} [options]
       * @param {Boolean} [options.includeAncestor]
       * @param {Boolean} [options.fullyContains]
       * @return {Node[]}
       */
      this.nodes = function(pred, options) {
        pred = pred || func.ok;

        var includeAncestor = options && options.includeAncestor;
        var fullyContains = options && options.fullyContains;

        // TODO compare points and sort
        var startPoint = this.getStartPoint();
        var endPoint = this.getEndPoint();

        var nodes = [];
        var leftEdgeNodes = [];

        dom.walkPoint(startPoint, endPoint, function(point) {
          if (dom.isEditable(point.node)) {
            return;
          }

          var node;
          if (fullyContains) {
            if (dom.isLeftEdgePoint(point)) {
              leftEdgeNodes.push(point.node);
            }
            if (dom.isRightEdgePoint(point) && list.contains(leftEdgeNodes, point.node)) {
              node = point.node;
            }
          } else if (includeAncestor) {
            node = dom.ancestor(point.node, pred);
          } else {
            node = point.node;
          }

          if (node && pred(node)) {
            nodes.push(node);
          }
        }, true);

        return list.unique(nodes);
      };

      /**
       * returns commonAncestor of range
       * @return {Element} - commonAncestor
       */
      this.commonAncestor = function() {
        return dom.commonAncestor(sc, ec);
      };

      /**
       * returns expanded range by pred
       *
       * @param {Function} pred - predicate function
       * @return {WrappedRange}
       */
      this.expand = function(pred) {
        var startAncestor = dom.ancestor(sc, pred);
        var endAncestor = dom.ancestor(ec, pred);

        if (!startAncestor && !endAncestor) {
          return new WrappedRange(sc, so, ec, eo);
        }

        var boundaryPoints = this.getPoints();

        if (startAncestor) {
          boundaryPoints.sc = startAncestor;
          boundaryPoints.so = 0;
        }

        if (endAncestor) {
          boundaryPoints.ec = endAncestor;
          boundaryPoints.eo = dom.nodeLength(endAncestor);
        }

        return new WrappedRange(
          boundaryPoints.sc,
          boundaryPoints.so,
          boundaryPoints.ec,
          boundaryPoints.eo
        );
      };

      /**
       * @param {Boolean} isCollapseToStart
       * @return {WrappedRange}
       */
      this.collapse = function(isCollapseToStart) {
        if (isCollapseToStart) {
          return new WrappedRange(sc, so, sc, so);
        } else {
          return new WrappedRange(ec, eo, ec, eo);
        }
      };

      /**
       * splitText on range
       */
      this.splitText = function() {
        var isSameContainer = sc === ec;
        var boundaryPoints = this.getPoints();

        if (dom.isText(ec) && !dom.isEdgePoint(this.getEndPoint())) {
          ec.splitText(eo);
        }

        if (dom.isText(sc) && !dom.isEdgePoint(this.getStartPoint())) {
          boundaryPoints.sc = sc.splitText(so);
          boundaryPoints.so = 0;

          if (isSameContainer) {
            boundaryPoints.ec = boundaryPoints.sc;
            boundaryPoints.eo = eo - so;
          }
        }

        return new WrappedRange(
          boundaryPoints.sc,
          boundaryPoints.so,
          boundaryPoints.ec,
          boundaryPoints.eo
        );
      };

      /**
       * delete contents on range
       * @return {WrappedRange}
       */
      this.deleteContents = function() {
        if (this.isCollapsed()) {
          return this;
        }

        var rng = this.splitText();
        var nodes = rng.nodes(null, {
          fullyContains: true
        });

        // find new cursor point
        var point = dom.prevPointUntil(rng.getStartPoint(), function(point) {
          return !list.contains(nodes, point.node);
        });

        var emptyParents = [];
        $.each(nodes, function(idx, node) {
          // find empty parents
          var parent = node.parentNode;
          if (point.node !== parent && dom.nodeLength(parent) === 1) {
            emptyParents.push(parent);
          }
          dom.remove(node, false);
        });

        // remove empty parents
        $.each(emptyParents, function(idx, node) {
          dom.remove(node, false);
        });

        return new WrappedRange(
          point.node,
          point.offset,
          point.node,
          point.offset
        ).normalize();
      };

      /**
       * makeIsOn: return isOn(pred) function
       */
      var makeIsOn = function(pred) {
        return function() {
          var ancestor = dom.ancestor(sc, pred);
          return !!ancestor && (ancestor === dom.ancestor(ec, pred));
        };
      };

      // isOnEditable: judge whether range is on editable or not
      this.isOnEditable = makeIsOn(dom.isEditable);
      // isOnList: judge whether range is on list node or not
      this.isOnList = makeIsOn(dom.isList);
      // isOnAnchor: judge whether range is on anchor node or not
      this.isOnAnchor = makeIsOn(dom.isAnchor);
      // isOnAnchor: judge whether range is on cell node or not
      this.isOnCell = makeIsOn(dom.isCell);

      /**
       * @param {Function} pred
       * @return {Boolean}
       */
      this.isLeftEdgeOf = function(pred) {
        if (!dom.isLeftEdgePoint(this.getStartPoint())) {
          return false;
        }

        var node = dom.ancestor(this.sc, pred);
        return node && dom.isLeftEdgeOf(this.sc, node);
      };

      /**
       * returns whether range was collapsed or not
       */
      this.isCollapsed = function() {
        return sc === ec && so === eo;
      };

      /**
       * wrap inline nodes which children of body with paragraph
       *
       * @return {WrappedRange}
       */
      this.wrapBodyInlineWithPara = function() {
        if (dom.isBodyContainer(sc) && dom.isEmpty(sc)) {
          sc.innerHTML = dom.emptyPara;
          return new WrappedRange(sc.firstChild, 0, sc.firstChild, 0);
        }

        if (dom.isParaInline(sc) || dom.isPara(sc)) {
          return this.normalize();
        }

        // find inline top ancestor
        var topAncestor;
        if (dom.isInline(sc)) {
          var ancestors = dom.listAncestor(sc, func.not(dom.isInline));
          topAncestor = list.last(ancestors);
          if (!dom.isInline(topAncestor)) {
            topAncestor = ancestors[ancestors.length - 2] || sc.childNodes[so];
          }
        } else {
          topAncestor = sc.childNodes[so > 0 ? so - 1 : 0];
        }

        // siblings not in paragraph
        var inlineSiblings = dom.listPrev(topAncestor, dom.isParaInline).reverse();
        inlineSiblings = inlineSiblings.concat(dom.listNext(topAncestor.nextSibling, dom.isParaInline));

        // wrap with paragraph
        if (inlineSiblings.length) {
          var para = dom.wrap(list.head(inlineSiblings), 'p');
          dom.appendChildNodes(para, list.tail(inlineSiblings));
        }

        return this.normalize();
      };

      /**
       * insert node at current cursor
       *
       * @param {Node} node
       * @return {Node}
       */
      this.insertNode = function(node) {
        var rng = this.wrapBodyInlineWithPara().deleteContents();
        var info = dom.splitPoint(rng.getStartPoint(), dom.isInline(node));

        if (info.rightNode) {
          info.rightNode.parentNode.insertBefore(node, info.rightNode);
        } else {
          info.container.appendChild(node);
        }

        return node;
      };


      /**
       * insert html at current cursor
       */
      this.pasteHTML = function(markup) {
        var self = this;
        var contentsContainer = $('<div></div>').html(markup)[0];
        var childNodes = list.from(contentsContainer.childNodes);

        this.wrapBodyInlineWithPara().deleteContents();

        return $.map(childNodes.reverse(), function(childNode) {
          return self.insertNode(childNode);
        }).reverse();
      };

      /**
       * returns text in range
       *
       * @return {String}
       */
      this.toString = function() {
        var nativeRng = nativeRange();
        return agent.isW3CRangeSupport ? nativeRng.toString() : nativeRng.text;
      };

      /**
       * returns range for word before cursor
       *
       * @param {Boolean} [findAfter] - find after cursor, default: false
       * @return {WrappedRange}
       */
      this.getWordRange = function(findAfter) {
        var endPoint = this.getEndPoint();

        if (!dom.isCharPoint(endPoint)) {
          return this;
        }

        var startPoint = dom.prevPointUntil(endPoint, function(point) {
          return !dom.isCharPoint(point);
        });

        if (findAfter) {
          endPoint = dom.nextPointUntil(endPoint, function(point) {
            return !dom.isCharPoint(point);
          });
        }

        return new WrappedRange(
          startPoint.node,
          startPoint.offset,
          endPoint.node,
          endPoint.offset
        );
      };

      /**
       * create offsetPath bookmark
       *
       * @param {Node} editable
       */
      this.bookmark = function(editable) {
        return {
          s: {
            path: dom.makeOffsetPath(editable, sc),
            offset: so
          },
          e: {
            path: dom.makeOffsetPath(editable, ec),
            offset: eo
          }
        };
      };

      /**
       * create offsetPath bookmark base on paragraph
       *
       * @param {Node[]} paras
       */
      this.paraBookmark = function(paras) {
        return {
          s: {
            path: list.tail(dom.makeOffsetPath(list.head(paras), sc)),
            offset: so
          },
          e: {
            path: list.tail(dom.makeOffsetPath(list.last(paras), ec)),
            offset: eo
          }
        };
      };

      /**
       * getClientRects
       * @return {Rect[]}
       */
      this.getClientRects = function() {
        var nativeRng = nativeRange();
        return nativeRng.getClientRects();
      };
    };

  /**
   * @class core.range
   *
   * Data structure
   *  * BoundaryPoint: a point of dom tree
   *  * BoundaryPoints: two boundaryPoints corresponding to the start and the end of the Range
   *
   * See to http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#Level-2-Range-Position
   *
   * @singleton
   * @alternateClassName range
   */
    return {
      /**
       * @method
       *
       * create Range Object From arguments or Browser Selection
       *
       * @param {Node} sc - start container
       * @param {Number} so - start offset
       * @param {Node} ec - end container
       * @param {Number} eo - end offset
       * @return {WrappedRange}
       */
      create : function(sc, so, ec, eo) {
        if (!arguments.length) { // from Browser Selection
          if (agent.isW3CRangeSupport) {
            var selection = document.getSelection();
            if (!selection || selection.rangeCount === 0) {
              return null;
            } else if (dom.isBody(selection.anchorNode)) {
              // Firefox: returns entire body as range on initialization. We won't never need it.
              return null;
            }

            var nativeRng = selection.getRangeAt(0);
            sc = nativeRng.startContainer;
            so = nativeRng.startOffset;
            ec = nativeRng.endContainer;
            eo = nativeRng.endOffset;
          } else { // IE8: TextRange
            var textRange = document.selection.createRange();
            var textRangeEnd = textRange.duplicate();
            textRangeEnd.collapse(false);
            var textRangeStart = textRange;
            textRangeStart.collapse(true);

            var startPoint = textRangeToPoint(textRangeStart, true),
            endPoint = textRangeToPoint(textRangeEnd, false);

            // same visible point case: range was collapsed.
            if (dom.isText(startPoint.node) && dom.isLeftEdgePoint(startPoint) &&
                dom.isTextNode(endPoint.node) && dom.isRightEdgePoint(endPoint) &&
                endPoint.node.nextSibling === startPoint.node) {
              startPoint = endPoint;
            }

            sc = startPoint.cont;
            so = startPoint.offset;
            ec = endPoint.cont;
            eo = endPoint.offset;
          }
        } else if (arguments.length === 2) { //collapsed
          ec = sc;
          eo = so;
        }
        return new WrappedRange(sc, so, ec, eo);
      },

      /**
       * @method
       *
       * create WrappedRange from node
       *
       * @param {Node} node
       * @return {WrappedRange}
       */
      createFromNode: function(node) {
        var sc = node;
        var so = 0;
        var ec = node;
        var eo = dom.nodeLength(ec);

        // browsers can't target a picture or void node
        if (dom.isVoid(sc)) {
          so = dom.listPrev(sc).length - 1;
          sc = sc.parentNode;
        }
        if (dom.isBR(ec)) {
          eo = dom.listPrev(ec).length - 1;
          ec = ec.parentNode;
        } else if (dom.isVoid(ec)) {
          eo = dom.listPrev(ec).length;
          ec = ec.parentNode;
        }

        return this.create(sc, so, ec, eo);
      },

      /**
       * create WrappedRange from node after position
       *
       * @param {Node} node
       * @return {WrappedRange}
       */
      createFromNodeBefore: function(node) {
        return this.createFromNode(node).collapse(true);
      },

      /**
       * create WrappedRange from node after position
       *
       * @param {Node} node
       * @return {WrappedRange}
       */
      createFromNodeAfter: function(node) {
        return this.createFromNode(node).collapse();
      },

      /**
       * @method
       *
       * create WrappedRange from bookmark
       *
       * @param {Node} editable
       * @param {Object} bookmark
       * @return {WrappedRange}
       */
      createFromBookmark : function(editable, bookmark) {
        var sc = dom.fromOffsetPath(editable, bookmark.s.path);
        var so = bookmark.s.offset;
        var ec = dom.fromOffsetPath(editable, bookmark.e.path);
        var eo = bookmark.e.offset;
        return new WrappedRange(sc, so, ec, eo);
      },

      /**
       * @method
       *
       * create WrappedRange from paraBookmark
       *
       * @param {Object} bookmark
       * @param {Node[]} paras
       * @return {WrappedRange}
       */
      createFromParaBookmark: function(bookmark, paras) {
        var so = bookmark.s.offset;
        var eo = bookmark.e.offset;
        var sc = dom.fromOffsetPath(list.head(paras), bookmark.s.path);
        var ec = dom.fromOffsetPath(list.last(paras), bookmark.e.path);

        return new WrappedRange(sc, so, ec, eo);
      }
    };
  })();

  /**
  * @class defaults
  * @singleton
  */
  // >>>>>>> CK
  var defaults = {
    /** @property */
    version: '0.6.9',

    /**
    * for event options, reference to EventHandler.attach
    * @property {Object} options
    * @property {String/Number} [options.width=null] set editor width
    * @property {String/Number} [options.height=null] set editor height, ex) 300
    * @property {String/Number} options.minHeight set minimum height of editor
    * @property {String/Number} options.maxHeight
    * @property {String/Number} options.focus
    * @property {Number} options.tabsize
    * @property {Boolean} options.styleWithSpan
    * @property {Object} options.codemirror
    * @property {Object} [options.codemirror.mode='text/html']
    * @property {Object} [options.codemirror.htmlMode=true]
    * @property {Object} [options.codemirror.lineNumbers=true]
    * @property {String} [options.lang=en-US] language 'en-US', 'ko-KR', ...
    * @property {String} [options.direction=null] text direction, ex) 'rtl'
    * @property {Array} [options.toolbar]
    * @property {Boolean} [options.airMode=false]
    * @property {Array} [options.airPopover]
    * @property {Fucntion} [options.onInit] initialize
    * @property {Fucntion} [options.onsubmit]
    */
    options: {
      // >>>>>>> CK extra options
      defaultTextColor: '#212121',       // default text color (used by color tool)
      defaultBackColor: '#ddd',          // default text color (used by color tool)
      followingToolbar: true,            // make the toolbar follow on window scroll
      otherStaticBarClass: "staticTop",  // default class for other static bars eventually used on webapp

      width: null,                  // set editor width
      height: null,                 // set editor height, ex) 300

      minHeight: null,              // set minimum height of editor
      maxHeight: null,              // set maximum height of editor

      focus: false,                 // set focus to editable area after initializing materialnote

      tabsize: 4,                   // size of tab ex) 2 or 4
      styleWithSpan: true,          // style with span (Chrome and FF only)

      disableLinkTarget: false,     // hide link Target Checkbox
      disableDragAndDrop: false,    // disable drag and drop event
      disableResizeEditor: false,   // disable resizing editor

      shortcuts: true,              // enable keyboard shortcuts

      placeholder: false,           // enable placeholder text
      prettifyHtml: true,           // enable prettifying html while toggling codeview

      iconPrefix: '',               // prefix for css icon classes
      icons: {
        font: {
          bold: 'format_bold',
          italic: 'format_italic',
          underline: 'format_underlined',
          clear: 'clear',
          height: 'format_size',
          strikethrough: 'strikethrough_s',
          superscript: 'vertical_align_top',
          subscript: 'vertical_align_bottom'
        },
        image: {
          image: 'image',
          floatLeft: 'format_align_left',
          floatRight: 'format_align_right',
          floatNone: 'format_align_justify',
          shapeRounded: 'crop_3_2',
          shapeCircle: 'panorama_fish_eye',
          shapeThumbnail: 'collections',
          bordered: 'border_outer',
          shapeNone: 'image',
          remove: 'delete'
        },
        link: {
          link: 'insert_link',
          unlink: 'clear',
          edit: 'create'
        },
        table: {
          table: 'border_all'
        },
        hr: {
          insert: 'add'
        },
        style: {
          style: 'border_color'
        },
        lists: {
          unordered: 'format_list_bulleted',
          ordered: 'format_list_numbered'
        },
        options: {
          help: 'help',
          fullscreen: 'settings_overscan',
          codeview: 'code'
        },
        paragraph: {
          paragraph: 'format_textdirection_l_to_r',
          outdent: 'format_indent_decrease',
          indent: 'format_indent_increase',
          left: 'format_align_left',
          center: 'format_align_center',
          right: 'format_align_right',
          justify: 'format_align_justify'
        },
        color: {
          recent: 'format_color_text'
        },
        history: {
          undo: 'undo',
          redo: 'redo'
        },
        misc: {
          check: 'check'
        }
      },

      codemirror: {                 // codemirror options
        mode: 'text/html',
        htmlMode: true,
        indentWithTabs: true,
        tabSize: 4,
        lineNumbers: true,
        theme: 'monokai',
        maxHighlightLength: 'Infinity'
      },

      // language
      lang: 'en-US',                // language 'en-US', 'ko-KR', ...
      direction: null,              // text direction, ex) 'rtl'

      // toolbar
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'clear']],
        // ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'hr']],
        ['view', ['fullscreen', 'codeview']],
        ['help', ['help']]
      ],

      plugin : {},

      // air mode: inline editor
      airMode: false,
      // airPopover: [
      //   ['style', ['style']],
      //   ['font', ['bold', 'italic', 'underline', 'clear']],
      //   ['fontname', ['fontname']],
      //   ['color', ['color']],
      //   ['para', ['ul', 'ol', 'paragraph']],
      //   ['height', ['height']],
      //   ['table', ['table']],
      //   ['insert', ['link', 'picture']],
      //   ['help', ['help']]
      // ],
      airPopover: [
        ['color', ['color']],
        ['font', ['bold', 'underline', 'clear']],
        ['para', ['ul', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture']]
      ],

      // style tag
      styleTags: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

      // default fontName
      defaultFontName: 'Roboto',

      // fontName
      fontNames: [
        'Roboto', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New',
        'Helvetica Neue', 'Helvetica', 'Impact', 'Times New Roman', 'Verdana'
      ],
      fontNamesIgnoreCheck: [],

      fontSizes: ['12', '13', '14', '15', '16', '17', '18', '25', '37'],

      // pallete colors(n x n)
      colors: [//grey      brown      dpurple    purple     indigo     blue       cyan       green      lgreen     yellow     amber      orange     dorange    red        pink
              ['#fafafa', '#efebe9', '#7e57c2', '#ab47bc', '#5c6bc0', '#42a5f5', '#26c6da', '#66bb6a', '#9ccc65', '#ffee58', '#ffca28', '#ffa726', '#ff7043', '#ef5350', '#ec407a'],
              ['#f5f5f5', '#d7ccc8', '#673ab7', '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4', '#4caf50', '#8bc34a', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#f44336', '#e91e63'],
              ['#eeeeee', '#bcaaa4', '#5e35b1', '#8e24aa', '#3949ab', '#1e88e5', '#00acc1', '#43a047', '#7cb342', '#fdd835', '#ffb300', '#fb8c00', '#f4511e', '#e53935', '#d81b60'],
              ['#e0e0e0', '#a1887f', '#512da8', '#7b1fa2', '#303f9f', '#1976d2', '#0097a7', '#388e3c', '#689f38', '#fbc02d', '#ffa000', '#f57c00', '#e64a19', '#d32f2f', '#c2185b'],
              ['#bdbdbd', '#8d6e63', '#4527a0', '#6a1b9a', '#283593', '#1565c0', '#00838f', '#2e7d32', '#558b2f', '#f9a825', '#ff8f00', '#ef6c00', '#d84315', '#c62828', '#ad1457'],
              ['#9e9e9e', '#795548', '#311b92', '#4a148c', '#1a237e', '#0d47a1', '#006064', '#1b5e20', '#33691e', '#f57f17', '#ff6f00', '#e65100', '#bf360c', '#b71c1c', '#880e4f'],
              ['#757575', '#6d4c41', '#b388ff', '#ea80fc', '#8c9eff', '#82b1ff', '#84ffff', '#b9f6ca', '#ccff90', '#ffff8d', '#ffe57f', '#ffd180', '#ff9e80', '#ff8a80', '#ff80ab'],
              ['#616161', '#5d4037', '#7c4dff', '#e040fb', '#536dfe', '#448aff', '#18ffff', '#69f0ae', '#b2ff59', '#ffff00', '#ffd740', '#ffab40', '#ff6e40', '#ff5252', '#ff4081'],
              ['#424242', '#4e342e', '#651fff', '#d500f9', '#3d5afe', '#2979ff', '#00e5ff', '#00e676', '#76ff03', '#ffea00', '#ffc400', '#ff9100', '#ff3d00', '#ff1744', '#f50057'],
              ['#212121', '#3e2723', '#6200ea', '#aa00ff', '#304ffe', '#2962ff', '#00b8d4', '#00c853', '#64dd17', '#ffd600', '#ffab00', '#ff6d00', '#dd2c00', '#d50000', '#c51162'],
      ],
      // pallete colors(n x n)
      colorTitles: [
               //grey            brown             dpurple                 purple             indigo             blue             cyan             green             lgreen                  yellow             amber             orange             dorange                 red             pink
              ['grey lighten5', 'brown lighten5', 'deep-purple lighten1', 'purple lighten1', 'indigo lighten1', 'blue lighten1', 'cyan lighten1', 'green lighten1', 'light-green lighten1', 'yellow lighten1', 'amber lighten1', 'orange lighten1', 'deep-orange lighten1', 'red lighten1', 'pink lighten1'],
              ['grey lighten4', 'brown lighten4', 'deep-purple',          'purple',          'indigo',          'blue',          'cyan',          'green',          'light-green',          'yellow',          'amber',          'orange',          'deep-orange',          'red',          'pink'         ],
              ['grey lighten3', 'brown lighten3', 'deep-purple darken1',  'purple darken1',  'indigo darken1',  'blue darken1',  'cyan darken1',  'green darken1',  'light-green darken1',  'yellow darken1',  'amber darken1',  'orange darken1',  'deep-orange darken1',  'red darken1',  'pink darken1' ],
              ['grey lighten2', 'brown lighten2', 'deep-purple darken2',  'purple darken2',  'indigo darken2',  'blue darken2',  'cyan darken2',  'green darken2',  'light-green darken2',  'yellow darken2',  'amber darken2',  'orange darken2',  'deep-orange darken2',  'red darken2',  'pink darken2' ],
              ['grey lighten1', 'brown lighten1', 'deep-purple darken3',  'purple darken3',  'indigo darken3',  'blue darken3',  'cyan darken3',  'green darken3',  'light-green darken3',  'yellow darken3',  'amber darken3',  'orange darken3',  'deep-orange darken3',  'red darken3',  'pink darken3' ],
              ['grey',          'brown',          'deep-purple darken4',  'purple darken4',  'indigo darken4',  'blue darken4',  'cyan darken4',  'green darken4',  'light-green darken4',  'yellow darken4',  'amber darken4',  'orange darken4',  'deep-orange darken4',  'red darken4',  'pink darken4' ],
              ['grey darken1',  'brown darken1',  'deep-purple accent1',  'purple accent1',  'indigo accent1',  'blue accent1',  'cyan accent1',  'green accent1',  'light-green accent1',  'yellow accent1',  'amber accent1',  'orange accent1',  'deep-orange accent1',  'red accent1',  'pink accent1' ],
              ['grey darken2',  'brown darken2',  'deep-purple accent2',  'purple accent2',  'indigo accent2',  'blue accent2',  'cyan accent2',  'green accent2',  'light-green accent2',  'yellow accent2',  'amber accent2',  'orange accent2',  'deep-orange accent2',  'red accent2',  'pink accent2' ],
              ['grey darken3',  'brown darken3',  'deep-purple accent3',  'purple accent3',  'indigo accent3',  'blue accent3',  'cyan accent3',  'green accent3',  'light-green accent3',  'yellow accent3',  'amber accent3',  'orange accent3',  'deep-orange accent3',  'red accent3',  'pink accent3' ],
              ['grey darken4',  'brown darken4',  'deep-purple accent4',  'purple accent4',  'indigo accent4',  'blue accent4',  'cyan accent4',  'green accent4',  'light-green accent4',  'yellow accent4',  'amber accent4',  'orange accent4',  'deep-orange accent4',  'red accent4',  'pink accent4' ],
      ],

      // lineHeight
      lineHeights: ['1.0', '1.2', '1.4', '1.5', '1.6', '1.8', '2.0', '3.0'],

      // insertTable max size
      insertTableMaxSize: {
        col: 12,
        row: 10
      },

      // image
      maximumImageFileSize: null, // size in bytes, null = no limit

      // callbacks
      oninit: null,             // initialize
      onfocus: null,            // editable has focus
      onblur: null,             // editable out of focus
      onenter: null,            // enter key pressed
      onkeyup: null,            // keyup
      onkeydown: null,          // keydown
      onImageUpload: null,      // imageUpload
      onImageUploadError: null, // imageUploadError
      onMediaDelete: null,      // media delete
      onToolbarClick: null,
      onsubmit: null,

      /**
       * manipulate link address when user create link
       * @param {String} sLinkUrl
       * @return {String}
       */
      onCreateLink: function(sLinkUrl) {
        if (sLinkUrl.indexOf('@') !== -1 && sLinkUrl.indexOf(':') === -1) {
          sLinkUrl =  'mailto:' + sLinkUrl;
        }

        return sLinkUrl;
      },

      keyMap: {
        pc: {
          'ENTER': 'insertParagraph',
          'CTRL+Z': 'undo',
          'CTRL+Y': 'redo',
          'TAB': 'tab',
          'SHIFT+TAB': 'untab',
          'CTRL+B': 'bold',
          'CTRL+I': 'italic',
          'CTRL+U': 'underline',
          'CTRL+SHIFT+S': 'strikethrough',
          'CTRL+BACKSLASH': 'removeFormat',
          'CTRL+SHIFT+L': 'justifyLeft',
          'CTRL+SHIFT+E': 'justifyCenter',
          'CTRL+SHIFT+R': 'justifyRight',
          'CTRL+SHIFT+J': 'justifyFull',
          'CTRL+SHIFT+NUM7': 'insertUnorderedList',
          'CTRL+SHIFT+NUM8': 'insertOrderedList',
          'CTRL+LEFTBRACKET': 'outdent',
          'CTRL+RIGHTBRACKET': 'indent',
          'CTRL+NUM0': 'formatPara',
          'CTRL+NUM1': 'formatH1',
          'CTRL+NUM2': 'formatH2',
          'CTRL+NUM3': 'formatH3',
          'CTRL+NUM4': 'formatH4',
          'CTRL+NUM5': 'formatH5',
          'CTRL+NUM6': 'formatH6',
          'CTRL+ENTER': 'insertHorizontalRule',
          'CTRL+K': 'showLinkDialog'
        },

        mac: {
          'ENTER': 'insertParagraph',
          'CMD+Z': 'undo',
          'CMD+SHIFT+Z': 'redo',
          'TAB': 'tab',
          'SHIFT+TAB': 'untab',
          'CMD+B': 'bold',
          'CMD+I': 'italic',
          'CMD+U': 'underline',
          'CMD+SHIFT+S': 'strikethrough',
          'CMD+BACKSLASH': 'removeFormat',
          'CMD+SHIFT+L': 'justifyLeft',
          'CMD+SHIFT+E': 'justifyCenter',
          'CMD+SHIFT+R': 'justifyRight',
          'CMD+SHIFT+J': 'justifyFull',
          'CMD+SHIFT+NUM7': 'insertUnorderedList',
          'CMD+SHIFT+NUM8': 'insertOrderedList',
          'CMD+LEFTBRACKET': 'outdent',
          'CMD+RIGHTBRACKET': 'indent',
          'CMD+NUM0': 'formatPara',
          'CMD+NUM1': 'formatH1',
          'CMD+NUM2': 'formatH2',
          'CMD+NUM3': 'formatH3',
          'CMD+NUM4': 'formatH4',
          'CMD+NUM5': 'formatH5',
          'CMD+NUM6': 'formatH6',
          'CMD+ENTER': 'insertHorizontalRule',
          'CMD+K': 'showLinkDialog'
        }
      }
    },

    // default language: en-US
    lang: {
      'en-US': {
        font: {
          bold: 'Bold',
          italic: 'Italic',
          underline: 'Underline',
          clear: 'Remove Font Style',
          height: 'Line Height',
          name: 'Font Family',
          strikethrough: 'Strikethrough',
          subscript: 'Subscript',
          superscript: 'Superscript',
          size: 'Font Size'
        },
        image: {
          image: 'Picture',
          insert: 'Insert Image',
          resizeFull: 'Resize Full',
          resizeHalf: 'Resize Half',
          resizeQuarter: 'Resize Quarter',
          floatLeft: 'Float Left',
          floatRight: 'Float Right',
          floatNone: 'Float None',
          shapeRounded: 'Shape: Rounded',
          shapeCircle: 'Shape: Circle',
          bordered: 'Bordered',
          shapeThumbnail: 'Shape: Thumbnail',
          shapeNone: 'Shape: None',
          dragImageHere: 'Drag image or text here',
          dropImage: 'Drop image or Text',
          selectFromFiles: 'Select from files',
          maximumFileSize: 'Maximum file size',
          maximumFileSizeError: 'Maximum file size exceeded.',
          url: 'Image URL',
          remove: 'Remove Image'
        },
        link: {
          link: 'Link',
          insert: 'Insert Link',
          unlink: 'Unlink',
          edit: 'Edit',
          textToDisplay: 'Text to display',
          url: 'To what URL should this link go?',
          openInNewWindow: 'Open in new window'
        },
        table: {
          table: 'Table',
          striped: 'Striped',
          hoverable: 'Hoverable',
          responsive: 'Responsive',
          bordered: 'Bordered'
        },
        hr: {
          insert: 'Insert Horizontal Rule'
        },
        style: {
          style: 'Style',
          normal: 'Normal',
          blockquote: 'Quote',
          pre: 'Code',
          h1: 'Header 1',
          h2: 'Header 2',
          h3: 'Header 3',
          h4: 'Header 4',
          h5: 'Header 5',
          h6: 'Header 6'
        },
        lists: {
          unordered: 'Unordered list',
          ordered: 'Ordered list'
        },
        options: {
          help: 'Help',
          fullscreen: 'Full Screen',
          codeview: 'Code View'
        },
        paragraph: {
          paragraph: 'Paragraph',
          outdent: 'Outdent',
          indent: 'Indent',
          left: 'Align left',
          center: 'Align center',
          right: 'Align right',
          justify: 'Justify full'
        },
        color: {
          recent: 'Recent Color',
          more: 'More Color',
          background: 'Back',
          foreground: 'Text',
          transparent: 'Transparent',
          setTransparent: 'Transparent',
          reset: 'Reset',
          resetToDefault: 'Default'
        },
        shortcut: {
          shortcuts: 'Keyboard shortcuts',
          close: 'Close',
          textFormatting: 'Text formatting',
          action: 'Action',
          paragraphFormatting: 'Paragraph formatting',
          documentStyle: 'Document Style',
          extraKeys: 'Extra keys'
        },
        history: {
          undo: 'Undo',
          redo: 'Redo'
        }
      }
    }
  };

  /**
   * @class core.async
   *
   * Async functions which returns `Promise`
   *
   * @singleton
   * @alternateClassName async
   */
  var async = (function() {
    /**
     * @method readFileAsDataURL
     *
     * read contents of file as representing URL
     *
     * @param {File} file
     * @return {Promise} - then: sDataUrl
     */
    var readFileAsDataURL = function(file) {
      return $.Deferred(function(deferred) {
        $.extend(new FileReader(), {
          onload: function(e) {
            var sDataURL = e.target.result;
            deferred.resolve(sDataURL);
          },
          onerror: function() {
            deferred.reject(this);
          }
        }).readAsDataURL(file);
      }).promise();
    };

    /**
     * @method createImage
     *
     * create `<image>` from url string
     *
     * @param {String} sUrl
     * @param {String} filename
     * @return {Promise} - then: $image
     */
    var createImage = function(sUrl, filename) {
      return $.Deferred(function(deferred) {
        var $img = $('<img>');

        $img.one('load', function() {
          $img.off('error abort');
          deferred.resolve($img);
        }).one('error abort', function() {
          $img.off('load').detach();
          deferred.reject($img);
        }).css({
          display: 'none'
        }).appendTo(document.body).attr({
          'src': sUrl,
          'data-filename': filename
        });
      }).promise();
    };

    return {
      readFileAsDataURL: readFileAsDataURL,
      createImage: createImage
    };
  })();

  /**
   * @class core.key
   *
   * Object for keycodes.
   *
   * @singleton
   * @alternateClassName key
   */
  var key = (function() {
    var keyMap = {
      'BACKSPACE': 8,
      'TAB': 9,
      'ENTER': 13,
      'SPACE': 32,

      // Number: 0-9
      'NUM0': 48,
      'NUM1': 49,
      'NUM2': 50,
      'NUM3': 51,
      'NUM4': 52,
      'NUM5': 53,
      'NUM6': 54,
      'NUM7': 55,
      'NUM8': 56,

      // Alphabet: a-z
      'B': 66,
      'E': 69,
      'I': 73,
      'J': 74,
      'K': 75,
      'L': 76,
      'R': 82,
      'S': 83,
      'U': 85,
      'Y': 89,
      'Z': 90,

      'SLASH': 191,
      'LEFTBRACKET': 219,
      'BACKSLASH': 220,
      'RIGHTBRACKET': 221
    };

    return {
      /**
       * @method isEdit
       *
       * @param {Number} keyCode
       * @return {Boolean}
       */
      isEdit: function(keyCode) {
        return list.contains([8, 9, 13, 32], keyCode);
      },
      /**
       * @method isMove
       *
       * @param {Number} keyCode
       * @return {Boolean}
       */
      isMove: function(keyCode) {
        return list.contains([37, 38, 39, 40], keyCode);
      },
      /**
       * @property {Object} nameFromCode
       * @property {String} nameFromCode.8 "BACKSPACE"
       */
      nameFromCode: func.invertObject(keyMap),
      code: keyMap
    };
  })();

  /**
   * @class editing.History
   *
   * Editor History
   *
   */
  var History = function($editable) {
    var stack = [], stackOffset = -1;
    var editable = $editable[0];

    var makeSnapshot = function() {
      var rng = range.create();
      var emptyBookmark = {s: {path: [], offset: 0}, e: {path: [], offset: 0}};

      return {
        contents: $editable.html(),
        bookmark: (rng ? rng.bookmark(editable) : emptyBookmark)
      };
    };

    var applySnapshot = function(snapshot) {
      if (snapshot.contents !== null) {
        $editable.html(snapshot.contents);
      }
      if (snapshot.bookmark !== null) {
        range.createFromBookmark(editable, snapshot.bookmark).select();
      }
    };

    /**
     * undo
     */
    this.undo = function() {
      if (0 < stackOffset) {
        stackOffset--;
        applySnapshot(stack[stackOffset]);
      }
    };

    /**
     * redo
     */
    this.redo = function() {
      if (stack.length - 1 > stackOffset) {
        stackOffset++;
        applySnapshot(stack[stackOffset]);
      }
    };

    /**
     * recorded undo
     */
    this.recordUndo = function() {
      stackOffset++;

      // Wash out stack after stackOffset
      if (stack.length > stackOffset) {
        stack = stack.slice(0, stackOffset);
      }

      // Create new snapshot and push it to the end
      stack.push(makeSnapshot());
    };

    // Create first undo stack
    this.recordUndo();
  };

  /**
   * @class editing.Style
   *
   * Style
   *
   */
  var Style = function() {
    /**
     * @method jQueryCSS
     *
     * [workaround] for old jQuery
     * passing an array of style properties to .css()
     * will result in an object of property-value pairs.
     * (compability with version < 1.9)
     *
     * @private
     * @param  {jQuery} $obj
     * @param  {Array} propertyNames - An array of one or more CSS properties.
     * @return {Object}
     */
    var jQueryCSS = function($obj, propertyNames) {
      if (agent.jqueryVersion < 1.9) {
        var result = {};
        $.each(propertyNames, function(idx, propertyName) {
          result[propertyName] = $obj.css(propertyName);
        });
        return result;
      }
      return $obj.css.call($obj, propertyNames);
    };

    /**
     * paragraph level style
     *
     * @param {WrappedRange} rng
     * @param {Object} styleInfo
     */
    this.stylePara = function(rng, styleInfo) {
      $.each(rng.nodes(dom.isPara, {
        includeAncestor: true
      }), function(idx, para) {
        $(para).css(styleInfo);
      });
    };

    /**
     * insert and returns styleNodes on range.
     *
     * @param {WrappedRange} rng
     * @param {Object} [options] - options for styleNodes
     * @param {String} [options.nodeName] - default: `SPAN`
     * @param {Boolean} [options.expandClosestSibling] - default: `false`
     * @param {Boolean} [options.onlyPartialContains] - default: `false`
     * @return {Node[]}
     */
    this.styleNodes = function(rng, options) {
      rng = rng.splitText();

      var nodeName = options && options.nodeName || 'SPAN';
      var expandClosestSibling = !!(options && options.expandClosestSibling);
      var onlyPartialContains = !!(options && options.onlyPartialContains);

      if (rng.isCollapsed()) {
        return [rng.insertNode(dom.create(nodeName))];
      }

      var pred = dom.makePredByNodeName(nodeName);
      var nodes = $.map(rng.nodes(dom.isText, {
        fullyContains: true
      }), function(text) {
        return dom.singleChildAncestor(text, pred) || dom.wrap(text, nodeName);
      });

      if (expandClosestSibling) {
        if (onlyPartialContains) {
          var nodesInRange = rng.nodes();
          // compose with partial contains predication
          pred = func.and(pred, function(node) {
            return list.contains(nodesInRange, node);
          });
        }

        return $.map(nodes, function(node) {
          var siblings = dom.withClosestSiblings(node, pred);
          var head = list.head(siblings);
          var tails = list.tail(siblings);
          $.each(tails, function(idx, elem) {
            dom.appendChildNodes(head, elem.childNodes);
            dom.remove(elem);
          });
          return list.head(siblings);
        });
      } else {
        return nodes;
      }
    };

    /**
     * get current style on cursor
     *
     * @param {WrappedRange} rng
     * @param {Node} target - target element on event
     * @return {Object} - object contains style properties.
     */
    this.current = function(rng, target) {
      var $cont = $(dom.isText(rng.sc) ? rng.sc.parentNode : rng.sc);
      var properties = ['font-family', 'font-size', 'text-align', 'list-style-type', 'line-height'];
      var styleInfo = jQueryCSS($cont, properties) || {};

      styleInfo['font-size'] = parseInt(styleInfo['font-size'], 10);

      // document.queryCommandState for toggle state
      styleInfo['font-bold'] = document.queryCommandState('bold') ? 'bold' : 'normal';
      styleInfo['font-italic'] = document.queryCommandState('italic') ? 'italic' : 'normal';
      styleInfo['font-underline'] = document.queryCommandState('underline') ? 'underline' : 'normal';
      styleInfo['font-strikethrough'] = document.queryCommandState('strikeThrough') ? 'strikethrough' : 'normal';
      styleInfo['font-superscript'] = document.queryCommandState('superscript') ? 'superscript' : 'normal';
      styleInfo['font-subscript'] = document.queryCommandState('subscript') ? 'subscript' : 'normal';

      // list-style-type to list-style(unordered, ordered)
      if (!rng.isOnList()) {
        styleInfo['list-style'] = 'none';
      } else {
        var aOrderedType = ['circle', 'disc', 'disc-leading-zero', 'square'];
        var isUnordered = $.inArray(styleInfo['list-style-type'], aOrderedType) > -1;
        styleInfo['list-style'] = isUnordered ? 'unordered' : 'ordered';
      }

      var para = dom.ancestor(rng.sc, dom.isPara);
      if (para && para.style['line-height']) {
        styleInfo['line-height'] = para.style.lineHeight;
      } else {
        var lineHeight = parseInt(styleInfo['line-height'], 10) / parseInt(styleInfo['font-size'], 10);
        styleInfo['line-height'] = lineHeight.toFixed(1);
      }

      styleInfo.image = dom.isImg(target) && target;
      styleInfo.anchor = rng.isOnAnchor() && dom.ancestor(rng.sc, dom.isAnchor);
      styleInfo.ancestors = dom.listAncestor(rng.sc, dom.isEditable);
      styleInfo.range = rng;

      return styleInfo;
    };
  };


  /**
   * @class editing.Bullet
   *
   * @alternateClassName Bullet
   */
  var Bullet = function() {
    /**
     * @method insertOrderedList
     *
     * toggle ordered list
     *
     * @type command
     */
    this.insertOrderedList = function() {
      this.toggleList('OL');
    };

    /**
     * @method insertUnorderedList
     *
     * toggle unordered list
     *
     * @type command
     */
    this.insertUnorderedList = function() {
      this.toggleList('UL');
    };

    /**
     * @method indent
     *
     * indent
     *
     * @type command
     */
    this.indent = function() {
      var self = this;
      var rng = range.create().wrapBodyInlineWithPara();

      var paras = rng.nodes(dom.isPara, { includeAncestor: true });
      var clustereds = list.clusterBy(paras, func.peq2('parentNode'));

      $.each(clustereds, function(idx, paras) {
        var head = list.head(paras);
        if (dom.isLi(head)) {
          self.wrapList(paras, head.parentNode.nodeName);
        } else {
          $.each(paras, function(idx, para) {
            $(para).css('marginLeft', function(idx, val) {
              return (parseInt(val, 10) || 0) + 25;
            });
          });
        }
      });

      rng.select();
    };

    /**
     * @method outdent
     *
     * outdent
     *
     * @type command
     */
    this.outdent = function() {
      var self = this;
      var rng = range.create().wrapBodyInlineWithPara();

      var paras = rng.nodes(dom.isPara, { includeAncestor: true });
      var clustereds = list.clusterBy(paras, func.peq2('parentNode'));

      $.each(clustereds, function(idx, paras) {
        var head = list.head(paras);
        if (dom.isLi(head)) {
          self.releaseList([paras]);
        } else {
          $.each(paras, function(idx, para) {
            $(para).css('marginLeft', function(idx, val) {
              val = (parseInt(val, 10) || 0);
              return val > 25 ? val - 25 : '';
            });
          });
        }
      });

      rng.select();
    };

    /**
     * @method toggleList
     *
     * toggle list
     *
     * @param {String} listName - OL or UL
     */
    this.toggleList = function(listName) {
      var self = this;
      var rng = range.create().wrapBodyInlineWithPara();

      var paras = rng.nodes(dom.isPara, { includeAncestor: true });
      var bookmark = rng.paraBookmark(paras);
      var clustereds = list.clusterBy(paras, func.peq2('parentNode'));

      // paragraph to list
      if (list.find(paras, dom.isPurePara)) {
        var wrappedParas = [];
        $.each(clustereds, function(idx, paras) {
          wrappedParas = wrappedParas.concat(self.wrapList(paras, listName));
        });
        paras = wrappedParas;
      // list to paragraph or change list style
      } else {
        var diffLists = rng.nodes(dom.isList, {
          includeAncestor: true
        }).filter(function(listNode) {
          return !$.nodeName(listNode, listName);
        });

        if (diffLists.length) {
          $.each(diffLists, function(idx, listNode) {
            dom.replace(listNode, listName);
          });
        } else {
          paras = this.releaseList(clustereds, true);
        }
      }

      range.createFromParaBookmark(bookmark, paras).select();
    };

    /**
     * @method wrapList
     *
     * @param {Node[]} paras
     * @param {String} listName
     * @return {Node[]}
     */
    this.wrapList = function(paras, listName) {
      var head = list.head(paras);
      var last = list.last(paras);

      var prevList = dom.isList(head.previousSibling) && head.previousSibling;
      var nextList = dom.isList(last.nextSibling) && last.nextSibling;

      var listNode = prevList || dom.insertAfter(dom.create(listName || 'UL'), last);

      // P to LI
      paras = $.map(paras, function(para) {
        return dom.isPurePara(para) ? dom.replace(para, 'LI') : para;
      });

      // append to list(<ul>, <ol>)
      dom.appendChildNodes(listNode, paras);

      if (nextList) {
        dom.appendChildNodes(listNode, list.from(nextList.childNodes));
        dom.remove(nextList);
      }

      return paras;
    };

    /**
     * @method releaseList
     *
     * @param {Array[]} clustereds
     * @param {Boolean} isEscapseToBody
     * @return {Node[]}
     */
    this.releaseList = function(clustereds, isEscapseToBody) {
      var releasedParas = [];

      $.each(clustereds, function(idx, paras) {
        var head = list.head(paras);
        var last = list.last(paras);

        var headList = isEscapseToBody ? dom.lastAncestor(head, dom.isList) :
                                         head.parentNode;
        var lastList = headList.childNodes.length > 1 ? dom.splitTree(headList, {
          node: last.parentNode,
          offset: dom.position(last) + 1
        }, {
          isSkipPaddingBlankHTML: true
        }) : null;

        var middleList = dom.splitTree(headList, {
          node: head.parentNode,
          offset: dom.position(head)
        }, {
          isSkipPaddingBlankHTML: true
        });

        paras = isEscapseToBody ? dom.listDescendant(middleList, dom.isLi) :
                                  list.from(middleList.childNodes).filter(dom.isLi);

        // LI to P
        if (isEscapseToBody || !dom.isList(headList.parentNode)) {
          paras = $.map(paras, function(para) {
            return dom.replace(para, 'P');
          });
        }

        $.each(list.from(paras).reverse(), function(idx, para) {
          dom.insertAfter(para, headList);
        });

        // remove empty lists
        var rootLists = list.compact([headList, middleList, lastList]);
        $.each(rootLists, function(idx, rootList) {
          var listNodes = [rootList].concat(dom.listDescendant(rootList, dom.isList));
          $.each(listNodes.reverse(), function(idx, listNode) {
            if (!dom.nodeLength(listNode)) {
              dom.remove(listNode, true);
            }
          });
        });

        releasedParas = releasedParas.concat(paras);
      });

      return releasedParas;
    };
  };


  /**
   * @class editing.Typing
   *
   * Typing
   *
   */
  var Typing = function() {

    // a Bullet instance to toggle lists off
    var bullet = new Bullet();

    /**
     * insert tab
     *
     * @param {jQuery} $editable
     * @param {WrappedRange} rng
     * @param {Number} tabsize
     */
    this.insertTab = function($editable, rng, tabsize) {
      var tab = dom.createText(new Array(tabsize + 1).join(dom.NBSP_CHAR));
      rng = rng.deleteContents();
      rng.insertNode(tab, true);

      rng = range.create(tab, tabsize);
      rng.select();
    };

    /**
     * insert paragraph
     */
    this.insertParagraph = function() {
      var rng = range.create();

      // deleteContents on range.
      rng = rng.deleteContents();

      // Wrap range if it needs to be wrapped by paragraph
      rng = rng.wrapBodyInlineWithPara();

      // finding paragraph
      var splitRoot = dom.ancestor(rng.sc, dom.isPara);

      var nextPara;
      // on paragraph: split paragraph
      if (splitRoot) {
        // if it is an empty line with li
        if (dom.isEmpty(splitRoot) && dom.isLi(splitRoot)) {
          // disable UL/OL and escape!
          bullet.toggleList(splitRoot.parentNode.nodeName);
          return;
        // if new line has content (not a line break)
        } else {
          nextPara = dom.splitTree(splitRoot, rng.getStartPoint());

          var emptyAnchors = dom.listDescendant(splitRoot, dom.isEmptyAnchor);
          emptyAnchors = emptyAnchors.concat(dom.listDescendant(nextPara, dom.isEmptyAnchor));

          $.each(emptyAnchors, function(idx, anchor) {
            dom.remove(anchor);
          });
        }
      // no paragraph: insert empty paragraph
      } else {
        var next = rng.sc.childNodes[rng.so];
        nextPara = $(dom.emptyPara)[0];
        if (next) {
          rng.sc.insertBefore(nextPara, next);
        } else {
          rng.sc.appendChild(nextPara);
        }
      }

      range.create(nextPara, 0).normalize().select();

    };

  };

  /**
   * @class editing.Table
   *
   * Table
   *
   */
  var Table = function() {
    /**
     * handle tab key
     *
     * @param {WrappedRange} rng
     * @param {Boolean} isShift
     */
    this.tab = function(rng, isShift) {
      var cell = dom.ancestor(rng.commonAncestor(), dom.isCell);
      var table = dom.ancestor(cell, dom.isTable);
      var cells = dom.listDescendant(table, dom.isCell);

      var nextCell = list[isShift ? 'prev' : 'next'](cells, cell);
      if (nextCell) {
        range.create(nextCell, 0).select();
      }
    };

    /**
     * create empty table element
     *
     * @param {Number} rowCount
     * @param {Number} colCount
     * @return {Node}
     */
    this.createTable = function(tOptions) {
        var tds = [], tdHTML;
        var theaders = [];
        var colCount = tOptions[0];
        var rowCount = tOptions[1];
        var classes = tOptions.slice(2, tOptions.length);

        for (var idxCol = 0; idxCol < colCount; idxCol++) {
            //tds.push('<td>' + dom.blank + '</td>');
            tds.push('<td>(item)</td>');
            theaders.push('<th>header</th>');
        }
        tdHTML = tds.join('');
        theaders = theaders.join('');

        var trs = [], trHTML;
        for (var idxRow = 0; idxRow < rowCount; idxRow++) {
            trs.push('<tr>' + tdHTML + '</tr>');
        }
        trHTML = trs.join('');

        return $('<table class="' + classes.join(' ') + '"><thead><tr>' + theaders + '</tr></thead><tbody>' + trHTML + '</tbody></table>')[0];
    };
  };


  var KEY_BOGUS = 'bogus';

  /**
   * @class editing.Editor
   *
   * Editor
   *
   */
  var Editor = function(handler) {

    var style = new Style();
    var table = new Table();
    var typing = new Typing();
    var bullet = new Bullet();

    /**
     * @method createRange
     *
     * create range
     *
     * @param {jQuery} $editable
     * @return {WrappedRange}
     */
    this.createRange = function($editable) {
      this.focus($editable);
      return range.create();
    };

    /**
     * @method saveRange
     *
     * save current range
     *
     * @param {jQuery} $editable
     * @param {Boolean} [thenCollapse=false]
     */
    this.saveRange = function($editable, thenCollapse) {
      this.focus($editable);
      $editable.data('range', range.create());
      if (thenCollapse) {
        range.create().collapse().select();
      }
    };

    /**
     * @method saveRange
     *
     * save current node list to $editable.data('childNodes')
     *
     * @param {jQuery} $editable
     */
    this.saveNode = function($editable) {
      // copy child node reference
      var copy = [];
      for (var key  = 0, len = $editable[0].childNodes.length; key < len; key++) {
        copy.push($editable[0].childNodes[key]);
      }
      $editable.data('childNodes', copy);
    };

    /**
     * @method restoreRange
     *
     * restore lately range
     *
     * @param {jQuery} $editable
     */
    this.restoreRange = function($editable) {
      var rng = $editable.data('range');
      if (rng) {
        rng.select();
        this.focus($editable);
      }
    };

    /**
     * @method restoreNode
     *
     * restore lately node list
     *
     * @param {jQuery} $editable
     */
    this.restoreNode = function($editable) {
      $editable.html('');
      var child = $editable.data('childNodes');
      for (var index = 0, len = child.length; index < len; index++) {
        $editable[0].appendChild(child[index]);
      }
    };
    /**
     * @method currentStyle
     *
     * current style
     *
     * @param {Node} target
     * @return {Boolean} false if range is no
     */
    this.currentStyle = function(target) {
      var rng = range.create();
      return rng ? rng.isOnEditable() && style.current(rng, target) : false;
    };

    var triggerOnBeforeChange = function($editable) {
      var $holder = dom.makeLayoutInfo($editable).holder();
      handler.bindCustomEvent(
        $holder, $editable.data('callbacks'), 'before.command'
      )($editable.html(), $editable);
    };

    var triggerOnChange = function($editable) {
      var $holder = dom.makeLayoutInfo($editable).holder();
      handler.bindCustomEvent(
        $holder, $editable.data('callbacks'), 'change'
      )($editable.html(), $editable);
    };

    /**
     * @method undo
     * undo
     * @param {jQuery} $editable
     */
    this.undo = function($editable) {
      triggerOnBeforeChange($editable);
      $editable.data('NoteHistory').undo();
      triggerOnChange($editable);
    };

    /**
     * @method redo
     * redo
     * @param {jQuery} $editable
     */
    this.redo = function($editable) {
      triggerOnBeforeChange($editable);
      $editable.data('NoteHistory').redo();
      triggerOnChange($editable);
    };

    var self = this;
    /**
     * @method beforeCommand
     * before command
     * @param {jQuery} $editable
     */
    var beforeCommand = this.beforeCommand = function($editable) {
      triggerOnBeforeChange($editable);
      // keep focus on editable before command execution
      self.focus($editable);
    };

    /**
     * @method afterCommand
     * after command
     * @param {jQuery} $editable
     * @param {Boolean} isPreventTrigger
     */
    var afterCommand = this.afterCommand = function($editable, isPreventTrigger) {
      $editable.data('NoteHistory').recordUndo();
      if (!isPreventTrigger) {
        triggerOnChange($editable);
      }
    };

    /**
     * @method bold
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method italic
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method underline
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method strikethrough
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method formatBlock
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method superscript
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method subscript
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method justifyLeft
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method justifyCenter
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method justifyRight
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method justifyFull
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method formatBlock
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method removeFormat
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method backColor
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method foreColor
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method insertHorizontalRule
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /**
     * @method fontName
     *
     * change font name
     *
     * @param {jQuery} $editable
     * @param {Mixed} value
     */

    /* jshint ignore:start */
    // native commands(with execCommand), generate function for execCommand
    // >>>>>>> CK
    var commands = ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript',
                    'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
                    'formatBlock', 'removeFormat',
                    'backColor', 'foreColor', 'fontName'];

    for (var idx = 0, len = commands.length; idx < len; idx ++) {
        this[commands[idx]] = (function(sCmd) {
            return function($editable, value) {
                beforeCommand($editable);

                document.execCommand(sCmd, false, value);

                afterCommand($editable, true);
            };
        })(commands[idx]);
    }
    /* jshint ignore:end */

    this.insertHorizontalRule = function() {
        var hrNode = $('<div />');
            hrNode.addClass('divider');

        range.create().insertNode(hrNode[0]);
    };

    /**
     * @method tab
     *
     * handle tab key
     *
     * @param {jQuery} $editable
     * @param {Object} options
     */
    this.tab = function($editable, options) {
      var rng = this.createRange($editable);
      if (rng.isCollapsed() && rng.isOnCell()) {
        table.tab(rng);
      } else {
        beforeCommand($editable);
        typing.insertTab($editable, rng, options.tabsize);
        afterCommand($editable);
      }
    };

    /**
     * @method untab
     *
     * handle shift+tab key
     *
     */
    this.untab = function($editable) {
      var rng = this.createRange($editable);
      if (rng.isCollapsed() && rng.isOnCell()) {
        table.tab(rng, true);
      }
    };

    /**
     * @method insertParagraph
     *
     * insert paragraph
     *
     * @param {Node} $editable
     */
    this.insertParagraph = function($editable) {
      beforeCommand($editable);
      typing.insertParagraph($editable);
      afterCommand($editable);
    };

    /**
     * @method insertOrderedList
     *
     * @param {jQuery} $editable
     */
    this.insertOrderedList = function($editable) {
      beforeCommand($editable);
      bullet.insertOrderedList($editable);
      afterCommand($editable);
    };

    /**
     * @param {jQuery} $editable
     */
    this.insertUnorderedList = function($editable) {
      beforeCommand($editable);
      bullet.insertUnorderedList($editable);
      afterCommand($editable);
    };

    /**
     * @param {jQuery} $editable
     */
    this.indent = function($editable) {
      beforeCommand($editable);
      bullet.indent($editable);
      afterCommand($editable);
    };

    /**
     * @param {jQuery} $editable
     */
    this.outdent = function($editable) {
      beforeCommand($editable);
      bullet.outdent($editable);
      afterCommand($editable);
    };

    /**
     * insert image
     *
     * @param {jQuery} $editable
     * @param {String} sUrl
     */
    this.insertImage = function($editable, sUrl, filename) {
      async.createImage(sUrl, filename).then(function($image) {
        beforeCommand($editable);
        $image.css({
          display: '',
          width: Math.min($editable.width(), $image.width())
        });
        range.create().insertNode($image[0]);
        range.createFromNodeAfter($image[0]).select();
        afterCommand($editable);
      }).fail(function() {
        var $holder = dom.makeLayoutInfo($editable).holder();
        handler.bindCustomEvent(
          $holder, $editable.data('callbacks'), 'image.upload.error'
        )();
      });
    };

    /**
     * @method insertNode
     * insert node
     * @param {Node} $editable
     * @param {Node} node
     */
    this.insertNode = function($editable, node) {
      beforeCommand($editable);
      range.create().insertNode(node);
      range.createFromNodeAfter(node).select();
      afterCommand($editable);
    };

    /**
     * insert text
     * @param {Node} $editable
     * @param {String} text
     */
    this.insertText = function($editable, text) {
      beforeCommand($editable);
      var textNode = range.create().insertNode(dom.createText(text));
      range.create(textNode, dom.nodeLength(textNode)).select();
      afterCommand($editable);
    };

    /**
     * paste HTML
     * @param {Node} $editable
     * @param {String} markup
     */
    this.pasteHTML = function($editable, markup) {
      beforeCommand($editable);
      var contents = range.create().pasteHTML(markup);
      range.createFromNodeAfter(list.last(contents)).select();
      afterCommand($editable);
    };

    /**
     * formatBlock
     *
     * @param {jQuery} $editable
     * @param {String} tagName
     */
    this.formatBlock = function($editable, tagName) {
      beforeCommand($editable);
      // [workaround] for MSIE, IE need `<`
      tagName = agent.isMSIE ? '<' + tagName + '>' : tagName;
      document.execCommand('FormatBlock', false, tagName);
      afterCommand($editable);
    };

    this.formatPara = function($editable) {
      beforeCommand($editable);
      this.formatBlock($editable, 'P');
      afterCommand($editable);
    };

    /* jshint ignore:start */
    for (var idx = 1; idx <= 6; idx ++) {
      this['formatH' + idx] = function(idx) {
        return function($editable) {
          this.formatBlock($editable, 'H' + idx);
        };
      }(idx);
    };
    /* jshint ignore:end */

    /**
     * fontSize
     *
     * @param {jQuery} $editable
     * @param {String} value - px
     */
    this.fontSize = function($editable, value) {
      var rng = range.create();
      var isCollapsed = rng.isCollapsed();

      if (isCollapsed) {
        var spans = style.styleNodes(rng);
        var firstSpan = list.head(spans);

        $(spans).css({
          'font-size': value + 'px'
        });

        // [workaround] added styled bogus span for style
        //  - also bogus character needed for cursor position
        if (firstSpan && !dom.nodeLength(firstSpan)) {
          firstSpan.innerHTML = dom.ZERO_WIDTH_NBSP_CHAR;
          range.createFromNodeAfter(firstSpan.firstChild).select();
          $editable.data(KEY_BOGUS, firstSpan);
        }
      } else {
        beforeCommand($editable);
        $(style.styleNodes(rng)).css({
          'font-size': value + 'px'
        });
        afterCommand($editable);
      }
    };

    /**
     * remove bogus node and character
     */
    this.removeBogus = function($editable) {
      var bogusNode = $editable.data(KEY_BOGUS);
      if (!bogusNode) {
        return;
      }

      var textNode = list.find(list.from(bogusNode.childNodes), dom.isText);

      var bogusCharIdx = textNode.nodeValue.indexOf(dom.ZERO_WIDTH_NBSP_CHAR);
      if (bogusCharIdx !== -1) {
        textNode.deleteData(bogusCharIdx, 1);
      }

      if (dom.isEmpty(bogusNode)) {
        dom.remove(bogusNode);
      }

      $editable.removeData(KEY_BOGUS);
    };

    /**
     * lineHeight
     * @param {jQuery} $editable
     * @param {String} value
     */
    this.lineHeight = function($editable, value) {
      beforeCommand($editable);
      style.stylePara(range.create(), {
        lineHeight: value
      });
      afterCommand($editable);
    };

    /**
     * unlink
     *
     * @type command
     *
     * @param {jQuery} $editable
     */
    this.unlink = function($editable) {
      var rng = this.createRange($editable);
      if (rng.isOnAnchor()) {
        var anchor = dom.ancestor(rng.sc, dom.isAnchor);
        rng = range.createFromNode(anchor);
        rng.select();

        beforeCommand($editable);
        document.execCommand('unlink');
        afterCommand($editable);
      }
    };

    /**
     * create link (command)
     *
     * @param {jQuery} $editable
     * @param {Object} linkInfo
     * @param {Object} options
     */
    this.createLink = function($editable, linkInfo, options) {
      var linkUrl = linkInfo.url;
      var linkText = linkInfo.text;
      var isNewWindow = linkInfo.newWindow;
      var rng = linkInfo.range;
      var isTextChanged = rng.toString() !== linkText;

      beforeCommand($editable);

      if (options.onCreateLink) {
        linkUrl = options.onCreateLink(linkUrl);
      }

      var anchors = [];
      if (isTextChanged) {
        // Create a new link when text changed.
        var anchor = rng.insertNode($('<A>' + linkText + '</A>')[0]);
        anchors.push(anchor);
      } else {
        anchors = style.styleNodes(rng, {
          nodeName: 'A',
          expandClosestSibling: true,
          onlyPartialContains: true
        });
      }

      $.each(anchors, function(idx, anchor) {
        $(anchor).attr('href', linkUrl);
        if (isNewWindow) {
          $(anchor).attr('target', '_blank');
        } else {
          $(anchor).removeAttr('target');
        }
      });

      var startRange = range.createFromNodeBefore(list.head(anchors));
      var startPoint = startRange.getStartPoint();
      var endRange = range.createFromNodeAfter(list.last(anchors));
      var endPoint = endRange.getEndPoint();

      range.create(
        startPoint.node,
        startPoint.offset,
        endPoint.node,
        endPoint.offset
      ).select();

      afterCommand($editable);
    };

    /**
     * returns link info
     *
     * @return {Object}
     * @return {WrappedRange} return.range
     * @return {String} return.text
     * @return {Boolean} [return.isNewWindow=true]
     * @return {String} [return.url='']
     */
    this.getLinkInfo = function($editable) {
      this.focus($editable);

      var rng = range.create().expand(dom.isAnchor);

      // Get the first anchor on range(for edit).
      var $anchor = $(list.head(rng.nodes(dom.isAnchor)));

      return {
        range: rng,
        text: rng.toString(),
        isNewWindow: $anchor.length ? $anchor.attr('target') === '_blank' : false,
        url: $anchor.length ? $anchor.attr('href') : ''
      };
    };

    /**
     * setting color
     *
     * @param {Node} $editable
     * @param {Object} sObjColor  color code
     * @param {String} sObjColor.foreColor foreground color
     * @param {String} sObjColor.backColor background color
     */
    this.color = function($editable, sObjColor) {
      var oColor = JSON.parse(sObjColor);
      var foreColor = oColor.foreColor, backColor = oColor.backColor;

      beforeCommand($editable);

      if (foreColor) { document.execCommand('foreColor', false, foreColor); }
      if (backColor) { document.execCommand('backColor', false, backColor); }

      afterCommand($editable);
    };

    /**
     * insert Table
     *
     * @param {Node} $editable
     * @param {String} sDim dimension of table (ex : "5x5")
     */
    this.insertTable = function($editable, sDim) {
      var tOptions = sDim.split('x');
      beforeCommand($editable);

      var rng = range.create().deleteContents();
      rng.insertNode(table.createTable(tOptions));
      afterCommand($editable);
    };

    /**
     * float me
     *
     * @param {jQuery} $editable
     * @param {String} value
     * @param {jQuery} $target
     */
    this.floatMe = function($editable, value, $target) {
      beforeCommand($editable);
      $target.css('float', value);
      afterCommand($editable);
    };

    /**
     * change image shape
     *
     * @param {jQuery} $editable
     * @param {String} value css class
     * @param {Node} $target
     */
    this.imageShape = function($editable, value, $target) {
      beforeCommand($editable);

      $target.removeClass('img-rounded img-circle img-thumbnail img-bordered');

      if (value) {
        $target.addClass(value);
      }

      afterCommand($editable);
    };

    /**
     * >>>>>>> CK
     * change image class
     *
     * @param {jQuery} $editable
     * @param {String} value css class
     * @param {Node} $target
     */
    this.imageClass = function($editable, value, $target) {
      beforeCommand($editable);

      if (value) {
        if ($target.hasClass(value)) {
          $target.removeClass(value);
        } else {
          $target.addClass(value);
        }
      }

      afterCommand($editable);
    };

    /**
     * resize overlay element
     * @param {jQuery} $editable
     * @param {String} value
     * @param {jQuery} $target - target element
     */
    this.resize = function($editable, value, $target) {
      beforeCommand($editable);

      $target.css({
        width: value * 100 + '%',
        height: ''
      });

      afterCommand($editable);
    };

    /**
     * @param {Position} pos
     * @param {jQuery} $target - target element
     * @param {Boolean} [bKeepRatio] - keep ratio
     */
    this.resizeTo = function(pos, $target, bKeepRatio) {
      var imageSize;
      if (bKeepRatio) {
        var newRatio = pos.y / pos.x;
        var ratio = $target.data('ratio');
        imageSize = {
          width: ratio > newRatio ? pos.x : pos.y / ratio,
          height: ratio > newRatio ? pos.x * ratio : pos.y
        };
      } else {
        imageSize = {
          width: pos.x,
          height: pos.y
        };
      }

      $target.css(imageSize);
    };

    /**
     * remove media object
     *
     * @param {jQuery} $editable
     * @param {String} value - dummy argument (for keep interface)
     * @param {jQuery} $target - target element
     */
    this.removeMedia = function($editable, value, $target) {
      beforeCommand($editable);
      $target.detach();

      handler.bindCustomEvent(
        $(), $editable.data('callbacks'), 'media.delete'
      )($target, $editable);

      afterCommand($editable);
    };

    /**
     * set focus
     *
     * @param $editable
     */
    this.focus = function($editable) {
      $editable.focus();

      // [workaround] for firefox bug http://goo.gl/lVfAaI
      if (agent.isFF && !range.create().isOnEditable()) {
        range.createFromNode($editable[0])
             .normalize()
             .collapse()
             .select();
      }
    };

    /**
     * returns whether contents is empty or not.
     *
     * @param {jQuery} $editable
     * @return {Boolean}
     */
    this.isEmpty = function($editable) {
      return dom.isEmpty($editable[0]) || dom.emptyPara === $editable.html();
    };
  };

  /**
   * @class module.Button
   *
   * Button
   */
  var Button = function() {
    /**
     * update button status
     *
     * @param {jQuery} $container
     * @param {Object} styleInfo
     */
    this.update = function($container, styleInfo) {
      /**
       * handle dropdown's check mark (for fontname, fontsize, lineHeight).
       * @param {jQuery} $btn
       * @param {Number} value
       */
      var checkDropdownMenu = function($btn, value) {
        $btn.find('.dropdown-menu li').each(function() {

          var div = $(this).children('div');
          var currentValue = div.data('value');

          // always compare string to avoid creating another func.
          if ((currentValue + '') === (value + '')) {
            div.children('i').removeClass('transparent');
          } else {
            div.children('i').addClass('transparent');
          }
        });
      };

      /**
       * update button state(active or not).
       *
       * @private
       * @param {String} selector
       * @param {Function} pred
       */
      var btnState = function(selector, pred) {
        var $btn = $container.find(selector);

        $btn.toggleClass('active', pred());
      };

      if (styleInfo.image) {
        var $img = $(styleInfo.image);

        btnState('.btn[data-event="imageClass"][data-value="img-rounded"]', function() {
          return $img.hasClass('img-rounded');
        });
        btnState('.btn[data-event="imageClass"][data-value="img-circle"]', function() {
          return $img.hasClass('img-circle');
        });
        btnState('.btn[data-event="imageClass"][data-value="img-thumbnail"]', function() {
          return $img.hasClass('img-thumbnail');
        });
        btnState('.btn[data-event="imageClass"][data-value="img-bordered"]', function() {
          return $img.hasClass('img-bordered');
        });
        btnState('.btn[data-event="imageShape"]:not([data-value])', function() {
          return !$img.is('.img-rounded, .img-circle, .img-thumbnail, .img-bordered');
        });

        var imgFloat = $img.css('float');
        btnState('.btn[data-event="floatMe"][data-value="left"]', function() {
          return imgFloat === 'left';
        });
        btnState('.btn[data-event="floatMe"][data-value="right"]', function() {
          return imgFloat === 'right';
        });
        btnState('.btn[data-event="floatMe"][data-value="none"]', function() {
          return imgFloat !== 'left' && imgFloat !== 'right';
        });

        var style = $img.attr('style');
        btnState('.btn[data-event="resize"][data-value="1"]', function() {
          return !!/(^|\s)(max-)?width\s*:\s*100%/.test(style);
        });
        btnState('.btn[data-event="resize"][data-value="0.5"]', function() {
          return !!/(^|\s)(max-)?width\s*:\s*50%/.test(style);
        });
        btnState('.btn[data-event="resize"][data-value="0.25"]', function() {
          return !!/(^|\s)(max-)?width\s*:\s*25%/.test(style);
        });
        return;
      }

      // fontname
      var $fontname = $container.find('.note-fontname[data-name=fontname]');
      if ($fontname.length) {
        var selectedFont = styleInfo['font-family'];
        if (!!selectedFont) {

          var list = selectedFont.split(',');
          for (var i = 0, len = list.length; i < len; i++) {
            selectedFont = list[i].replace(/[\'\"]/g, '').replace(/\s+$/, '').replace(/^\s+/, '');
            if (agent.isFontInstalled(selectedFont)) {
              break;
            }
          }

          $fontname.find('.note-current-fontname').text(selectedFont);
          checkDropdownMenu($fontname, selectedFont);

        }
      }

      // fontsize
      var $fontsize = $container.find('.note-fontsize[data-name=fontsize]');
      $fontsize.find('.note-current-fontsize').text(styleInfo['font-size']);
      checkDropdownMenu($fontsize, parseFloat(styleInfo['font-size']));

      // lineheight
      var $lineHeight = $container.find('.note-height[data-name=lineheight]');
      checkDropdownMenu($lineHeight, parseFloat(styleInfo['line-height']));

      btnState('.btn[data-event="bold"]', function() {
        return styleInfo['font-bold'] === 'bold';
      });
      btnState('.btn[data-event="italic"]', function() {
        return styleInfo['font-italic'] === 'italic';
      });
      btnState('.btn[data-event="underline"]', function() {
        return styleInfo['font-underline'] === 'underline';
      });
      btnState('.btn[data-event="strikethrough"]', function() {
        return styleInfo['font-strikethrough'] === 'strikethrough';
      });
      btnState('.btn[data-event="superscript"]', function() {
        return styleInfo['font-superscript'] === 'superscript';
      });
      btnState('.btn[data-event="subscript"]', function() {
        return styleInfo['font-subscript'] === 'subscript';
      });
      btnState('.btn[data-event="justifyLeft"]', function() {
        return styleInfo['text-align'] === 'left' || styleInfo['text-align'] === 'start';
      });
      btnState('.btn[data-event="justifyCenter"]', function() {
        return styleInfo['text-align'] === 'center';
      });
      btnState('.btn[data-event="justifyRight"]', function() {
        return styleInfo['text-align'] === 'right';
      });
      btnState('.btn[data-event="justifyFull"]', function() {
        return styleInfo['text-align'] === 'justify';
      });
      btnState('.btn[data-event="insertUnorderedList"]', function() {
        return styleInfo['list-style'] === 'unordered';
      });
      btnState('.btn[data-event="insertOrderedList"]', function() {
        return styleInfo['list-style'] === 'ordered';
      });
    };

    /**
     * update recent color
     *
     * @param {Node} button
     * @param {String} eventName
     * @param {Mixed} value
     */
    this.updateRecentColor = function(button, eventName, value) {
      var $color = $(button).closest('.note-color');
      var $recentColor = $color.find('.note-recent-color');
      var colorInfo = JSON.parse($recentColor.attr('data-value'));
      var sKey = eventName === 'backColor' ? 'background-color' : 'color';

      colorInfo[eventName] = value;
      $recentColor.attr('data-value', JSON.stringify(colorInfo));
      $recentColor.css(sKey, value);
    };
  };

  /**
   * @class module.Toolbar
   *
   * Toolbar
   */
  var Toolbar = function() {
    var button = new Button();

    this.update = function($toolbar, styleInfo) {
      button.update($toolbar, styleInfo);
    };

    /**
     * @param {Node} button
     * @param {String} eventName
     * @param {String} value
     */
    this.updateRecentColor = function(buttonNode, eventName, value) {
      button.updateRecentColor(buttonNode, eventName, value);
    };

    /**
     * activate buttons exclude codeview
     * @param {jQuery} $toolbar
     */
    this.activate = function($toolbar) {
      $toolbar.find('button, .btn')
              .not('.btn[data-event="codeview"]')
              .removeClass('disabled');
    };

    /**
     * deactivate buttons exclude codeview
     * @param {jQuery} $toolbar
     */
    this.deactivate = function($toolbar) {
      $toolbar.find('button, .btn')
              .not('.btn[data-event="codeview"]')
              .addClass('disabled');
    };

    /**
     * @param {jQuery} $container
     * @param {Boolean} [bFullscreen=false]
     */
    this.updateFullscreen = function($container, bFullscreen) {
      var $btn = $container.find('.btn[data-event="fullscreen"]');
      $btn.toggleClass('active', bFullscreen);
    };

    /**
     * @param {jQuery} $container
     * @param {Boolean} [isCodeview=false]
     */
    this.updateCodeview = function($container, isCodeview) {
      var $btn = $container.find('.btn[data-event="codeview"]');
      $btn.toggleClass('active', isCodeview);

      if (isCodeview) {
        this.deactivate($container);
      } else {
        this.activate($container);
      }
    };

    /**
     * get button in toolbar
     *
     * @param {jQuery} $editable
     * @param {String} name
     * @return {jQuery}
     */
    this.get = function($editable, name) {
      var $toolbar = dom.makeLayoutInfo($editable).toolbar();

      return $toolbar.find('[data-name=' + name + ']');
    };

    /**
     * set button state
     * @param {jQuery} $editable
     * @param {String} name
     * @param {Boolean} [isActive=true]
     */
    this.setButtonState = function($editable, name, isActive) {
      isActive = (isActive === false) ? false : true;

      var $button = this.get($editable, name);
      $button.toggleClass('active', isActive);
    };
  };

  var EDITABLE_PADDING = 24;

  var Statusbar = function() {
    var $document = $(document);

    this.attach = function(layoutInfo, options) {
      if (!options.disableResizeEditor) {
        layoutInfo.statusbar().on('mousedown', hStatusbarMousedown);
      }
    };

    /**
     * `mousedown` event handler on statusbar
     *
     * @param {MouseEvent} event
     */
    var hStatusbarMousedown = function(event) {
      event.preventDefault();
      event.stopPropagation();

      var $editable = dom.makeLayoutInfo(event.target).editable();
      var editableTop = $editable.offset().top - $document.scrollTop();

      var layoutInfo = dom.makeLayoutInfo(event.currentTarget || event.target);
      var options = layoutInfo.editor().data('options');

      $document.on('mousemove', function(event) {
        var nHeight = event.clientY - (editableTop + EDITABLE_PADDING);

        nHeight = (options.minHeight > 0) ? Math.max(nHeight, options.minHeight) : nHeight;
        nHeight = (options.maxHeight > 0) ? Math.min(nHeight, options.maxHeight) : nHeight;

        $editable.height(nHeight);
      }).one('mouseup', function() {
        $document.off('mousemove');
      });
    };
  };

  /**
   * @class module.Popover
   *
   * Popover (http://getbootstrap.com/javascript/#popovers)
   *
   */
  var Popover = function() {
    var button = new Button();

    /**
     * returns position from placeholder
     *
     * @private
     * @param {Node} placeholder
     * @param {Boolean} isAirMode
     * @return {Object}
     * @return {Number} return.left
     * @return {Number} return.top
     */
    var posFromPlaceholder = function(placeholder, isAirMode) {
      var $placeholder = $(placeholder);
      var pos = isAirMode ? $placeholder.offset() : $placeholder.position();
      var height = $placeholder.outerHeight(true); // include margin

      // popover below placeholder.
      return {
        left: pos.left,
        top: pos.top + height
      };
    };

    /**
     * show popover
     *
     * @private
     * @param {jQuery} popover
     * @param {Position} pos
     */
    var showPopover = function($popover, pos) {
      $popover.css({
        display: 'block',
        left: pos.left,
        top: pos.top
      });
    };

    var PX_POPOVER_ARROW_OFFSET_X = 20;

    /**
     * update current state
     * @param {jQuery} $popover - popover container
     * @param {Object} styleInfo - style object
     * @param {Boolean} isAirMode
     */
    this.update = function($popover, styleInfo, isAirMode) {
      button.update($popover, styleInfo);

      var $linkPopover = $popover.find('.note-link-popover');
      if (styleInfo.anchor) {
        var $anchor = $linkPopover.find('a');
        var href = $(styleInfo.anchor).attr('href');
        var target = $(styleInfo.anchor).attr('target');
        $anchor.attr('href', href).html(href);
        if (!target) {
          $anchor.removeAttr('target');
        } else {
          $anchor.attr('target', '_blank');
        }
        showPopover($linkPopover, posFromPlaceholder(styleInfo.anchor, isAirMode));
      } else {
        $linkPopover.hide();
      }

      var $imagePopover = $popover.find('.note-image-popover');
      if (styleInfo.image) {
        showPopover($imagePopover, posFromPlaceholder(styleInfo.image, isAirMode));
      } else {
        $imagePopover.hide();
      }

      var $airPopover = $popover.find('.note-air-popover');
      if (isAirMode && !styleInfo.range.isCollapsed()) {
        var rect = list.last(styleInfo.range.getClientRects());
        if (rect) {
          var bnd = func.rect2bnd(rect);
          showPopover($airPopover, {
            left: Math.max(bnd.left + bnd.width / 2 - PX_POPOVER_ARROW_OFFSET_X, 0),
            top: bnd.top + bnd.height
          });
        }
      } else {
        $airPopover.hide();
      }
    };

    /**
     * @param {Node} button
     * @param {String} eventName
     * @param {String} value
     */
    this.updateRecentColor = function(button, eventName, value) {
      button.updateRecentColor(button, eventName, value);
    };

    /**
     * hide all popovers
     * @param {jQuery} $popover - popover container
     */
    this.hide = function($popover) {
      $popover.children().hide();
    };
  };

  /**
   * @class module.Handle
   *
   * Handle
   */
  var Handle = function(handler) {
    var $document = $(document);

    /**
     * `mousedown` event handler on $handle
     *  - controlSizing: resize image
     *
     * @param {MouseEvent} event
     */
    var hHandleMousedown = function(event) {
      if (dom.isControlSizing(event.target)) {
        event.preventDefault();
        event.stopPropagation();

        var layoutInfo = dom.makeLayoutInfo(event.target),
            $handle = layoutInfo.handle(),
            $popover = layoutInfo.popover(),
            $editable = layoutInfo.editable(),
            $editor = layoutInfo.editor();

        var target = $handle.find('.note-control-selection').data('target'),
            $target = $(target), posStart = $target.offset(),
            scrollTop = $document.scrollTop();

        var isAirMode = $editor.data('options').airMode;

        $document.on('mousemove', function(event) {
          handler.invoke('editor.resizeTo', {
            x: event.clientX - posStart.left,
            y: event.clientY - (posStart.top - scrollTop)
          }, $target, !event.shiftKey);

          handler.invoke('handle.update', $handle, {image: target}, isAirMode);
          handler.invoke('popover.update', $popover, {image: target}, isAirMode);
        }).one('mouseup', function() {
          $document.off('mousemove');
          handler.invoke('editor.afterCommand', $editable);
        });

        if (!$target.data('ratio')) { // original ratio.
          $target.data('ratio', $target.height() / $target.width());
        }
      }
    };

    this.attach = function(layoutInfo) {
      layoutInfo.handle().on('mousedown', hHandleMousedown);
    };

    /**
     * update handle
     * @param {jQuery} $handle
     * @param {Object} styleInfo
     * @param {Boolean} isAirMode
     */
    this.update = function($handle, styleInfo, isAirMode) {
      var $selection = $handle.find('.note-control-selection');
      if (styleInfo.image) {
        var $image = $(styleInfo.image);
        var pos = isAirMode ? $image.offset() : $image.position();

        // include margin
        var imageSize = {
          w: $image.outerWidth(true),
          h: $image.outerHeight(true)
        };

        $selection.css({
          display: 'block',
          left: pos.left,
          top: pos.top,
          width: imageSize.w,
          height: imageSize.h
        }).data('target', styleInfo.image); // save current image element.
        var sizingText = imageSize.w + 'x' + imageSize.h;
        $selection.find('.note-control-selection-info').text(sizingText);
      } else {
        $selection.hide();
      }
    };

    /**
     * hide
     *
     * @param {jQuery} $handle
     */
    this.hide = function($handle) {
      $handle.children().hide();
    };
  };

  var Fullscreen = function(handler) {
    var $window = $(window);
    var $scrollbar = $('html, body');

    /**
     * toggle fullscreen
     *
     * @param {Object} layoutInfo
     */
    this.toggle = function(layoutInfo) {

      var $editor = layoutInfo.editor(),
          $toolbar = layoutInfo.toolbar(),
          $editable = layoutInfo.editable(),
          $codable = layoutInfo.codable();

      var resize = function(size) {
        $editable.css('height', size.h);
        $codable.css('height', size.h);
        if ($codable.data('cmeditor')) {
          $codable.data('cmeditor').setsize(null, size.h);
        }
      };

      $editor.toggleClass('fullscreen');
      var isFullscreen = $editor.hasClass('fullscreen');
      if (isFullscreen) {
        $editable.data('orgheight', $editable.css('height'));

        $window.on('resize', function() {
          resize({
            h: $window.height() - $toolbar.outerHeight()
          });
        }).trigger('resize');

        $scrollbar.css('overflow', 'hidden');
        $toolbar.css('top', 0);
      } else {
        $window.off('resize');
        resize({
          h: $editable.data('orgheight')
        });
        $scrollbar.css('overflow', 'visible');
      }

      handler.invoke('toolbar.updateFullscreen', $toolbar, isFullscreen);
    };
  };


  var CodeMirror;
  if (agent.hasCodeMirror) {
    if (agent.isSupportAmd) {
      require(['CodeMirror'], function(cm) {
        CodeMirror = cm;
      });
    } else {
      CodeMirror = window.CodeMirror;
    }
  }

  /**
   * @class Codeview
   */
  var Codeview = function(handler) {

    this.sync = function(layoutInfo) {
      var isCodeview = handler.invoke('codeview.isActivated', layoutInfo);
      if (isCodeview && agent.hasCodeMirror) {
        layoutInfo.codable().data('cmEditor').save();
      }
    };

    /**
     * @param {Object} layoutInfo
     * @return {Boolean}
     */
    this.isActivated = function(layoutInfo) {
      var $editor = layoutInfo.editor();
      return $editor.hasClass('codeview');
    };

    /**
     * toggle codeview
     *
     * @param {Object} layoutInfo
     */
    this.toggle = function(layoutInfo) {
      if (this.isActivated(layoutInfo)) {
        this.deactivate(layoutInfo);
      } else {
        this.activate(layoutInfo);
      }
    };

    //var originalValue;
    /**
     * activate code view
     *
     * @param {Object} layoutInfo
     */
    this.activate = function(layoutInfo) {
      var $editor = layoutInfo.editor(),
          $toolbar = layoutInfo.toolbar(),
          $editable = layoutInfo.editable(),
          $codable = layoutInfo.codable(),
          $popover = layoutInfo.popover(),
          $handle = layoutInfo.handle();

      var options = $editor.data('options');
      var codeString = dom.html($editable, false);

        // >>>>>>> CK indentation function
        function beautifyHTML(code, level, insideLastBlock, dictionary) {
            var openTag = code.indexOf('<');
            var closeTag = code.indexOf('>');
            var chunk;

            if (openTag === 0) {
                //first thing is a tag
                chunk = code.substring(0, closeTag + 1);
                code = code.substring(closeTag + 1);

                if (chunk.indexOf("</") === 0) {
                    level--;
                    nsideLastBlock = false;
                } else {
                    if (insideLastBlock) {
                        level++;
                    }

                    //check if current tag is a self closing tag (no indent next line in this case)
                    var found = false;

                    for (var i = 0; i < dictionary.length; i++) {
                        if (chunk.indexOf(dictionary[i]) === 0) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        insideLastBlock = true;
                    } else {
                        insideLastBlock = false;
                    }
                }
            } else {
                //first thing is content
                chunk = code.substring(0, openTag);
                code = code.substring(openTag);

                if (insideLastBlock) {
                    level++;
                }
                insideLastBlock = false;
            }
            chunk = new Array(level + 1).join('    ') + chunk.trim();

            //console.log(level);
            //console.log(chunk);
            //console.log(code);

            if (code.length === 0) {
                return chunk;
            }
            return chunk + "\n" + beautifyHTML(code.trim(), level, insideLastBlock, dictionary);
        }

        //originalValue = codeString;

        var selfCloseTags = ['<img', '<br', '<hr'];
        codeString = beautifyHTML(codeString, 0, false, selfCloseTags);
        // CK end -----------------------

      $codable.val(codeString);

      var buttonHeight = $toolbar.find('.btn[data-event=codeview]').height();
      var areaHeight = $(window).height() - buttonHeight;
      $codable.height($editable.height());

      handler.invoke('toolbar.updateCodeview', $toolbar, true);
      handler.invoke('popover.hide', $popover);
      handler.invoke('handle.hide', $handle);

      $editor.addClass('codeview');

      $codable.focus();

      // activate CodeMirror as codable
      if (agent.hasCodeMirror) {
        var cmEditor = CodeMirror.fromTextArea($codable[0], options.codemirror);

        // CodeMirror TernServer
        if (options.codemirror.tern) {
          var server = new CodeMirror.TernServer(options.codemirror.tern);
          cmEditor.ternServer = server;
          cmEditor.on('cursorActivity', function(cm) {
            server.updateArgHints(cm);
          });
        }

        // CodeMirror hasn't Padding.
        if ($editor.hasClass('fullscreen')) {
          cmEditor.setSize(null, areaHeight);
        }
        else {
          cmEditor.setSize(null, $editable.outerHeight());
        }

        $codable.data('cmEditor', cmEditor);
      }
    };

    /**
     * deactivate code view
     *
     * @param {Object} layoutInfo
     */
    this.deactivate = function(layoutInfo) {
      var $holder = layoutInfo.holder(),
          $editor = layoutInfo.editor(),
          $toolbar = layoutInfo.toolbar(),
          $editable = layoutInfo.editable(),
          $codable = layoutInfo.codable();

      var options = $editor.data('options');

      // deactivate CodeMirror as codable
      if (agent.hasCodeMirror) {
        var cmEditor = $codable.data('cmEditor');
        $codable.val(cmEditor.getValue());
        cmEditor.toTextArea();
      }

      var value = dom.value($codable, options.prettifyHtml) || dom.emptyPara;
      //var value = originalValue;
      var isChange = $editable.html() !== value;

      $editable.html(value);
      $editable.height(options.height ? $codable.height() : 'auto');
      $editor.removeClass('codeview');

      if (isChange) {
        handler.bindCustomEvent(
          $holder, $editable.data('callbacks'), 'change'
        )($editable.html(), $editable);
      }

      $editable.focus();

      handler.invoke('toolbar.updateCodeview', $toolbar, false);
    };
  };

  var DragAndDrop = function(handler) {
    var $document = $(document);

    /**
     * attach Drag and Drop Events
     *
     * @param {Object} layoutInfo - layout Informations
     * @param {Object} options
     */
    this.attach = function(layoutInfo, options) {
      if (options.airMode || options.disableDragAndDrop) {
        // prevent default drop event
        $document.on('drop', function(e) {
          e.preventDefault();
        });
      } else {
        this.attachDragAndDropEvent(layoutInfo, options);
      }
    };

    /**
     * attach Drag and Drop Events
     *
     * @param {Object} layoutInfo - layout Informations
     * @param {Object} options
     */
    this.attachDragAndDropEvent = function(layoutInfo, options) {
      var collection = $(),
          $editor = layoutInfo.editor(),
          $dropzone = layoutInfo.dropzone(),
          $dropzoneMessage = $dropzone.find('.note-dropzone-message');

      // show dropzone on dragenter when dragging a object to document
      // -but only if the editor is visible, i.e. has a positive width and height
      $document.on('dragenter', function(e) {
        var isCodeview = handler.invoke('codeview.isActivated', layoutInfo);
        var hasEditorSize = $editor.width() > 0 && $editor.height() > 0;
        if (!isCodeview && !collection.length && hasEditorSize) {
          $editor.addClass('dragover');
          $dropzone.width($editor.width());
          $dropzone.height($editor.height());
          $dropzoneMessage.text(options.langInfo.image.dragImageHere);
        }
        collection = collection.add(e.target);
      }).on('dragleave', function(e) {
        collection = collection.not(e.target);
        if (!collection.length) {
          $editor.removeClass('dragover');
        }
      }).on('drop', function() {
        collection = $();
        $editor.removeClass('dragover');
      });

      // change dropzone's message on hover.
      $dropzone.on('dragenter', function() {
        $dropzone.addClass('hover');
        $dropzoneMessage.text(options.langInfo.image.dropImage);
      }).on('dragleave', function() {
        $dropzone.removeClass('hover');
        $dropzoneMessage.text(options.langInfo.image.dragImageHere);
      });

      // attach dropImage
      $dropzone.on('drop', function(event) {

        var dataTransfer = event.originalEvent.dataTransfer;
        var layoutInfo = dom.makeLayoutInfo(event.currentTarget || event.target);

        if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {
          event.preventDefault();
          layoutInfo.editable().focus();
          handler.insertImages(layoutInfo, dataTransfer.files);
        } else {
          var insertNodefunc = function() {
            layoutInfo.holder().materialnote('insertNode', this);
          };

          for (var i = 0, len = dataTransfer.types.length; i < len; i++) {
            var type = dataTransfer.types[i];
            var content = dataTransfer.getData(type);

            if (type.toLowerCase().indexOf('text') > -1) {
              layoutInfo.holder().materialnote('pasteHTML', content);
            } else {
              $(content).each(insertNodefunc);
            }
          }
        }
      }).on('dragover', false); // prevent default dragover event
    };
  };

  var Clipboard = function(handler) {

    var $paste;

    this.attach = function(layoutInfo) {

      if (window.clipboardData || agent.isFF) {
        $paste = $('<div />').attr('contenteditable', true).css({
          position : 'absolute',
          left : -100000,
          'opacity' : 0
        });
        layoutInfo.editable().after($paste);
        $paste.one('paste', hPasteClipboardImage);

        layoutInfo.editable().on('keydown', function(e) {
          if (e.ctrlKey && e.keyCode === 86) {  // CTRL+V
            handler.invoke('saveRange', layoutInfo.editable());
            if ($paste) {
              $paste.focus();
            }
          }
        });
      }

      layoutInfo.editable().on('paste', hPasteClipboardImage);
    };

    /**
     * paste clipboard image
     *
     * @param {Event} event
     */
    var hPasteClipboardImage = function(event) {

      var clipboardData = event.originalEvent.clipboardData;
      var layoutInfo = dom.makeLayoutInfo(event.currentTarget || event.target);
      var $editable = layoutInfo.editable();

      if (!clipboardData || !clipboardData.items || !clipboardData.items.length) {

        var callbacks = $editable.data('callbacks');
        // only can run if it has onImageUpload method
        if (!callbacks.onImageUpload) {
          return;
        }

        setTimeout(function() {
          if (!$paste) {
            return;
          }

          var imgNode = $paste[0].firstChild;
          if (!imgNode) {
            return;
          }

          handler.invoke('restoreRange', $editable);
          if (!dom.isImg(imgNode)) {
            handler.invoke('pasteHTML', $editable, $paste.html());
          } else {
            var datauri = imgNode.src;

            var data = atob(datauri.split(',')[1]);
            var array = new Uint8Array(data.length);
            for (var i = 0; i < data.length; i++) {
              array[i] = data.charCodeAt(i);
            }

            var blob = new Blob([array], { type : 'image/png' });
            blob.name = 'clipboard.png';
            handler.invoke('focus', $editable);
            handler.insertImages(layoutInfo, [blob]);
          }

          $paste.remove();

        }, 0);

        return;
      }

      var item = list.head(clipboardData.items);
      var isClipboardImage = item.kind === 'file' && item.type.indexOf('image/') !== -1;

      if (isClipboardImage) {
        handler.insertImages(layoutInfo, [item.getAsFile()]);
      }

      handler.invoke('editor.afterCommand', $editable);
    };
  };

  var LinkDialog = function(handler) {

    /**
     * toggle button status
     *
     * @private
     * @param {jQuery} $btn
     * @param {Boolean} isEnable
     */
    var toggleBtn = function($btn, isEnable) {
      $btn.toggleClass('disabled', !isEnable);
      $btn.attr('disabled', !isEnable);
    };

    /**
     * bind enter key
     *
     * @private
     * @param {jQuery} $input
     * @param {jQuery} $btn
     */
    var bindEnterKey = function($input, $btn) {
      $input.on('keypress', function(event) {
        if (event.keyCode === key.code.ENTER) {
          $btn.trigger('click');
        }
      });
    };

    /**
     * Show link dialog and set event handlers on dialog controls.
     *
     * @param {jQuery} $editable
     * @param {jQuery} $dialog
     * @param {Object} linkInfo
     * @return {Promise}
     */
    this.showLinkDialog = function($editable, $dialog, linkInfo) {
      return $.Deferred(function(deferred) {
        var $linkDialog = $dialog.find('.note-link-dialog');
        var $linkText = $linkDialog.find('.note-link-text'),
            $linkTextLabel = $linkText.next('label'),
            $linkUrl = $linkDialog.find('.note-link-url'),
            $linkBtn = $linkDialog.find('.note-link-btn'),
            $closeBtn = $linkDialog.find('.btnClose');
        var $openInNewWindow = $linkDialog.find('input[type=checkbox]');

        $linkDialog.openModal();
        $linkText.val(linkInfo.text);
        if (linkInfo.text.length > 0) $linkTextLabel.addClass('active');

        $linkText.on('keyup', function() {
          toggleBtn($linkBtn, $linkText.val() && $linkUrl.val());
          // if linktext was modified by keyup,
          // stop cloning text from linkUrl
          linkInfo.text = $linkText.val();
        });

        $closeBtn.click(function(event) {
          event.preventDefault();

          $linkDialog.closeModal();
        });

        // if no url was given, copy text to url
        if (!linkInfo.url) {
          linkInfo.url = linkInfo.text || 'http://';
          toggleBtn($linkBtn, linkInfo.text);
        }

        $linkUrl.on('keyup', function() {
          toggleBtn($linkBtn, $linkText.val() && $linkUrl.val());
          // display same link on `Text to display` input
          // when create a new link
          if (!linkInfo.text) {
            $linkTextLabel.addClass('active');
            $linkText.val($linkUrl.val());
          }
        }).val(linkInfo.url).trigger('focus').trigger('select');

        bindEnterKey($linkUrl, $linkBtn);
        bindEnterKey($linkText, $linkBtn);

        $openInNewWindow.prop('checked', linkInfo.newWindow);

        $linkBtn.one('click', function(event) {
          event.preventDefault();

          deferred.resolve({
            range: linkInfo.range,
            url: $linkUrl.val(),
            text: $linkText.val(),
            newWindow: $openInNewWindow.is(':checked')
          });

          $('.note-link-text').val('');
          $('.note-link-text').next('label').removeClass('active');
          $('.note-link-url').val('');
          $linkDialog.closeModal();
        });
      }).promise();
    };

    /**
     * @param {Object} layoutInfo
     */
    this.show = function(layoutInfo) {
      var $editor = layoutInfo.editor(),
          $dialog = layoutInfo.dialog(),
          $editable = layoutInfo.editable(),
          $popover = layoutInfo.popover(),
          linkInfo = handler.invoke('editor.getLinkInfo', $editable);

      var options = $editor.data('options');

      handler.invoke('editor.saveRange', $editable);
      this.showLinkDialog($editable, $dialog, linkInfo).then(function(linkInfo) {
        handler.invoke('editor.restoreRange', $editable);
        handler.invoke('editor.createLink', $editable, linkInfo, options);
        // hide popover after creating link
        handler.invoke('popover.hide', $popover);
      }).fail(function() {
        handler.invoke('editor.restoreRange', $editable);
      });
    };
  };

  var ImageDialog = function(handler) {
    /**
     * toggle button status
     *
     * @private
     * @param {jQuery} $btn
     * @param {Boolean} isEnable
     */
    var toggleBtn = function($btn, isEnable) {
      $btn.toggleClass('disabled', !isEnable);
      $btn.attr('disabled', !isEnable);
    };

    /**
     * bind enter key
     *
     * @private
     * @param {jQuery} $input
     * @param {jQuery} $btn
     */
    var bindEnterKey = function($input, $btn) {
      $input.on('keypress', function(event) {
        if (event.keyCode === key.code.ENTER) {
          $btn.trigger('click');
        }
      });
    };

    this.show = function(layoutInfo) {
      var $dialog = layoutInfo.dialog(),
          $editable = layoutInfo.editable();

      handler.invoke('editor.saveRange', $editable);
      this.showImageDialog($editable, $dialog).then(function(data) {
        handler.invoke('editor.restoreRange', $editable);

        if (typeof data === 'string') {
          // image url
          handler.invoke('editor.insertImage', $editable, data);
        } else {
          // array of files
          handler.insertImages(layoutInfo, data);
        }
      }).fail(function() {
        handler.invoke('editor.restoreRange', $editable);
      });
    };

    /**
     * show image dialog
     *
     * @param {jQuery} $editable
     * @param {jQuery} $dialog
     * @return {Promise}
     */
    this.showImageDialog = function($editable, $dialog) {
      return $.Deferred(function(deferred) {
        var $imageDialog = $dialog.find('.note-image-dialog');
        var $imageInput = $dialog.find('.note-image-input'),
            $imageUrl = $dialog.find('.note-image-url'),
            $imageBtn = $dialog.find('.note-image-btn'),
            $closeBtn = $imageDialog.find('.btnClose');

        $imageDialog.openModal();
        // Cloning imageInput to clear element.
        $imageInput.replaceWith($imageInput.clone()
            .on('change', function() {
              deferred.resolve(this.files || this.value);
              $imageUrl.val('');
              $imageDialog.closeModal();
              deferred.resolve();
            })
            .val('')
        );

        $imageBtn.click(function(event) {
          event.preventDefault();

          deferred.resolve($imageUrl.val());
          $imageUrl.val('');
          $imageDialog.closeModal();
          deferred.resolve();
        });

        $closeBtn.click(function(event) {
          event.preventDefault();

          $imageDialog.closeModal();
        });

        $imageUrl.on('keyup paste', function(event) {
          var url;

          if (event.type === 'paste') {
            url = event.originalEvent.clipboardData.getData('text');
          } else {
            url = $imageUrl.val();
          }
          toggleBtn($imageBtn, url);
        });

        bindEnterKey($imageUrl, $imageBtn);
      });
    };
  };

  var HelpDialog = function(handler) {
    /**
     * show help dialog
     *
     * @param {jQuery} $editable
     * @param {jQuery} $dialog
     * @return {Promise}
     */
    this.showHelpDialog = function($editable, $dialog) {
      return $.Deferred(function(deferred) {
        var $helpDialog = $dialog.find('.note-help-dialog');

        $helpDialog.openModal();
        deferred.resolve();
      }).promise();
    };

    /**
     * @param {Object} layoutInfo
     */
    this.show = function(layoutInfo) {
      var $dialog = layoutInfo.dialog(),
          $editable = layoutInfo.editable();

      handler.invoke('editor.saveRange', $editable, true);
      this.showHelpDialog($editable, $dialog).then(function() {
        handler.invoke('editor.restoreRange', $editable);
      });
    };
  };


  /**
   * @class EventHandler
   *
   * EventHandler
   *  - TODO: new instance per a editor
   */
  var EventHandler = function() {
    /**
     * Modules
     */
    var modules = this.modules = {
      editor: new Editor(this),
      toolbar: new Toolbar(this),
      statusbar: new Statusbar(this),
      popover: new Popover(this),
      handle: new Handle(this),
      fullscreen: new Fullscreen(this),
      codeview: new Codeview(this),
      dragAndDrop: new DragAndDrop(this),
      clipboard: new Clipboard(this),
      linkDialog: new LinkDialog(this),
      imageDialog: new ImageDialog(this),
      helpDialog: new HelpDialog(this)
    };

    /**
     * invoke module's method
     *
     * @param {String} moduleAndMethod - ex) 'editor.redo'
     * @param {...*} arguments - arguments of method
     * @return {*}
     */
    this.invoke = function() {
      var moduleAndMethod = list.head(list.from(arguments));
      var args = list.tail(list.from(arguments));

      var splits = moduleAndMethod.split('.');
      var hasSeparator = splits.length > 1;
      var moduleName = hasSeparator && list.head(splits);
      var methodName = hasSeparator ? list.last(splits) : list.head(splits);

      var module = this.getModule(moduleName);
      var method = module[methodName];

      return method && method.apply(module, args);
    };

    /**
     * returns module
     *
     * @param {String} moduleName - name of module
     * @return {Module} - defaults is editor
     */
    this.getModule = function(moduleName) {
      return this.modules[moduleName] || this.modules.editor;
    };

    /**
     * @param {jQuery} $holder
     * @param {Object} callbacks
     * @param {String} eventNamespace
     * @returns {Function}
     */
    var bindCustomEvent = this.bindCustomEvent = function($holder, callbacks, eventNamespace) {
      return function() {
        var callback = callbacks[func.namespaceToCamel(eventNamespace, 'on')];
        if (callback) {
          callback.apply($holder[0], arguments);
        }
        return $holder.trigger('materialnote.' + eventNamespace, arguments);
      };
    };

    /**
     * insert Images from file array.
     *
     * @private
     * @param {Object} layoutInfo
     * @param {File[]} files
     */
    this.insertImages = function(layoutInfo, files) {
      var $editor = layoutInfo.editor(),
          $editable = layoutInfo.editable(),
          $holder = layoutInfo.holder();

      var callbacks = $editable.data('callbacks');
      var options = $editor.data('options');

      // If onImageUpload options setted
      if (callbacks.onImageUpload) {
        bindCustomEvent($holder, callbacks, 'image.upload')(files);
      // else insert Image as dataURL
      } else {
        $.each(files, function(idx, file) {
          var filename = file.name;
          if (options.maximumImageFileSize && options.maximumImageFileSize < file.size) {
            bindCustomEvent($holder, callbacks, 'image.upload.error')(options.langInfo.image.maximumFileSizeError);
          } else {
            async.readFileAsDataURL(file).then(function(sDataURL) {
              modules.editor.insertImage($editable, sDataURL, filename);
            }).fail(function() {
              bindCustomEvent($holder, callbacks, 'image.upload.error')(options.langInfo.image.maximumFileSizeError);
            });
          }
        });
      }
    };

    var commands = {
      /**
       * @param {Object} layoutInfo
       */
      showLinkDialog: function(layoutInfo) {
        modules.linkDialog.show(layoutInfo);
      },

      /**
       * @param {Object} layoutInfo
       */
      showImageDialog: function(layoutInfo) {
        modules.imageDialog.show(layoutInfo);
      },

      /**
       * @param {Object} layoutInfo
       */
      showHelpDialog: function(layoutInfo) {
        modules.helpDialog.show(layoutInfo);
      },

      /**
       * @param {Object} layoutInfo
       */
      fullscreen: function(layoutInfo) {
        modules.fullscreen.toggle(layoutInfo);
      },

      /**
       * @param {Object} layoutInfo
       */
      codeview: function(layoutInfo) {
        modules.codeview.toggle(layoutInfo);
      }
    };

    var hMousedown = function(event) {
      //preventDefault Selection for FF, IE8+
      if (dom.isImg(event.target)) {
        event.preventDefault();
      }
    };

    var hKeyupAndMouseup = function(event) {
      var layoutInfo = dom.makeLayoutInfo(event.currentTarget || event.target);
      modules.editor.removeBogus(layoutInfo.editable());
      hToolbarAndPopoverUpdate(event);
    };

    var hToolbarAndPopoverUpdate = function(event) {
      // delay for range after mouseup
      setTimeout(function() {
        var layoutInfo = dom.makeLayoutInfo(event.currentTarget || event.target);
        var styleInfo = modules.editor.currentStyle(event.target);
        if (!styleInfo) { return; }

        var isAirMode = layoutInfo.editor().data('options').airMode;
        if (!isAirMode) {
          modules.toolbar.update(layoutInfo.toolbar(), styleInfo);
        }

        modules.popover.update(layoutInfo.popover(), styleInfo, isAirMode);
        modules.handle.update(layoutInfo.handle(), styleInfo, isAirMode);
      }, 0);
    };

    var hScroll = function(event) {
      var layoutInfo = dom.makeLayoutInfo(event.currentTarget || event.target);
      //hide popover and handle when scrolled
      modules.popover.hide(layoutInfo.popover());
      modules.handle.hide(layoutInfo.handle());
    };

    var hToolbarAndPopoverMousedown = function(event) {
      // prevent default event when insertTable (FF, Webkit)
      var $btn = $(event.target).closest('[data-event]');
      if ($btn.length) {
        event.preventDefault();
      }
    };

    var hToolbarAndPopoverClick = function(event) {
      var $btn = $(event.target).closest('[data-event]');

      if ($btn.length) {
        var eventName = $btn.attr('data-event'),
            value = $btn.attr('data-value'),
            hide = $btn.attr('data-hide');

        var layoutInfo = dom.makeLayoutInfo(event.target);

        // before command: detect control selection element($target)
        var $target;
        if ($.inArray(eventName, ['resize', 'floatMe', 'removeMedia', 'imageShape', 'imageClass']) !== -1) {
          var $selection = layoutInfo.handle().find('.note-control-selection');
          $target = $($selection.data('target'));
        }

        // If requested, hide the popover when the button is clicked.
        // Useful for things like showHelpDialog.
        if (hide) {
          $btn.parents('.popover').hide();
        }

        if ($.isFunction($.materialnote.pluginEvents[eventName])) {
          $.materialnote.pluginEvents[eventName](event, modules.editor, layoutInfo, value);
        } else if (modules.editor[eventName]) { // on command
          var $editable = layoutInfo.editable();
          $editable.focus();
          modules.editor[eventName]($editable, value, $target);
          event.preventDefault();
        } else if (commands[eventName]) {
          commands[eventName].call(this, layoutInfo);
          event.preventDefault();
        }

        // after command
        if ($.inArray(eventName, ['backColor', 'foreColor']) !== -1) {
          var options = layoutInfo.editor().data('options', options);
          var module = options.airMode ? modules.popover : modules.toolbar;
          module.updateRecentColor(list.head($btn), eventName, value);
        }

        hToolbarAndPopoverUpdate(event);
      }
    };

    var gridUnit = 26;
    var hDimensionPickerMove = function(event, options) {
        var $picker = $(event.target.parentNode); // target is mousecatcher
        var $dropdown = $picker.parent();
        var $dimensionDisplay = $picker.next();
        var $catcher = $picker.find('.note-dimension-picker-mousecatcher');
        var $highlighted = $picker.find('.note-dimension-picker-highlighted');
        var $unhighlighted = $picker.find('.note-dimension-picker-unhighlighted');
        var $hoverableOption = $dropdown.find("[id$='-hoverable']");
        var $borderedOption = $dropdown.find("[id$='-bordered']");
        var $stripedOption = $dropdown.find("[id$='-striped']");
        var $responsiveOption = $dropdown.find("[id$='-responsive']");

        var posOffset;
        // HTML5 with jQuery - e.offsetX is undefined in Firefox
        if (event.offsetX === undefined) {
            var posCatcher = $(event.target).offset();

            posOffset = {
                x: event.pageX - posCatcher.left,
                y: event.pageY - posCatcher.top
            };
        } else {
            posOffset = {
                x: event.offsetX,
                y: event.offsetY
            };
        }

        var dim = {
            c: Math.ceil(posOffset.x / gridUnit) || 1,
            r: Math.ceil(posOffset.y / gridUnit) || 1
        };
        /*console.log(posOffset);
        console.log(dim);
        console.log('------------------');*/

        var tableOptions = [];
            if ($hoverableOption.is(':checked')) tableOptions.push('hoverable');
            if ($borderedOption.is(':checked')) tableOptions.push('bordered');
            if ($stripedOption.is(':checked')) tableOptions.push('striped');
            if ($responsiveOption.is(':checked')) tableOptions.push('responsive-table');

        $highlighted.css({ width: (dim.c * gridUnit) + 'px', height: (dim.r * gridUnit) + 'px' });
        $catcher.attr('data-value', dim.c + 'x' + dim.r + 'x' + tableOptions.join('x'));

        //if (3 < dim.c && dim.c < options.insertTableMaxSize.col) {
            $unhighlighted.css({ width: (options.insertTableMaxSize * gridUnit) + 'px'});
        //}

        if (3 < dim.r && dim.r < options.insertTableMaxSize.row) {
            $unhighlighted.css({ height: ((dim.r + 1) * gridUnit) + 'px'});
        }

        $dimensionDisplay.html(dim.c + ' x ' + dim.r);
    };

    /**
     * bind KeyMap on keydown
     *
     * @param {Object} layoutInfo
     * @param {Object} keyMap
     */
    this.bindKeyMap = function(layoutInfo, keyMap) {
      var $editor = layoutInfo.editor();
      var $editable = layoutInfo.editable();

      $editable.on('keydown', function(event) {
        var keys = [];

        // modifier
        if (event.metaKey) { keys.push('CMD'); }
        if (event.ctrlKey && !event.altKey) { keys.push('CTRL'); }
        if (event.shiftKey) { keys.push('SHIFT'); }

        // keycode
        var keyName = key.nameFromCode[event.keyCode];
        if (keyName) {
          keys.push(keyName);
        }

        var pluginEvent;
        var keyString = keys.join('+');
        var eventName = keyMap[keyString];
        if (eventName) {
          // FIXME materialnote doesn't support event pipeline yet.
          //  - Plugin -> Base Code
          pluginEvent = $.materialnote.pluginEvents[keyString];
          if ($.isFunction(pluginEvent)) {
            if (pluginEvent(event, modules.editor, layoutInfo)) {
              return false;
            }
          }

          pluginEvent = $.materialnote.pluginEvents[eventName];

          if ($.isFunction(pluginEvent)) {
            pluginEvent(event, modules.editor, layoutInfo);
          } else if (modules.editor[eventName]) {
            modules.editor[eventName]($editable, $editor.data('options'));
            event.preventDefault();
          } else if (commands[eventName]) {
            commands[eventName].call(this, layoutInfo);
            event.preventDefault();
          }
        } else if (key.isEdit(event.keyCode)) {
          modules.editor.afterCommand($editable);
        }
      });
    };

    /**
     * attach eventhandler
     *
     * @param {Object} layoutInfo - layout Informations
     * @param {Object} options - user options include custom event handlers
     */
    this.attach = function(layoutInfo, options) {
      // handlers for editable
      if (options.shortcuts) {
        this.bindKeyMap(layoutInfo, options.keyMap[agent.isMac ? 'mac' : 'pc']);
      }
      layoutInfo.editable().on('mousedown', hMousedown);
      layoutInfo.editable().on('keyup mouseup', hKeyupAndMouseup);
      layoutInfo.editable().on('scroll', hScroll);

      // handler for clipboard
      modules.clipboard.attach(layoutInfo, options);

      // handler for handle and popover
      modules.handle.attach(layoutInfo, options);
      layoutInfo.popover().on('click', hToolbarAndPopoverClick);
      layoutInfo.popover().on('mousedown', hToolbarAndPopoverMousedown);

      // handler for drag and drop
      modules.dragAndDrop.attach(layoutInfo, options);

      // handlers for frame mode (toolbar, statusbar)
      if (!options.airMode) {
        // handler for toolbar
        layoutInfo.toolbar().on('click', hToolbarAndPopoverClick);
        layoutInfo.toolbar().on('mousedown', hToolbarAndPopoverMousedown);

        // handler for statusbar
        modules.statusbar.attach(layoutInfo, options);
      }

      // handler for table dimension
      var $catcherContainer = options.airMode ? layoutInfo.popover() :
                                                layoutInfo.toolbar();
      var $catcher = $catcherContainer.find('.note-dimension-picker-mousecatcher');
      $catcher.css({
        width: options.insertTableMaxSize.col * gridUnit + 'px',
        height: options.insertTableMaxSize.row * gridUnit + 'px'
      }).on('mousemove', function(event) {
        hDimensionPickerMove(event, options);
      });

      // save options on editor
      layoutInfo.editor().data('options', options);

      // ret styleWithCSS for backColor / foreColor clearing with 'inherit'.
      if (!agent.isMSIE) {
        // [workaround] for Firefox
        //  - protect FF Error: NS_ERROR_FAILURE: Failure
        setTimeout(function() {
          document.execCommand('styleWithCSS', 0, options.styleWithSpan);
        }, 0);
      }

      // History
      var history = new History(layoutInfo.editable());
      layoutInfo.editable().data('NoteHistory', history);

      // All editor status will be saved on editable with jquery's data
      // for support multiple editor with singleton object.
      layoutInfo.editable().data('callbacks', {
        onInit: options.onInit,
        onFocus: options.onFocus,
        onBlur: options.onBlur,
        onKeydown: options.onKeydown,
        onKeyup: options.onKeyup,
        onMousedown: options.onMousedown,
        onEnter: options.onEnter,
        onPaste: options.onPaste,
        onBeforeCommand: options.onBeforeCommand,
        onChange: options.onChange,
        onImageUpload: options.onImageUpload,
        onImageUploadError: options.onImageUploadError,
        onMediaDelete: options.onMediaDelete,
        onToolbarClick: options.onToolbarClick
      });

      // Textarea: auto filling the code before form submit.
      if (dom.isTextarea(list.head(layoutInfo.holder()))) {
        layoutInfo.holder().closest('form').submit(function() {
          layoutInfo.holder().val(layoutInfo.holder().code());
        });
      }
    };

    /**
     * attach jquery custom event
     *
     * @param {Object} layoutInfo - layout Informations
     */
    this.attachCustomEvent = function(layoutInfo, options) {
      var $holder = layoutInfo.holder();
      var $editable = layoutInfo.editable();
      var callbacks = $editable.data('callbacks');

      $editable.focus(bindCustomEvent($holder, callbacks, 'focus'));
      $editable.blur(bindCustomEvent($holder, callbacks, 'blur'));

      $editable.keydown(function(event) {
        if (event.keyCode === key.code.ENTER) {
          bindCustomEvent($holder, callbacks, 'enter').call(this, event);
        }
        bindCustomEvent($holder, callbacks, 'keydown').call(this, event);
      });
      $editable.keyup(bindCustomEvent($holder, callbacks, 'keyup'));

      $editable.on('mousedown', bindCustomEvent($holder, callbacks, 'mousedown'));
      $editable.on('mouseup', bindCustomEvent($holder, callbacks, 'mouseup'));
      $editable.on('scroll', bindCustomEvent($holder, callbacks, 'scroll'));

      $editable.on('paste', bindCustomEvent($holder, callbacks, 'paste'));

      // [workaround] for old IE - IE8 don't have input events
      //  - TODO check IE version
      var changeEventName = agent.isMSIE ? 'DOMCharacterDataModified DOMSubtreeModified DOMNodeInserted' : 'input';
      $editable.on(changeEventName, function() {
        bindCustomEvent($holder, callbacks, 'change')($editable.html(), $editable);
      });

      if (!options.airMode) {
        layoutInfo.toolbar().click(bindCustomEvent($holder, callbacks, 'toolbar.click'));
        layoutInfo.popover().click(bindCustomEvent($holder, callbacks, 'popover.click'));
      }

      // Textarea: auto filling the code before form submit.
      if (dom.isTextarea(list.head($holder))) {
        $holder.closest('form').submit(function(e) {
          bindCustomEvent($holder, callbacks, 'submit').call(this, e, $holder.code());
        });
      }

      // fire init event
      bindCustomEvent($holder, callbacks, 'init')(layoutInfo);

      // fire plugin init event
      for (var i = 0, len = $.materialnote.plugins.length; i < len; i++) {
        if ($.isFunction($.materialnote.plugins[i].init)) {
          $.materialnote.plugins[i].init(layoutInfo);
        }
      }
    };

    this.detach = function(layoutInfo, options) {
      layoutInfo.holder().off();
      layoutInfo.editable().off();

      layoutInfo.popover().off();
      layoutInfo.handle().off();
      layoutInfo.dialog().off();

      if (!options.airMode) {
        layoutInfo.dropzone().off();
        layoutInfo.toolbar().off();
        layoutInfo.statusbar().off();
      }
    };
  };

  /**
   * @class Renderer
   *
   * renderer
   *
   * rendering toolbar and editable
   */
  var Renderer = function() {

    /**
     * bootstrap button template
     * @private
     * @param {String} label button name
     * @param {Object} [options] button options
     * @param {String} [options.event] data-event
     * @param {String} [options.className] button's class name
     * @param {String} [options.value] data-value
     * @param {String} [options.title] button's title for popup
     * @param {String} [options.dropdown] dropdown html
     * @param {String} [options.hide] data-hide
     */

    // >>>>>>> CK altered
    var tplButton = function(label, options) {
      var event = options.event;
      var value = options.value;
      var title = options.title;
      var style = options.style;
      var btnClassName = options.btnClassName;
      var className = options.className;
      var dropdown = options.dropdown;
      var hide = options.hide;

      if (!dropdown) {
        var button = [
            '<div class="waves-effect waves-light btn',
            (className ? " " + className : '') + '"',
            (title ? ' title="' + title + '"' : ''),
            (style ? ' style="' + style + '"' : ''),
            (event ? ' data-event="' + event + '"' : ''),
            (value ? ' data-value=\'' + value + '\'' : ''),
            (hide ? ' data-hide=\'' + hide + '\'' : ''),
            ' tabindex="-1">' + label + '</div>'
        ].join('');

        return button;
      } else {
        var list = [
            '<div class="btn-group',
            (className ? " " + className : '') + '">',
            '<button class="waves-effect waves-light btn dropdown ' + (btnClassName ? btnClassName : '') + '"',
            (title ? ' title="' + title + '"' : ''),
            (event ? ' data-event="' + event + '"' : ''),
            (value ? ' data-value=\'' + value + '\'' : ''),
            (hide ? ' data-hide=\'' + hide + '\'' : ''),
            '><i class="material-icons left">arrow_drop_down</i>' + label + '</button>',
            dropdown,
            '</div>'
        ].join('');

        return list;
      }
    };

    /**
     * bootstrap icon button template
     * @private
     * @param {String} iconClassName
     * @param {Object} [options]
     * @param {String} [options.event]
     * @param {String} [options.value]
     * @param {String} [options.title]
     * @param {String} [options.dropdown]
     */
    // >>>>>>> CK
    var tplIconButton = function(iconClassName, options) {
      var label = '<i class="material-icons">' + iconClassName + '</i>';
      return tplButton(label, options);
    };

    /**
     * bootstrap popover template
     * @private
     * @param {String} className
     * @param {String} content
     */
    var tplPopover = function(className, content) {
      var $popover = $('<div class="' + className + ' popover bottom in" style="display: none;">' +
               '<div class="arrow"></div>' +
               '<div class="popover-content">' +
               '</div>' +
             '</div>');

      $popover.find('.popover-content').append(content);
      return $popover;
    };

    /**
     * bootstrap dialog template
     *
     * @param {String} className
     * @param {String} [title='']
     * @param {String} body
     * @param {String} [footer='']
     */
    // >>>>>>> CK dialog
    var tplDialog = function(className, title, body, footer) {

      var modal = [
          '<div class="' + className + ' modal modal-fixed-footer">',
              '<div class="modal-content">',
                  (title ? '<h4>' + title + '</h4>' : ''),
                  '<p>' + body + '</p>',
              '</div>',
              (footer ? '<div class="modal-footer">' + footer + '</div>' : ''),
          '</div>'
      ].join('');

      return modal;
    };

    var tplButtonInfo = {
      picture: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.image.image, {
          event: 'showImageDialog',
          title: lang.image.image,
          hide: true
        });
      },
      link: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.link.link, {
          event: 'showLinkDialog',
          title: lang.link.link,
          hide: true
        });
      },
      table: function(lang, options) {
        var dropdown = '<ul class="note-table dropdown-menu">' +
                            '<div class="row">' +
                                '<div class="col s6 preventDropClose"><input type="checkbox" id="' + materialUniqueId + '-bordered" checked="checked" /><label for="' + materialUniqueId + '-bordered">' + lang.table.bordered + '</label></div>' +
                                '<div class="col s6 preventDropClose"><input type="checkbox" id="' + materialUniqueId + '-striped" checked="checked" /><label for="' + materialUniqueId + '-striped">' + lang.table.striped + '</label></div>' +
                            '</div>' +
                            '<div class="row">' +
                                '<div class="col s6 preventDropClose"><input type="checkbox" id="' + materialUniqueId + '-hoverable" checked="checked" /><label for="' + materialUniqueId + '-hoverable">' + lang.table.hoverable + '</label></div>' +
                                '<div class="col s6 preventDropClose"><input type="checkbox" id="' + materialUniqueId + '-responsive" checked="checked" /><label for="' + materialUniqueId + '-responsive">' + lang.table.responsive + '</label></div>' +
                            '</div>' +
                            '<div class="note-dimension-picker">' +
                                '<div class="note-dimension-picker-mousecatcher" data-event="insertTable" data-value="1x1"></div>' +
                                '<div class="note-dimension-picker-highlighted"></div>' +
                                '<div class="note-dimension-picker-unhighlighted"></div>' +
                            '</div>' +
                            '<div class="note-dimension-display"> 1 x 1 </div>' +
                       '</ul>';
        return tplIconButton(options.iconPrefix + options.icons.table.table, {
            title: lang.table.table,
            dropdown: dropdown
        });
      },
        style: function(lang, options) {
            var items = options.styleTags.reduce(function(memo, v) {
            var label = lang.style[v === 'p' ? 'normal' : v];
            
            return memo + '<li><div data-event="formatBlock" data-value="' + v + '">' +
                        ((v === 'p' || v === 'pre') ? label : '<' + v + '>' + label + '</' + v + '>') +
                    '</div></li>';
        }, '');

        return tplIconButton(options.iconPrefix + options.icons.style.style, {
          title: lang.style.style,
          dropdown: '<ul class="dropdown-menu largeDropdown">' + items + '</ul>'
        });
      },
      fontname: function(lang, options) {
        var realFontList = [];
        var items = options.fontNames.reduce(function(memo, v) {
          if (!agent.isFontInstalled(v) && options.fontNamesIgnoreCheck.indexOf(v) === -1) {
            return memo;
          }
          realFontList.push(v);
          return memo + '<li><div data-event="fontName" href="#" data-value="' + v + '" style="font-family:\'' + v + '\'">' +
                        '<i class="material-icons tiny transparent">' + options.iconPrefix + options.icons.misc.check + '</i> ' + v + '</div></li>';
        }, '');

        var hasDefaultFont = agent.isFontInstalled(options.defaultFontName);
        var defaultFontName = (hasDefaultFont) ? options.defaultFontName : realFontList[0];
        var label = '<div class="note-current-fontname">' + defaultFontName + '</div>';

        return tplButton(label, {
          title: lang.font.name,
          className: 'note-fontname',
          dropdown: '<ul class="dropdown-menu note-check">' + items + '</ul>'
        });
      },
      fontsize: function(lang, options) {
        var items = options.fontSizes.reduce(function(memo, v) {
          return memo + '<li><div data-event="fontSize" href="#" data-value="' + v + '">' +
                          '<i class="material-icons tiny transparent">' + options.iconPrefix + options.icons.misc.check + '</i> ' + v +
                        '</div></li>';
        }, '');

        var label = '<span class="note-current-fontsize">15</span>';
        return tplButton(label, {
          title: lang.font.size,
          className: 'note-fontsize',
          dropdown: '<ul class="dropdown-menu note-check">' + items + '</ul>'
        });
      },
      color: function(lang, options) {
        // >>>>>>> CK
        var colorButtonLabel = '<i class="material-icons">' + options.icons.color.recent + '</i>',
          colorButton = tplButton(colorButtonLabel, {
          className: 'note-recent-color',
          title: lang.color.recent,
          style: "color: " + options.defaultTextColor + "; background-color: " + options.defaultBackColor + ";",
          event: 'color',
          value: '{"backColor": "' + options.defaultBackColor + '"}'
        });

        var dropdown = '<ul id="colors" class="dropdown-menu">' +
                            '<li>' +
                                '<div class="col s12">' +
                                    '<ul class="tabs">' +
                                        '<li class="tab"><a href="#' + materialUniqueId + '-foreColor" class="active">' + lang.color.foreground + '</a></li>' +
                                        '<li class="tab"><a href="#' + materialUniqueId + '-backColor">' + lang.color.background + '</a></li>' +
                                    '</ul>' +
                                '</div>' +
                                '<div class="col s12 colorTable">' +
                                    '<div id="' + materialUniqueId + '-foreColor">' +
                                        '<div class="note-color-reset waves-effect waves-light btn" data-event="foreColor" data-value="' + options.defaultTextColor + '" title="' + lang.color.reset + '">' +
                                            lang.color.resetToDefault +
                                        '</div>' +
                                        '<div class="colorName"></div>' +
                                        '<div class="note-color-palette" data-target-event="foreColor"></div>' +
                                    '</div>' +
                                    '<div id="' + materialUniqueId + '-backColor">' +
                                        '<div class="note-color-reset waves-effect waves-light btn" data-event="backColor"' + ' data-value="' + options.defaultBackColor + '" title="' + lang.color.transparent + '">' +
                                            lang.color.setTransparent +
                                        '</div>' +
                                        '<div class="colorName"></div>' +
                                        '<div class="note-color-palette" data-target-event="backColor"></div>' +
                                    '</div>' +
                                '</div>' +
                            '</li>' +
                       '</ul>';

        var moreButton = tplButton('', {
          title: lang.color.more,
          className: 'closeLeft',
          dropdown: dropdown
        });

        return moreButton + colorButton;
      },
      bold: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.font.bold, {
          event: 'bold',
          title: lang.font.bold
        });
      },
      italic: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.font.italic, {
          event: 'italic',
          title: lang.font.italic
        });
      },
      underline: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.font.underline, {
          event: 'underline',
          title: lang.font.underline
        });
      },
      strikethrough: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.font.strikethrough, {
          event: 'strikethrough',
          title: lang.font.strikethrough
        });
      },
      superscript: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.font.superscript, {
          event: 'superscript',
          title: lang.font.superscript
        });
      },
      subscript: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.font.subscript, {
          event: 'subscript',
          title: lang.font.subscript
        });
      },
      clear: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.font.clear, {
          event: 'removeFormat',
          title: lang.font.clear
        });
      },
      ul: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.lists.unordered, {
          event: 'insertUnorderedList',
          title: lang.lists.unordered
        });
      },
      ol: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.lists.ordered, {
          event: 'insertOrderedList',
          title: lang.lists.ordered
        });
      },
      //>>>>>>> CK paragraph single buttons
      leftButton: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.paragraph.left, {
          title: lang.paragraph.left,
          event: 'justifyLeft'
        });
      },
      centerButton: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.paragraph.center, {
          title: lang.paragraph.center,
          event: 'justifyCenter'
        });
      },
      rightButton: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.paragraph.right, {
          title: lang.paragraph.right,
          event: 'justifyRight'
        });
      },
      justifyButton: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.paragraph.justify, {
          title: lang.paragraph.justify,
          event: 'justifyFull'
        });
      },
      outdentButton: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.paragraph.outdent, {
          title: lang.paragraph.outdent,
          event: 'outdent'
        });
      },
      indentButton: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.paragraph.indent, {
          title: lang.paragraph.indent,
          event: 'indent'
        });
      },

      paragraph: function(lang, options) {
        var leftButton = tplIconButton(options.iconPrefix + options.icons.paragraph.left, {
          title: lang.paragraph.left,
          event: 'justifyLeft'
        });
        var centerButton = tplIconButton(options.iconPrefix + options.icons.paragraph.center, {
          title: lang.paragraph.center,
          event: 'justifyCenter'
        });
        var rightButton = tplIconButton(options.iconPrefix + options.icons.paragraph.right, {
          title: lang.paragraph.right,
          event: 'justifyRight'
        });
        var justifyButton = tplIconButton(options.iconPrefix + options.icons.paragraph.justify, {
          title: lang.paragraph.justify,
          event: 'justifyFull'
        });

        var outdentButton = tplIconButton(options.iconPrefix + options.icons.paragraph.outdent, {
          title: lang.paragraph.outdent,
          event: 'outdent'
        });
        var indentButton = tplIconButton(options.iconPrefix + options.icons.paragraph.indent, {
          title: lang.paragraph.indent,
          event: 'indent'
        });

        var dropdown = '<ul class="dropdown-menu">' +
                         '<div class="note-align btn-group">' +
                           leftButton + centerButton + rightButton + justifyButton +
                         '</div>' +
                         '<div class="note-list btn-group">' +
                           indentButton + outdentButton +
                         '</div>' +
                       '</ul>';

        return tplIconButton(options.iconPrefix + options.icons.paragraph.paragraph, {
          title: lang.paragraph.paragraph,
          dropdown: dropdown
        });
      },
      lineheight: function(lang, options) {
        var items = options.lineHeights.reduce(function(memo, v) {
          return memo + '<li><div data-event="lineHeight" href="#" data-value="' + parseFloat(v) + '">' +
                          '<i class="material-icons tiny transparent">' + options.iconPrefix + options.icons.misc.check + '</i> ' + v +
                        '</div></li>';
        }, '');

        return tplIconButton(options.iconPrefix + options.icons.font.height, {
          title: lang.font.height,
          className: 'note-height',
          dropdown: '<ul class="dropdown-menu note-check">' + items + '</ul>'
        });

      },
      help: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.options.help, {
          event: 'showHelpDialog',
          title: lang.options.help,
          hide: true
        });
      },
      fullscreen: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.options.fullscreen, {
          event: 'fullscreen',
          title: lang.options.fullscreen
        });
      },
      codeview: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.options.codeview, {
          event: 'codeview',
          title: lang.options.codeview
        });
      },
      undo: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.history.undo, {
          event: 'undo',
          title: lang.history.undo
        });
      },
      redo: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.history.redo, {
          event: 'redo',
          title: lang.history.redo
        });
      },
      hr: function(lang, options) {
        return tplIconButton(options.iconPrefix + options.icons.hr.insert, {
          event: 'insertHorizontalRule',
          title: lang.hr.insert
        });
      }
    };

    var tplPopovers = function(lang, options) {
      var tplLinkPopover = function() {
        var linkButton = tplIconButton(options.iconPrefix + options.icons.link.edit, {
          title: lang.link.edit,
          event: 'showLinkDialog',
          hide: true
        });
        var unlinkButton = tplIconButton(options.iconPrefix + options.icons.link.unlink, {
          title: lang.link.unlink,
          event: 'unlink'
        });
        var content = '<a href="http://www.google.com" target="_blank">www.google.com</a>&nbsp;&nbsp;' +
                      '<div class="note-insert btn-group">' +
                        linkButton + unlinkButton +
                      '</div>';
        return tplPopover('note-link-popover', content);
      };

      var tplImagePopover = function() {
        var fullButton = tplButton('<span class="note-fontsize-10">100%</span>', {
          title: lang.image.resizeFull,
          event: 'resize',
          value: '1'
        });
        var halfButton = tplButton('<span class="note-fontsize-10">50%</span>', {
          title: lang.image.resizeHalf,
          event: 'resize',
          value: '0.5'
        });
        var quarterButton = tplButton('<span class="note-fontsize-10">25%</span>', {
          title: lang.image.resizeQuarter,
          event: 'resize',
          value: '0.25'
        });

        var leftButton = tplIconButton(options.iconPrefix + options.icons.image.floatLeft, {
          title: lang.image.floatLeft,
          event: 'floatMe',
          value: 'left'
        });
        var rightButton = tplIconButton(options.iconPrefix + options.icons.image.floatRight, {
          title: lang.image.floatRight,
          event: 'floatMe',
          value: 'right'
        });
        var justifyButton = tplIconButton(options.iconPrefix + options.icons.image.floatNone, {
          title: lang.image.floatNone,
          event: 'floatMe',
          value: 'none'
        });

        var roundedButton = tplIconButton(options.iconPrefix + options.icons.image.shapeRounded, {
          title: lang.image.shapeRounded,
          event: 'imageClass',
          value: 'img-rounded'
        });
        var circleButton = tplIconButton(options.iconPrefix + options.icons.image.shapeCircle, {
          title: lang.image.shapeCircle,
          event: 'imageClass',
          value: 'img-circle'
        });
        var thumbnailButton = tplIconButton(options.iconPrefix + options.icons.image.shapeThumbnail, {
          title: lang.image.shapeThumbnail,
          event: 'imageClass',
          value: 'img-thumbnail'
        });
        var borderedButton = tplIconButton(options.iconPrefix + options.icons.image.bordered, {
          title: lang.image.bordered,
          event: 'imageClass',
          value: 'img-bordered'
        });
        var noneButton = tplIconButton(options.iconPrefix + options.icons.image.shapeNone, {
          title: lang.image.shapeNone,
          event: 'imageShape',
          value: ''
        });

        var removeButton = tplIconButton(options.iconPrefix + options.icons.image.remove, {
          title: lang.image.remove,
          event: 'removeMedia',
          value: 'none'
        });

        var content = //'<div class="btn-group">' + fullButton + halfButton + quarterButton + '</div>' +
                      '<div class="btn-group">' + leftButton + rightButton + justifyButton + '</div>' +
                      '<div class="btn-group">' + roundedButton + circleButton + thumbnailButton + borderedButton + noneButton + '</div>' +
                      '<div class="btn-group">' + removeButton + '</div>';
        return tplPopover('note-image-popover', content);
      };

      var tplAirPopover = function() {
        var $content = $('<div />');
        for (var idx = 0, len = options.airPopover.length; idx < len; idx ++) {
          var group = options.airPopover[idx];

          var $group = $('<div class="note-' + group[0] + ' btn-group">');
          for (var i = 0, lenGroup = group[1].length; i < lenGroup; i++) {
            var $button = $(tplButtonInfo[group[1][i]](lang, options));

            $button.attr('data-name', group[1][i]);

            $group.append($button);
          }
          $content.append($group);
        }

        return tplPopover('note-air-popover', $content.children());
      };

      var $notePopover = $('<div class="note-popover" />');

      $notePopover.append(tplLinkPopover());
      $notePopover.append(tplImagePopover());

      if (options.airMode) {
        $notePopover.append(tplAirPopover());
      }

      return $notePopover;
    };

    var tplHandles = function() {
      return '<div class="note-handle">' +
               '<div class="note-control-selection">' +
                 '<div class="note-control-selection-bg"></div>' +
                 '<div class="note-control-sizing note-control-se"></div>' +
                 '<div class="note-control-selection-info"></div>' +
               '</div>' +
             '</div>';
    };

    /**
     * shortcut table template
     * @param {String} title
     * @param {String} body
     */
    var tplShortcut = function(title, keys) {
      var keyClass = 'note-shortcut-col col-xs-6 note-shortcut-';
      var body = [];

      for (var i in keys) {
        if (keys.hasOwnProperty(i)) {
          body.push(
            '<tr><td>' + keys[i].kbd + '</td><td>' + keys[i].text + '</td></tr>'
          );
        }
      }

      return '<thead><tr><th>' + title + '</th><th>' + '(keys)' + '</th></tr></thead>' +
             '<tbody>' + body.join('') + '</tbody>';
    };

    var tplShortcutText = function(lang) {
      var keys = [
        { kbd: '⌘ + B', text: lang.font.bold },
        { kbd: '⌘ + I', text: lang.font.italic },
        { kbd: '⌘ + U', text: lang.font.underline },
        { kbd: '⌘ + \\', text: lang.font.clear }
      ];

      return tplShortcut(lang.shortcut.textFormatting, keys);
    };

    var tplShortcutAction = function(lang) {
      var keys = [
        { kbd: '⌘ + Z', text: lang.history.undo },
        { kbd: '⌘ + ⇧ + Z', text: lang.history.redo },
        { kbd: '⌘ + ]', text: lang.paragraph.indent },
        { kbd: '⌘ + [', text: lang.paragraph.outdent },
        { kbd: '⌘ + ENTER', text: lang.hr.insert }
      ];

      return tplShortcut(lang.shortcut.action, keys);
    };

    var tplShortcutPara = function(lang) {
      var keys = [
        { kbd: '⌘ + ⇧ + L', text: lang.paragraph.left },
        { kbd: '⌘ + ⇧ + E', text: lang.paragraph.center },
        { kbd: '⌘ + ⇧ + R', text: lang.paragraph.right },
        { kbd: '⌘ + ⇧ + J', text: lang.paragraph.justify },
        { kbd: '⌘ + ⇧ + NUM7', text: lang.lists.ordered },
        { kbd: '⌘ + ⇧ + NUM8', text: lang.lists.unordered }
      ];

      return tplShortcut(lang.shortcut.paragraphFormatting, keys);
    };

    var tplShortcutStyle = function(lang) {
      var keys = [
        { kbd: '⌘ + NUM0', text: lang.style.normal },
        { kbd: '⌘ + NUM1', text: lang.style.h1 },
        { kbd: '⌘ + NUM2', text: lang.style.h2 },
        { kbd: '⌘ + NUM3', text: lang.style.h3 },
        { kbd: '⌘ + NUM4', text: lang.style.h4 },
        { kbd: '⌘ + NUM5', text: lang.style.h5 },
        { kbd: '⌘ + NUM6', text: lang.style.h6 }
      ];

      return tplShortcut(lang.shortcut.documentStyle, keys);
    };

    var tplExtraShortcuts = function(lang, options) {
      var extraKeys = options.extraKeys;
      var keys = [];

      for (var key in extraKeys) {
        if (extraKeys.hasOwnProperty(key)) {
          keys.push({ kbd: key, text: extraKeys[key] });
        }
      }

      return tplShortcut(lang.shortcut.extraKeys, keys);
    };

    var tplShortcutTable = function(lang, options) {
      var template = [
          '<table class="striped hoverable">' + tplShortcutAction(lang, options) + '</table>',
          '<table class="striped hoverable">' + tplShortcutStyle(lang, options) + '</table>',
          '<table class="striped hoverable">' + tplShortcutText(lang, options) + '</table>',
          '<table class="striped hoverable">' + tplShortcutPara(lang, options) + '</table>'
      ].join('<br>');

      if (options.extraKeys) {
        //template.push('<table class="striped hoverable">' + tplExtraShortcuts(lang, options) + '</table>');
      }
      return template;
    };

    var replaceMacKeys = function(sHtml) {
      return sHtml.replace(/⌘/g, 'Ctrl').replace(/⇧/g, 'Shift');
    };

    var tplDialogInfo = {
      image: function(lang, options) {
        var imageLimitation = '';

        if (options.maximumImageFileSize) {
          var unit = Math.floor(Math.log(options.maximumImageFileSize) / Math.log(1024));
          var readableSize = (options.maximumImageFileSize / Math.pow(1024, unit)).toFixed(2) * 1 + ' ' + ' KMGTP'[unit] + 'B';

          imageLimitation = '<small>' + lang.image.maximumFileSize + ' : ' + readableSize + '</small>';
        }

        var body = '<div class="row">' +
                '<div class="col s12">' +
                    '<div class="file-field input-field">' +
                            '<div class="btn">' +
                                '<span>' + lang.image.image + '</span>' +
                                '<input class="note-image-input" name="files" type="file" />' +
                            '</div>' +
                        '<div class="file-path-wrapper">' +
                            '<input class="file-path" type="text" />' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="input-field col s12">' +
                    '<input class="note-image-url" type="text" />' +
                    '<label>' + lang.image.url + '</label>' +
                '</div>' +
            '</div>';

        var footer = '<button href="#" class="waves-effect waves-light btn note-image-btn disabled" disabled>' + lang.image.insert + '</button>' +
                     '<button class="waves-effect waves-light btn btnClose">' + lang.shortcut.close + '</button>';
        return tplDialog('note-image-dialog', lang.image.insert, body, footer);
      },

      link: function(lang, options) {
        var body = '<div class="row">' +
                '<div class="input-field col s12">' +
                    '<input class="note-link-text" type="text" />' +
                    '<label>' + lang.link.textToDisplay + '</label>' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="input-field col s12">' +
                    '<input class="note-link-url" type="text" value="http://" />' +
                    '<label class="active">' + lang.link.url + '</label>' +
                '</div>' +
            '</div>' +
            (!options.disableLinkTarget ?
            '<div class="row">' +
                '<div class="col s12">' +
                    '<input type="checkbox" id="' + materialUniqueId + '-noteInsertLinkNewWindow" checked="checked" />' +
                    '<label for="' + materialUniqueId + '-noteInsertLinkNewWindow">' + lang.link.openInNewWindow + '</label>' +
                '</div>' +
            '</div>'
            : ''
            );

        var footer = '<button href="#" class="waves-effect waves-light btn note-link-btn disabled" disabled>' + lang.link.insert + '</button>' +
                     '<button class="waves-effect waves-light btn btnClose">' + lang.shortcut.close + '</button>';
        return tplDialog('note-link-dialog', lang.link.insert, body, footer);
      },

      help: function(lang, options) {
        var body = (agent.isMac ? tplShortcutTable(lang, options) : replaceMacKeys(tplShortcutTable(lang, options)));
        var footer = '<button href="#" class="waves-effect waves-light btn modal-close">' + lang.shortcut.close + '</button>';

        return tplDialog('note-help-dialog', lang.shortcut.shortcuts, body, footer);
      }
    };

    var tplDialogs = function(lang, options) {
      var dialogs = '';

      $.each(tplDialogInfo, function(idx, tplDialog) {
        dialogs += tplDialog(lang, options);
      });

      return '<div class="note-dialog">' + dialogs + '</div>';
    };

    var tplStatusbar = function() {
      return '<div class="note-resizebar">' +
               '<div class="note-icon-bar"></div>' +
               '<div class="note-icon-bar"></div>' +
               '<div class="note-icon-bar"></div>' +
             '</div>';
    };

    var representShortcut = function(str) {
      if (agent.isMac) {
        str = str.replace('CMD', '⌘').replace('SHIFT', '⇧');
      }

      return str.replace('BACKSLASH', '\\')
                .replace('SLASH', '/')
                .replace('LEFTBRACKET', '[')
                .replace('RIGHTBRACKET', ']');
    };

    /**
     * createTooltip
     * @param {jQuery} $container
     * @param {Object} keyMap
     * @param {String} [sPlacement]
     */
    // >>>>>>> CK
    var createTooltip = function($container, keyMap, sPlacement) {
      $(window).load(function() {
        var invertedKeyMap = func.invertObject(keyMap);
        var $buttons = $container.find('.btn');

        $buttons.each(function(i, elBtn) {
          var $btn = $(elBtn);
          var sShortcut = invertedKeyMap[$btn.data('event')];
          var text = $btn.attr('title');

          if (sShortcut) {
            $btn.attr('data-tooltip', function(i, v) {
              text = text + ' (' + representShortcut(sShortcut) + ')';

              $(this).removeAttr('title');
              return text;
            });
          }
          $btn.attr('data-position', 'bottom');
          $btn.attr('data-tooltip', text);
          $btn.removeAttr('title');
        }).ckTooltip({
          container: $container,
          position: 'top',
          delay: 30
        });
      });
    };

    // >>>>>>> CK
    // createPalette
    var createPalette = function($container, options) {
      var colorInfo = options.colors;
      var colorTitles = options.colorTitles;

      $container.find('.note-color-palette').each(function() {
        var $palette = $(this), eventName = $palette.attr('data-target-event');
        var paletteContents = [];

        for (var row = 0, lenRow = colorInfo.length; row < lenRow; row++) {
          var colors = colorInfo[row];
          var titles = colorTitles[row];
          var buttons = [];

          for (var col = 0, lenCol = colors.length; col < lenCol; col++) {
            var color = colors[col];
            var title = titles[col];

            buttons.push(['<button type="button" class="note-color-btn" style="background-color:', color,
                   ';" data-event="', eventName,
                   '" data-value="', color,
                   '" data-description="', title,
                   '" data-toggle="button" tabindex="-1"></button>'].join(''));
          }
          paletteContents.push('<div class="note-color-row">' + buttons.join('') + '</div>');
        }
        $palette.html(paletteContents.join(''));

        $palette.find('button').mouseenter(function() {
          $palette.siblings('.colorName').html($(this).data('description'));
        });
        $palette.mouseleave(function() {
          $(this).siblings('.colorName').html('');
        });
      });
    };

    /**
     * create materialnote layout (air mode)
     *
     * @param {jQuery} $holder
     * @param {Object} options
     */
    this.createLayoutByAirMode = function($holder, options) {
      var langInfo = options.langInfo;
      var keyMap = options.keyMap[agent.isMac ? 'mac' : 'pc'];
      var id = func.uniqueId();

      $holder.addClass('note-air-editor note-editable');
      $holder.attr({
        'id': 'note-editor-' + id,
        'contentEditable': true
      });

      var body = document.body;

      // create Popover
      var $popover = $(tplPopovers(langInfo, options));
      $popover.addClass('note-air-layout');
      $popover.attr('id', 'note-popover-' + id);
      $popover.appendTo(body);
      createTooltip($popover, keyMap);
      createPalette($popover, options);

      // create Handle
      var $handle = $(tplHandles());
      $handle.addClass('note-air-layout');
      $handle.attr('id', 'note-handle-' + id);
      $handle.appendTo(body);

      // create Dialog
      var $dialog = $(tplDialogs(langInfo, options));
      $dialog.addClass('note-air-layout');
      $dialog.attr('id', 'note-dialog-' + id);
      $dialog.find('button.close, a.modal-close').click(function() {
        $(this).closest('.modal').closeModal();
      });
      $dialog.appendTo(body);
    };

    /**
     * create materialnote layout (normal mode)
     *
     * @param {jQuery} $holder
     * @param {Object} options
     */
    this.createLayoutByFrame = function($holder, options) {
      var langInfo = options.langInfo;

      //01. create Editor
      var $editor = $('<div class="note-editor"></div>');
      if (options.width) {
        $editor.width(options.width);
      }

      //02. statusbar (resizebar)
      if (options.height > 0) {
        $('<div class="note-statusbar">' + (options.disableResizeEditor ? '' : tplStatusbar()) + '</div>').prependTo($editor);
      }

      //03. create Editable
      var isContentEditable = !$holder.is(':disabled');
      var $editable = $('<div class="note-editable" contentEditable="' + isContentEditable + '"></div>')
          .prependTo($editor);
      if (options.height) {
        $editable.height(options.height);
      }
      if (options.direction) {
        $editable.attr('dir', options.direction);
      }
      var placeholder = $holder.attr('placeholder') || options.placeholder;
      if (placeholder) {
        $editable.attr('data-placeholder', placeholder);
      }

      $editable.html(dom.html($holder));

      //031. create codable
      $('<textarea class="note-codable"></textarea>').prependTo($editor);

      //04. create Toolbar
      var $toolbar = $('<div class="note-toolbar btn-toolbar" />');
      for (var idx = 0, len = options.toolbar.length; idx < len; idx ++) {
        var groupName = options.toolbar[idx][0];
        var groupButtons = options.toolbar[idx][1];

        var $group = $('<div class="note-' + groupName + ' btn-group" />');
        for (var i = 0, btnLength = groupButtons.length; i < btnLength; i++) {
          var buttonInfo = tplButtonInfo[groupButtons[i]];
          // continue creating toolbar even if a button doesn't exist
          if (!$.isFunction(buttonInfo)) { continue; }

          var $button = $(buttonInfo(langInfo, options));
          $button.attr('data-name', groupButtons[i]);  // set button's alias, becuase to get button element from $toolbar
          $group.append($button);
        }
        $toolbar.append($group);
      }

      $toolbar.prependTo($editor);
      var keyMap = options.keyMap[agent.isMac ? 'mac' : 'pc'];
      createPalette($toolbar, options);
      createTooltip($toolbar, keyMap, 'bottom');


        // >>>>>>> CK - following toolbar
        // following toolbar
        function followingBar() {
            // $(window).unbind('scroll');
            // console.log($._data( $(window)[0], "events" ));
            $(window).scroll(function() {
                var toolbar = $editor.children('.note-toolbar');
                var toolbarHeight = toolbar.outerHeight();
                var editable = $editor.children('.note-editable');
                var editableHeight = editable.outerHeight();
                var editorWidth = $editor.width;
                var toolbarOffset, editorOffsetTop, editorOffsetBottom;
                var activateOffset, deactivateOffsetTop, deactivateOffsetBottom;
                var currentOffset;
                var relativeOffset;
                var otherBarHeight;

                // check if the web app is currently using another static bar
                otherBarHeight = $("." + options.otherStaticBarClass).outerHeight();
                if (!otherBarHeight) otherBarHeight = 0;
                //console.log(otherBarHeight);
                
                currentOffset = $(document).scrollTop();
                toolbarOffset = toolbar.offset().top;
                editorOffsetTop = $editor.offset().top;
                editorOffsetBottom = editorOffsetTop + editableHeight;
                activateOffset = toolbarOffset - otherBarHeight;
                deactivateOffsetBottom = editorOffsetBottom - otherBarHeight;
                deactivateOffsetTop = editorOffsetTop - otherBarHeight;

                if ((currentOffset > activateOffset) && (currentOffset < deactivateOffsetBottom)) {
                    relativeOffset = currentOffset - $editor.offset().top + otherBarHeight;
                    toolbar.css({'top': relativeOffset + 'px', 'z-index': 2000});
                } else {
                    if ((currentOffset < toolbarOffset) && (currentOffset < deactivateOffsetBottom)) {
                        toolbar.css({'top': 0, 'z-index': 1052});

                        if (currentOffset > deactivateOffsetTop) {
                            relativeOffset = currentOffset - $editor.offset().top + otherBarHeight;
                            toolbar.css({'top': relativeOffset + 'px', 'z-index': 2000});
                        }
                    }
                }
            });
        }
        if (options.followingToolbar) {            
            followingBar();
        }

      //05. create Popover
      var $popover = $(tplPopovers(langInfo, options)).prependTo($editor);
      createPalette($popover, options);
      createTooltip($popover, keyMap);

      //06. handle(control selection, ...)
      $(tplHandles()).prependTo($editor);

      //07. create Dialog
      var $dialog = $(tplDialogs(langInfo, options)).prependTo($editor);
      $dialog.find('button.close, a.modal-close').click(function() {
        $(this).closest('.modal').closeModal();
      });

      //08. create Dropzone
      $('<div class="note-dropzone"><div class="note-dropzone-message"></div></div>').prependTo($editor);

      //09. Editor/Holder switch
      $editor.insertAfter($holder);
      $holder.hide();
    };

    this.hasNoteEditor = function($holder) {
      return this.noteEditorFromHolder($holder).length > 0;
    };

    this.noteEditorFromHolder = function($holder) {
      if ($holder.hasClass('note-air-editor')) {
        return $holder;
      } else if ($holder.next().hasClass('note-editor')) {
        return $holder.next();
      } else {
        return $();
      }
    };

    /**
     * create materialnote layout
     *
     * @param {jQuery} $holder
     * @param {Object} options
     */
    this.createLayout = function($holder, options) {
      if (options.airMode) {
        this.createLayoutByAirMode($holder, options);
      } else {
        this.createLayoutByFrame($holder, options);
      }
    };

    /**
     * returns layoutInfo from holder
     *
     * @param {jQuery} $holder - placeholder
     * @return {Object}
     */
    this.layoutInfoFromHolder = function($holder) {
      var $editor = this.noteEditorFromHolder($holder);
      if (!$editor.length) {
        return;
      }

      // connect $holder to $editor
      $editor.data('holder', $holder);

      return dom.buildLayoutInfo($editor);
    };

    /**
     * removeLayout
     *
     * @param {jQuery} $holder - placeholder
     * @param {Object} layoutInfo
     * @param {Object} options
     *
     */
    this.removeLayout = function($holder, layoutInfo, options) {
      if (options.airMode) {
        $holder.removeClass('note-air-editor note-editable')
               .removeAttr('id contentEditable');

        layoutInfo.popover().remove();
        layoutInfo.handle().remove();
        layoutInfo.dialog().remove();
      } else {
        $holder.html(layoutInfo.editable().html());

        layoutInfo.editor().remove();
        $holder.show();
      }
    };

    /**
     *
     * @return {Object}
     * @return {function(label, options=):string} return.button {@link #tplButton function to make text button}
     * @return {function(iconClass, options=):string} return.iconButton {@link #tplIconButton function to make icon button}
     * @return {function(className, title=, body=, footer=):string} return.dialog {@link #tplDialog function to make dialog}
     */
    this.getTemplate = function() {
      return {
        button: tplButton,
        iconButton: tplIconButton,
        dialog: tplDialog
      };
    };

    /**
     * add button information
     *
     * @param {String} name button name
     * @param {Function} buttonInfo function to make button, reference to {@link #tplButton},{@link #tplIconButton}
     */
    this.addButtonInfo = function(name, buttonInfo) {
      tplButtonInfo[name] = buttonInfo;
    };

    /**
     *
     * @param {String} name
     * @param {Function} dialogInfo function to make dialog, reference to {@link #tplDialog}
     */
    this.addDialogInfo = function(name, dialogInfo) {
      tplDialogInfo[name] = dialogInfo;
    };
  };


  // jQuery namespace for materialnote
  /**
   * @class $.materialnote
   *
   * materialnote attribute
   *
   * @mixin defaults
   * @singleton
   *
   */
  $.materialnote = $.materialnote || {};

  // extends default settings
  //  - $.materialnote.version
  //  - $.materialnote.options
  //  - $.materialnote.lang
  $.extend($.materialnote, defaults);

  var renderer = new Renderer();
  var eventHandler = new EventHandler();

  $.extend($.materialnote, {
    /** @property {Renderer} */
    renderer: renderer,
    /** @property {EventHandler} */
    eventHandler: eventHandler,
    /**
     * @property {Object} core
     * @property {core.agent} core.agent
     * @property {core.dom} core.dom
     * @property {core.range} core.range
     */
    core: {
      agent: agent,
      list : list,
      dom: dom,
      range: range
    },
    /**
     * @property {Object}
     * pluginEvents event list for plugins
     * event has name and callback function.
     *
     * ```
     * $.materialnote.addPlugin({
     *     events : {
     *          'hello' : function(layoutInfo, value, $target) {
     *              console.log('event name is hello, value is ' + value );
     *          }
     *     }
     * })
     * ```
     *
     * * event name is data-event property.
     * * layoutInfo is a materialnote layout information.
     * * value is data-value property.
     */
    pluginEvents: {},

    plugins : []
  });

  /**
   * @method addPlugin
   *
   * add Plugin in materialnote
   *
   * materialnote can make a own plugin.
   *
   * ### Define plugin
   * ```
   * // get template function
   * var tmpl = $.materialnote.renderer.getTemplate();
   *
   * // add a button
   * $.materialnote.addPlugin({
   *     buttons : {
   *        // "hello"  is button's namespace.
   *        "hello" : function(lang, options) {
   *            // make icon button by template function
   *            return tmpl.iconButton(options.iconPrefix + 'header', {
   *                // callback function name when button clicked
   *                event : 'hello',
   *                // set data-value property
   *                value : 'hello',
   *                hide : true
   *            });
   *        }
   *
   *     },
   *
   *     events : {
   *        "hello" : function(layoutInfo, value) {
   *            // here is event code
   *        }
   *     }
   * });
   * ```
   * ### Use a plugin in toolbar
   *
   * ```
   *    $("#editor").materialnote({
   *    ...
   *    toolbar : [
   *        // display hello plugin in toolbar
   *        ['group', [ 'hello' ]]
   *    ]
   *    ...
   *    });
   * ```
   *
   *
   * @param {Object} plugin
   * @param {Object} [plugin.buttons] define plugin button. for detail, see to Renderer.addButtonInfo
   * @param {Object} [plugin.dialogs] define plugin dialog. for detail, see to Renderer.addDialogInfo
   * @param {Object} [plugin.events] add event in $.materialnote.pluginEvents
   * @param {Object} [plugin.langs] update $.materialnote.lang
   * @param {Object} [plugin.options] update $.materialnote.options
   */
  $.materialnote.addPlugin = function(plugin) {

    // save plugin list
    $.materialnote.plugins.push(plugin);

    if (plugin.buttons) {
      $.each(plugin.buttons, function(name, button) {
        renderer.addButtonInfo(name, button);
      });
    }

    if (plugin.dialogs) {
      $.each(plugin.dialogs, function(name, dialog) {
        renderer.addDialogInfo(name, dialog);
      });
    }

    if (plugin.events) {
      $.each(plugin.events, function(name, event) {
        $.materialnote.pluginEvents[name] = event;
      });
    }

    if (plugin.langs) {
      $.each(plugin.langs, function(locale, lang) {
        if ($.materialnote.lang[locale]) {
          $.extend($.materialnote.lang[locale], lang);
        }
      });
    }

    if (plugin.options) {
      $.extend($.materialnote.options, plugin.options);
    }
  };

  /*
   * extend $.fn
   */
  $.fn.extend({
    /**
     * @method
     * Initialize materialnote
     *  - create editor layout and attach Mouse and keyboard events.
     *
     * ```
     * $("#materialnote").materialnote( { options ..} );
     * ```
     *
     * @member $.fn
     * @param {Object|String} options reference to $.materialnote.options
     * @return {this}
     */
    materialnote: function() {

      // check first argument's type
      //  - {String}: External API call {{module}}.{{method}}
      //  - {Object}: init options
      var type = $.type(list.head(arguments));
      var isExternalAPICalled = type === 'string';
      var hasInitOptions = type === 'object';

      // extend default options with custom user options
      var options = hasInitOptions ? list.head(arguments) : {};

      options = $.extend({}, $.materialnote.options, options);
      options.icons = $.extend({}, $.materialnote.options.icons, options.icons);

      // Include langInfo in options for later use, e.g. for image drag-n-drop
      // Setup language info with en-US as default
      options.langInfo = $.extend(true, {}, $.materialnote.lang['en-US'], $.materialnote.lang[options.lang]);

      // override plugin options
      if (!isExternalAPICalled && hasInitOptions) {
        for (var i = 0, len = $.materialnote.plugins.length; i < len; i++) {
          var plugin = $.materialnote.plugins[i];

          if (options.plugin[plugin.name]) {
            $.materialnote.plugins[i] = $.extend(true, plugin, options.plugin[plugin.name]);
          }
        }
      }

      this.each(function(idx, holder) {
        // >>>>>>> CK set id for this editor
        materialUniqueId = $(holder).attr('id');

        var $holder = $(holder);

        // if layout isn't created yet, createLayout and attach events
        if (!renderer.hasNoteEditor($holder)) {
          renderer.createLayout($holder, options);

          var layoutInfo = renderer.layoutInfoFromHolder($holder);
          $holder.data('layoutInfo', layoutInfo);

          eventHandler.attach(layoutInfo, options);
          eventHandler.attachCustomEvent(layoutInfo, options);

        }
      });

      var $first = this.first();
      if ($first.length) {
        var layoutInfo = renderer.layoutInfoFromHolder($first);

        // external API
        if (isExternalAPICalled) {
          var moduleAndMethod = list.head(list.from(arguments));
          var args = list.tail(list.from(arguments));

          // TODO now external API only works for editor
          var params = [moduleAndMethod, layoutInfo.editable()].concat(args);
          return eventHandler.invoke.apply(eventHandler, params);
        } else if (options.focus) {
          // focus on first editable element for initialize editor
          layoutInfo.editable().focus();
        }
      }



      // >>>>>>> CK dropdowns - tabs activation
      $(this).each(function(index, editor) {
        var tabs;
        var tabContainer;
        var toolbar;

        if ($(editor).hasClass('note-air-editor')) {
          var id = $(this).attr('id');
          if (id) id = id.substring(id.lastIndexOf('-') + 1, id.length);

          editor = $('#note-popover-' + id);
          tabContainer = editor.find('ul.tabs');
          tabs = editor.find('li.tab a');
          toolbar = $(editor).find('.popover-content button.dropdown');
        } else {
          editor = $(editor).next('.note-editor');
          tabContainer = editor.find('ul.tabs');
          tabs = editor.find('li.tab a');
          toolbar = $(editor).find('.note-toolbar button.dropdown');
        }
        var go = true;

        function handleDropdowns(select, bar) {
          var list = $(select).next('ul.dropdown-menu');
          var container = $(select).parent('.btn-group');    

          list.slideUp(0);

          $('.preventDropClose').click(function(event) {
              event.stopPropagation();
          });

          $(select).click(function(event) {
            var reopen = true;

            if (list.is(':visible')) reopen = false;

            bar.find('ul.dropdown-menu').slideUp(200);

            var editorWidth = $(editor).outerWidth();
            
            list.css({'max-width': editorWidth + 'px'});
            if (reopen) {
              list.slideToggle(200);
            }
            event.stopPropagation();
          });

          tabs.unbind().click(function(event) {
            go = false;
          });
        }

        $(window).click(function(event) {
          if (go) editor.find('ul.dropdown-menu').slideUp(200);
          go = true;
          event.stopPropagation();
        });

        // dropdowns
        toolbar.each(function(index, select) {
          handleDropdowns(select, editor);
        });

        // activate tabs
        tabContainer.tabs();
      }); 

      return this;
    },

    /**
     * @method
     *
     * get the HTML contents of note or set the HTML contents of note.
     *
     * * get contents
     * ```
     * var content = $("#materialnote").code();
     * ```
     * * set contents
     *
     * ```
     * $("#materialnote").code(html);
     * ```
     *
     * @member $.fn
     * @param {String} [html] - HTML contents(optional, set)
     * @return {this|String} - context(set) or HTML contents of note(get).
     */
    code: function(html) {
      // get the HTML contents of note
      if (html === undefined) {
        var $holder = this.first();
        if (!$holder.length) {
          return;
        }

        var layoutInfo = renderer.layoutInfoFromHolder($holder);
        var $editable = layoutInfo && layoutInfo.editable();

        if ($editable && $editable.length) {
          var isCodeview = eventHandler.invoke('codeview.isActivated', layoutInfo);
          eventHandler.invoke('codeview.sync', layoutInfo);
          return isCodeview ? layoutInfo.codable().val() :
                              layoutInfo.editable().html();
        }
        return dom.value($holder);
      }

      // set the HTML contents of note
      this.each(function(i, holder) {
        var layoutInfo = renderer.layoutInfoFromHolder($(holder));
        var $editable = layoutInfo && layoutInfo.editable();
        if ($editable) {
          $editable.html(html);
        }
      });

      return this;
    },

    /**
     * @method
     *
     * destroy Editor Layout and detach Key and Mouse Event
     *
     * @member $.fn
     * @return {this}
     */
    destroy: function() {
      this.each(function(idx, holder) {
        var $holder = $(holder);

        if (!renderer.hasNoteEditor($holder)) {
          return;
        }

        var info = renderer.layoutInfoFromHolder($holder);
        var options = info.editor().data('options');

        eventHandler.detach(info, options);
        renderer.removeLayout($holder, info, options);
      });

      return this;
    }
  });
}));
