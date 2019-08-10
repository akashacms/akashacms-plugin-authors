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

    findAuthor(author) {
        for (let aut of this.options.authors) {
            this.isAuthor(aut);
            if (aut.code === author) {
                return aut;
            }
        }
        return undefined;
    }

    // Type Guard
    isAuthor(author) {
        if (typeof author !== 'object') {
            throw new Error(`isAuthor - author object must be object ${util.inspect(author)}`);
        }
        if (typeof author.fullname !== 'string'
         || typeof author.url !== 'string') {
            throw new Error(`isAuthor - invalid author object ${util.inspect(author)}`);
        }
        return true;
    }

};

TODO -- support a bio block

TODO -- in template if no url then do not output the <a> tag

module.exports.mahabhutaArray = function(options) {
    let ret = new mahabhuta.MahafuncArray(pluginName, options);
    ret.addMahafunc(new AuthorBylineElement());
    return ret;
};

class AuthorBylineElement extends mahabhuta.CustomElement {
    get elementName() { return "authors-byline"; }
    async process($element, metadata, dirty) {
        const id    = $element.attr('id')
                    ? $element.attr('id')
                    : undefined;
        const _classes = $element.attr('class')
                    ? $element.attr('class')
                    : undefined;
        const style = $element.attr('style')
                    ? $element.attr('style') 
                    : undefined;
        const template = $element.attr("template")
                    ? $element.attr("template")
                    : "authors-byline.html.ejs";
        const authors = $element.data('authors') 
                    ? $element.data('authors') 
                    : "default";
        if (typeof authors === 'string') authors = [ authors ];
        if (!Array.isArray(authors)) {
            throw new Error(`authors-byline invalid author object ${util.inspect(author)}`);
        }

        let authorList = [];
        for (let aut of authors) {
            let found = this.array.options.config.plugin(pluginName)
                    .findAuthor(aut);
            if (!found) {
                throw new Error(`authors-byline did not find author ${util.inspect(aut)}`);
            }
            authorList.push(found);
        }
        

        /* TODO for an author thumbnail they are to pass in an href

        TODO write guide page  */

        return akasha.partial(this.array.options.config, template, {
            id, style, 
            additionalClasses: _classes,
            authors: authorList
        });
    }
}
