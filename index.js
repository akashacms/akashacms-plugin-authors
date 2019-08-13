/**
 * Copyright 2019 David Herron
 *
 * This file is part of AkashaCMS-embeddables (http://akashacms.com/).
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const util     = require('util');
const path     = require('path');
const akasha   = require('akasharender');
const mahabhuta = akasha.mahabhuta;

const pluginName = "@akashacms/plugin-authors";

const _plugin_config = Symbol('config');
const _plugin_options = Symbol('options');

module.exports = class AuthorsPlugin extends akasha.Plugin {
    constructor() { super(pluginName); }

    configure(config, options) {
        this[_plugin_config] = config;
        this[_plugin_options] = options;
        options.config = config;
		config.addPartialsDir(path.join(__dirname, 'partials'));
        config.addMahabhuta(module.exports.mahabhutaArray(options));
        if (!options.authors) options.authors = [];
	}

    get config() { return this[_plugin_config]; }
    get options() { return this[_plugin_options]; }

};

function findAuthor(options, author) {
    if (author === "default") {
        author = options.default;
    }
    if (typeof author !== 'string') {
        throw new Error(`findAuthor supplied author must be a string value ${util.inspect(author)}`);
    }
    for (let aut of options.authors) {
        if (isAuthor(aut) && aut.code === author) {
            return aut;
        }
    }
    return undefined;
}

// Type Guard
function isAuthor(author) {
    if (typeof author !== 'object') {
        throw new Error(`isAuthor - author object must be object ${util.inspect(author)}`);
    }
    if (typeof author.fullname !== 'string'
        || typeof author.url !== 'string') {
        throw new Error(`isAuthor - invalid author object ${util.inspect(author)}`);
    }
    return true;
}

const getAuthors = (options, $element, metadata) => {
    let authors;
    if ($element.data('authors')) {
        authors = $element.data('authors');
        // console.log(`getAuthors data authors ${util.inspect(authors)}`);
    } else if (metadata.authors) {
        authors = metadata.authors;
    } else {
        authors = [ "default" ];
    }
    if (typeof authors === 'string') authors = [ authors ];

    if (!Array.isArray(authors)) {
        throw new Error(`getAuthors invalid author object ${util.inspect(author)}`);
    }

    // console.log(`getAuthors looking for ${util.inspect(authors)}`);

    let authorList = [];
    for (let aut of authors) {
        let found = findAuthor(options, aut);
        if (!found) {
            throw new Error(`getAuthors did not find author ${util.inspect(aut)}`);
        }
        authorList.push(found);
    }

    // console.log(`getAuthors found ${util.inspect(authorList)}`);
    return authorList;
};

const getID = ($element) => { 
    return $element.attr('id')
        ? $element.attr('id')
        : undefined;
};

const getAdditionalClasses = ($element) => {
    return $element.attr('class')
        ? $element.attr('class')
        : undefined;
};

const getStyle = ($element) => {
    return $element.attr('style')
        ? $element.attr('style') 
        : undefined;
};

const getTemplate = ($element, _default) => {
    return $element.attr("template")
        ? $element.attr("template")
        : _default;
};

module.exports.process = async function(text, metadata, options) {
    let funcs = module.exports.mahabhutaArray(options);
    // console.log(`process received metadata ${util.inspect(metadata)}`);
    // console.log(`process received funcs ${util.inspect(funcs)}`);
    let ret = await mahabhuta.processAsync(text, metadata, funcs);
    // console.log(`process returning ${ret}`);
    return ret;
};

module.exports.mahabhutaArray = function(options) {
    let ret = new mahabhuta.MahafuncArray(pluginName, options);
    ret.addMahafunc(new AuthorBylineElement());
    ret.addMahafunc(new AuthorBioElement());
    return ret;
};

class AuthorBylineElement extends mahabhuta.CustomElement {
    get elementName() { return "authors-byline"; }
    async process($element, metadata, dirty) {

        /* TODO for an author thumbnail they are to pass in an href  */

        // console.log(`AuthorBylineElement ${util.inspect(metadata)}`);

        return akasha.partial(this.array.options.config, 
            getTemplate($element, "authors-byline.html.ejs"), {
            id: getID($element),
            style: getStyle($element), 
            additionalClasses: getAdditionalClasses($element),
            authors: getAuthors(this.array.options, $element, metadata)
        });
    }
}


class AuthorBioElement extends mahabhuta.CustomElement {
    get elementName() { return "authors-bio-block"; }
    async process($element, metadata, dirty) {
        return akasha.partial(this.array.options.config, 
            getTemplate($element, "authors-bio-block.html.ejs"), {
            id: getID($element),
            style: getStyle($element), 
            additionalClasses: getAdditionalClasses($element),
            authors: getAuthors(this.array.options, $element, metadata)
        });
    }
}