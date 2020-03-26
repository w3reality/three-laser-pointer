const path = require('path');

const libName = 'three-laser-pointer';
const outDir = path.join(__dirname, '../../target');
const __modPath = `${outDir}/${libName}.min.js`;
//const __modPath = `${outDir}/${libName}.js`; // dev !!!!

const Mod = require(__modPath);
test('constructor', () => {
    expect(typeof Mod).toBe('function');
});

const laser = new Mod(); // THREE is internally `require()`-d
test('`new`', () => {
    expect(laser.type).toBe('Line');
});

test('misc - `{update,get,clear}Points()`', () => {
    laser.updatePoints([0,0,0, 1,1,0, 2,2,2], true);
    expect(laser.getPoints().length).toBe(3);
    laser.clearPoints();
    expect(laser.getPoints().length).toBe(0);
});
