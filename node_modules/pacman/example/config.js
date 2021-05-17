exports.config = {

  layouts: {
    "page2.html": "_layouts/other.html"
  },

  assets: {

    js: {
      group1: [
        "js/a.js",
        "js/b.js",
        "js/template.js"      ]
    },

    css: {
      group2: [
        "css/1.css",
        "css/2.css"
      ]
    },
    tmpl: {
      group3: [
        "templates/1.tmpl"
      ]
    }

  },

  helpers: {

    hello: function() {
      return "hello!";
    }

  }

};