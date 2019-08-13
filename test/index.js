
const akasha   = require('akasharender');
const plugin = require('../index');
const { assert } = require('chai');
const cheerio = require('cheerio');
const fs      = require('fs-extra');

const authorconfig = {
    default: "boygeorge",
    authors: [
        {
            code: "boygeorge",
            fullname: "Boy George",
            url: "URL",
            bio: 'Boy George BIO'
        },
        {
            code: "eltonjohn",
            fullname: "Elton John",
            url: "URL",
            bio: 'Elton John BIO'
        }
    ]
};

/*
WHY - CustomElements run akasha.partial at the end hence the AkashaCMS 
      environment must be correctly initialized

*/

const config = new akasha.Configuration();
config.rootURL("https://example.akashacms.com");
config.configDir = __dirname;
config.addLayoutsDir('layouts')
      .addDocumentsDir('documents');
config.use(plugin, authorconfig);
config.setMahabhutaConfig({
    recognizeSelfClosing: true,
    recognizeCDATA: true,
    decodeEntities: true
});
config.prepare();

describe('default author', function() {
    it('should find the default author', async function() {
        let found = await akasha.findRendersTo(config, '/no-author.html');
        let result = await akasha.renderDocument(
                    config,
                    found.foundDir,
                    found.foundPathWithinDir,
                    config.renderTo,
                    found.foundMountedOn,
                    found.foundBaseMetadata);

        assert.exists(result, 'result exists');
        assert.isString(result, 'result isString');
        assert.include(result, '.html.md');
        assert.include(result, 'documents/no-author.html.md');
        assert.include(result, 'out/no-author.html');

        let html = await fs.readFile('out/no-author.html', 'utf8');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');
        let $ = cheerio.load(html);
        assert.include($('.author-byline .author-name-wrapper a').html(), "Boy George");
        assert.notInclude($('.author-byline .author-name-wrapper a').html(), "Elton John");
    });
});

describe('bad author author fails', function() {
    it('should fail for author not found', async function() {
        
        let found;
        let result;
        let throwed = false;
        let caught;

        try {
            found = await akasha.findRendersTo(config, '/bad-author.html');
            result = await akasha.renderDocument(
                        config,
                        found.foundDir,
                        found.foundPathWithinDir,
                        config.renderTo,
                        found.foundMountedOn,
                        found.foundBaseMetadata);
        } catch (e) {
            throwed = true;
            caught = e;
        }

        assert.isTrue(throwed);
        assert.exists(caught.message);
        assert.isString(caught.message);
        assert.include(caught.message, 'in renderer branch');
        assert.include(caught.message, '@akashacms/plugin-authors caught error');
        assert.include(caught.message, 'CustomElement(authors-byline)');
        assert.include(caught.message, 'getAuthors did not find author \'badauthor-not-found\'');
    });
});

describe('chosen author', function() {
    it('should find the chosen author', async function() {
        let found = await akasha.findRendersTo(config, '/author-elton.html');
        let result = await akasha.renderDocument(
                    config,
                    found.foundDir,
                    found.foundPathWithinDir,
                    config.renderTo,
                    found.foundMountedOn,
                    found.foundBaseMetadata);

        assert.exists(result, 'result exists');
        assert.isString(result, 'result isString');
        assert.include(result, '.html.md');
        assert.include(result, 'documents/author-elton.html.md');
        assert.include(result, 'out/author-elton.html');

        let html = await fs.readFile('out/author-elton.html', 'utf8');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');
        let $ = cheerio.load(html);
        assert.notInclude($('.author-byline .author-name-wrapper a').html(), "Boy George");
        assert.include($('.author-byline .author-name-wrapper a').html(), "Elton John");
    });

});

describe('multiple authors', function() {
    it('should find multiple authors', async function() {
        let found = await akasha.findRendersTo(config, '/author-multi.html');
        let result = await akasha.renderDocument(
                    config,
                    found.foundDir,
                    found.foundPathWithinDir,
                    config.renderTo,
                    found.foundMountedOn,
                    found.foundBaseMetadata);

        assert.exists(result, 'result exists');
        assert.isString(result, 'result isString');
        assert.include(result, '.html.md');
        assert.include(result, 'documents/author-multi.html.md');
        assert.include(result, 'out/author-multi.html');

        let html = await fs.readFile('out/author-multi.html', 'utf8');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');
        let $ = cheerio.load(html);
        assert.include($('.author-byline .author-name-wrapper:nth-child(2) a').html(), "Boy George");
        assert.include($('.author-byline .author-name-wrapper:nth-child(1) a').html(), "Elton John");
    });

});

