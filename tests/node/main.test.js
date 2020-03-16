const path = require('path');

const libName = 'three-laser-pointer';
const outDir = path.join(__dirname, '../../target');
// const __modPath = `${outDir}/${libName}.min.js`;
const __modPath = `${outDir}/${libName}.js`; // dev !!!!
const Mod = require(__modPath);

test('load', () => {
    expect(typeof Mod).toBe('function');

    expect(Object.keys(new Mod())).toBe('zzz');
});
