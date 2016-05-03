var PublicLab = {};

// provide nodejs-style reference if not run in a browser, though that's silly:
(function(exports){

   exports.PublicLab = PublicLab;

})(typeof exports === 'undefined'? this['publiclab-editor']={}: exports);

/* From http://ejohn.org/blog/simple-javascript-inheritance/ */

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

PublicLab.Util = {

  getUrlHashParameter: function(sParam) {

    var sPageURL = window.location.hash;
    if (sPageURL) sPageURL = sPageURL.split('#')[1];
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {

      var sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] == sParam) {
        return sParameterName[1];
      }

    }

  },

  getUrlParameter: function(sParam) {

    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {

      var sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] == sParam) {
        return sParameterName[1];
      }

    }

  }

}

PublicLab.Editor = Class.extend({

  init: function(textarea) {

    var editor = this;


    editor.value = function() {

      editor.wysiwyg.value();

    },

    editor.wysiwyg = woofmark(textarea, {

      defaultMode: 'wysiwyg',
      storage:     'ple-woofmark-mode',

      render: {

        modes: function (button, id) {
          button.className = 'woofmark-mode-' + id;
          if (id == 'html')     button.innerHTML = "Preview";
          if (id == 'markdown') button.innerHTML = "Markdown";
          if (id == 'wysiwyg')  button.innerHTML = "Rich";
        }
/*
        commands: function (button, id) {
          button.className = 'woofmark-command-' + id;
        }
*/

      },

      images: {
   
        // endpoint where the images will be uploaded to, required
        url: '/images',
   
        // optional text describing the kind of files that can be uploaded
        restriction: 'GIF, JPG, and PNG images',
   
        // what to call the FormData field?
        key: 'main_image',
   
        // should return whether `e.dataTransfer.files[i]` is valid, defaults to a `true` operation
        validate: function isItAnImageFile (file) {
          return /^image\/(gif|png|p?jpe?g)$/i.test(file.type);
        }

      },

/*
      attachments: {
      },
*/

      parseMarkdown: function (input) {
        return megamark(input, {
          tokenizers: [{
            token: /(^|\s)@([A-z]+)\b/g,
            transform: function (all, separator, id) {
              return separator + '<a href="/users/' + id + '">@' + id + '</a>';
            }
          }]
        });
      },

      parseHTML: function (input) {
        return domador(input, {
          transform: function (el) {
            if (el.tagName === 'A' && el.innerHTML[0] === '@') {
              return el.innerHTML;
            }
          }
        });
      }

    });

  }

});