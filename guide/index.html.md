---
layout: plugin-documentation.html.ejs
title: AskashaCMS Author plugin documentation
publicationDate: August 9, 2019
---

We often want an article to include author attribution.  For example a blog post, news article, etc, is more relevant if the reader knows the authors name and has a link to a bio.

With this plugin the `config.js` file holds a list of authors, and each content document can declare one or more authors.  Custom elements are available to present a list of one or more authors like:

```
By <a href="URL">Boy George</a>, <a href="URL">Elton John</a>
```

Additionally the default template contains appropriate `Schema.org` metadata, and any link will contain a `rel=author` attribute.

# Installation

Add the following to `package.json`

```json
"dependencies": {
    ...
    "@akashacms/plugin-author": ">=0.7"
    ...
}
```

Once added to `package.json` run: `npm install`


# Configuration

Add the following to `config.js`

```
config
    ...
    .use(require('@akashacms/plugin-author'), {
        default: "boygeorge",
        authors: [
            {
                code: "boygeorge",
                fullname: "Boy George",
                url: "URL"
            },
            {
                code: "eltonjohn",
                fullname: "Elton John",
                url: "URL"
            }
        ]
    })
    ...
```


# Custom Tags

## `author-byline`

```html
<author-byline data-authors='[ "authorcode" ]'></author-byline>

OR

<author-byline data-authors="authorcode"></author-byline>
```

The other attributes are:

* `template="partial-file.html.ejs"` -- Override the default template, `authors-byline.html.ejs`
* `id="ID"` -- An ID attribute for the outer element
* `class="class"` -- Additional class values for the outer element
* `style="style"` -- CSS style attribute

The data provided is:

* `id` - The ID attribute if any (`undefined` otherwise)
* `style` - The style attribute if any (`undefined` otherwise) 
* `additionalClasses` -- Any class value supplied, or `undefined`
* `authors` -- The author objects corresponding to the supplied authorcode(s)


