
const akasha   = require('akasharender');
const plugin = require('../index');
const { assert } = require('chai');
const cheerio = require('cheerio');

const authorconfig = {
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
};

const config = new akasha.Configuration();
config.rootURL("https://example.akashacms.com");
config.configDir = __dirname;
config.use(require('../index'), authorconfig);
config.setMahabhutaConfig({
    recognizeSelfClosing: true,
    recognizeCDATA: true,
    decodeEntities: true
});
config.prepare();

describe('default author', function() {
    it('should find the default author', async function() {
        let html = await plugin.process(`
            <authors-byline></authors-byline>
            `, {}, authorconfig);

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');
        assert.include(html, "Boy George");
        assert.notInclude(html, "Elton John");
    });
});

describe('chosen author', function() {
    it('should find the chosen author', async function() {
        let html = await plugin.process(`
            <authors-byline></authors-byline>
            `, {
                authors: "eltonjohn"
            }, authorconfig);

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');
        assert.notInclude(html, "Boy George");
        assert.include(html, "Elton John");
    });

});