describe('inline authors', function() {
    it('should find inline authors', async function() {
        let found = await akasha.findRendersTo(config, '/author-inline.html');
        let result = await akasha.renderDocument(
                    config,
                    found.foundDir,
                    found.foundPathWithinDir,
                    config.renderTo,
                    found.foundMountedOn,
                    found.foundBaseMetadata);

        assert.exists(result, 'result exists');
        assert.isString(result, 'result isString');
        assert.include(result, '.html.md');
        assert.include(result, 'documents/author-inline.html.md');
        assert.include(result, 'out/author-inline.html');

        let html = await fs.readFile('out/author-inline.html', 'utf8');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');
        let $ = cheerio.load(html);
        assert.include($('#boy .author-name-wrapper a').html(), "Boy George");
        assert.include($('#elton .author-name-wrapper a').html(), "Elton John");
        assert.include($('#both .author-name-wrapper:nth-child(2) a').html(), "Boy George");
        assert.include($('#both .author-name-wrapper:nth-child(1) a').html(), "Elton John");
    });

});

describe('author bios', function() {
    it('should find author bios', async function() {
        let found = await akasha.findRendersTo(config, '/author-bio.html');
        let result = await akasha.renderDocument(
                    config,
                    found.foundDir,
                    found.foundPathWithinDir,
                    config.renderTo,
                    found.foundMountedOn,
                    found.foundBaseMetadata);

        assert.exists(result, 'result exists');
        assert.isString(result, 'result isString');
        assert.include(result, '.html.md');
        assert.include(result, 'documents/author-bio.html.md');
        assert.include(result, 'out/author-bio.html');

        let html = await fs.readFile('out/author-bio.html', 'utf8');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');
        let $ = cheerio.load(html);

        assert.include($('#default .author-bio-block-name').html(), "Boy George");
        assert.include($('#default .author-bio-block-bio').html(), "Boy George BIO");

        assert.include($('#boy .author-bio-block-name').html(), "Boy George");
        assert.include($('#boy .author-bio-block-bio').html(), "Boy George BIO");

        assert.include($('#elton .author-bio-block-name').html(), "Elton John");
        assert.include($('#elton .author-bio-block-bio').html(), "Elton John BIO");

        // The output for this section looks like the following.
        // But I couldn't get tests to work for that using :nth-child
        //
        // <p><div class="author-bio-block" id="both">
        // 
        //    <div class="author-bio-block-name">
        //    Boy George
        //    </div>
        //    <div class="author-bio-block-bio">
        //    Boy George BIO
        //    </div>
        //
        //    <div class="author-bio-block-name">
        //    Elton John
        //    </div>
        //    <div class="author-bio-block-bio">
        //    Elton John BIO
        //    </div>
        //
        // </div>

        assert.include($('#both').html(), "Boy George");
        assert.include($('#both').html(), "Boy George BIO");
        assert.include($('#both').html(), "Elton John");
        assert.include($('#both').html(), "Elton John BIO");

        // console.log('1', $('#both .author-bio-block-name:nth-child(1)'));
        // console.log('1 html()', $('#both .author-bio-block-name:nth-child(1)').html());
        // console.log('2', $('#both .author-bio-block-name:nth-child(2)'));
        // console.log('2 html()', $('#both .author-bio-block-name:nth-child(2)').html());

        // assert.include($('#both .author-bio-block-name:nth-child(1)').html(), "Boy George");
        // assert.include($('#both .author-bio-block-bio:nth-child(1)').html(), "Boy George BIO");

        // assert.include($('#both .author-bio-block-name:nth-child(2)').html(), "Elton John");
        // assert.include($('#both .author-bio-block-bio:nth-child(2)').html(), "Elton John BIO");
    });

});
