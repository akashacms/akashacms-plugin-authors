
const akasha   = require('akasharender');
const plugin = require('../index');
const { assert } = require('chai');

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

describe('build site', function() {

    it('should run setup', async function() {
        this.timeout(75000);
        await akasha.cacheSetup(config);
        await Promise.all([
            akasha.setupDocuments(config),
            akasha.setupAssets(config),
            akasha.setupLayouts(config),
            akasha.setupPartials(config)
        ])
        let filecache = await akasha.filecache;
        await Promise.all([
            filecache.documents.isReady(),
            filecache.assets.isReady(),
            filecache.layouts.isReady(),
            filecache.partials.isReady()
        ]);
    });

    it('should build site', async function() {
        this.timeout(60000);
        let failed = false;
        let results = await akasha.render(config);
        for (let result of results) {
            if (typeof result.error !== 'undefined') {
                if (result.error
                 && result.error.toString().includes('bad-author.html.md ')
                 && result.error.toString().includes('caught error in CustomElement(authors-byline)')
                 && result.error.toString().includes("getAuthors did not find author 'badauthor-not-found'")) {
                     // This is an expected error
                     continue;
                }
                failed = true;
                console.error(result.error);
            }
        }
        assert.isFalse(failed);
    });
});

describe('default author', function() {
    it('should find the default author', async function() {
        let { html, $ } = await akasha.readRenderedFile(config, 'no-author.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');
        assert.include($('.author-byline .author-name-wrapper a').html(), "Boy George");
        assert.notInclude($('.author-byline .author-name-wrapper a').html(), "Elton John");
    });
});

describe('bad author author fails', function() {
    it('should fail for author not found', async function() {
        
        let result;
        let throwed = false;
        let caught;

        try {
            result = await akasha.renderPath(config, '/bad-author.html');
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
        let { html, $ } = await akasha.readRenderedFile(config, 'author-elton.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');
        assert.notInclude($('.author-byline .author-name-wrapper a').html(), "Boy George");
        assert.include($('.author-byline .author-name-wrapper a').html(), "Elton John");
    });

});

describe('multiple authors', function() {
    it('should find multiple authors', async function() {
        let { html, $ } = await akasha.readRenderedFile(config, 'author-multi.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');
        assert.include($('.author-byline .author-name-wrapper:nth-child(2) a').html(), "Boy George");
        assert.include($('.author-byline .author-name-wrapper:nth-child(1) a').html(), "Elton John");
    });

});

describe('inline authors', function() {
    it('should find inline authors', async function() {
        let { html, $ } = await akasha.readRenderedFile(config, 'author-inline.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');
        assert.include($('#boy .author-name-wrapper a').html(), "Boy George");
        assert.include($('#elton .author-name-wrapper a').html(), "Elton John");
        assert.include($('#both .author-name-wrapper:nth-child(2) a').html(), "Boy George");
        assert.include($('#both .author-name-wrapper:nth-child(1) a').html(), "Elton John");
    });

});

describe('author bios', function() {
    it('should find author bios', async function() {
        let { html, $ } = await akasha.readRenderedFile(config, 'author-bio.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');
        
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


describe('shutdown', function() {

    it('should close the configuration', async function() {
        this.timeout(75000);
        await akasha.closeCaches();
    });
});
