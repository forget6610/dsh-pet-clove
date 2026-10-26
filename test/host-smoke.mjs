// 宿主半区冒烟测试：验证桌宠图片路由能注册并返回合法 PNG。
// 用法：node test/host-smoke.mjs
import assert from 'node:assert/strict';

const host = (await import('../host.js')).default;

assert.deepEqual(host.inject, ['webServer']);
assert.equal(typeof host.apply, 'function');

const routes = [];
const effects = [];
host.apply({
  webServer: {
    register(spec) {
      routes.push(spec);
      return () => {};
    },
  },
  effect(fn) {
    const dispose = fn();
    if (typeof dispose === 'function') effects.push(dispose);
  },
});

assert.equal(routes.length, 1, '应注册一条桌宠图片路由');
assert.equal(routes[0].path, '/dsh-clove-pet/pet.png');
assert.ok(effects.length >= 1, '路由应挂到插件 fiber 上以便回收');

const chunks = [];
const res = {
  headers: {},
  writeHead(code, headers) {
    this.code = code;
    this.headers = headers;
  },
  end(buffer) {
    chunks.push(Buffer.from(buffer));
  },
};
await routes[0].handler({}, res);
const body = Buffer.concat(chunks);
assert.equal(res.code, 200);
assert.equal(res.headers['Content-Type'], 'image/png');
assert.ok(body.length > 1000, '桌宠图片过小');
assert.deepEqual([...body.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47], '不是合法 PNG');

console.log('host smoke ok: /dsh-clove-pet/pet.png');
