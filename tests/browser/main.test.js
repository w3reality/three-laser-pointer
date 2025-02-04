const path = require('path');
const fs = require('fs-extra');
const { Server, getBrowser } = require('es-pack-js');

const libName = 'three-laser-pointer';
const outDir = path.join(__dirname, '../../target');
const modPath = `${outDir}/${libName}.min.js`;
// const modPath = `${outDir}/${libName}.js`; // dev !!!!

const tmpModPath = `${__dirname}/__tmp.min.js`;

describe(`Test Suite: using ${modPath}`, () => {

let output;
let browser = null;
let server = null;

beforeAll(async () => {
    const serveDir = __dirname;
    server = await (new Server(serveDir)).listen();

    const tmpThreePath = path.join(__dirname, './__three.min.js');
    fs.copySync(path.join(__dirname, '../../node_modules/three/build/three.min.js'),
        tmpThreePath);
    fs.copySync(modPath, tmpModPath);

    browser = await getBrowser();
    const page = await browser.newPage();
    await page.goto(`http://localhost:${server.port}/index.html`);

    expect(await page.title()).toBe('tests');

    await page.waitForFunction(`typeof window.output === "object"`);
    output = await page.evaluate(() => window.output);

    fs.removeSync(tmpThreePath);
    fs.removeSync(tmpModPath);
});

afterAll(async () => {
    await browser.close();
    server.close();
    server = null;
});

test('output', () => {
    expect(typeof output).toBe('object');
});
test('constructor', () => {
    expect(output['constructor']).toBe('function');
});
test('`new`', () => expect(output['new']).toBe('Line'));
test('misc - `{update,get,clear}Points()`', () => expect(output['misc']).toEqual([3, 0]));

}); // end of `describe()`
