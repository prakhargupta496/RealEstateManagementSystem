exports.config = {

  ignore_processing: ["/templates/"],

  assets: {

    js: {
        helper: [ "/js_helper/1.js" ],
        empty: "/js_empty",
        duplicates: [ "/js_helper/1.js", "/js_helper" ],
        filetype: "/js_filetype"
    },

    css: {
        all: [ "/css" ]
    }

  }

};
