import assert from 'assert/strict'
import test from 'node:test'

import {
  camelToSnakeCase,
  diffItems,
  extractProperty,
  generateToken,
  getFromAsyncCache,
  parseSize,
  parseXml,
} from './utils.mjs'

const { describe, it } = test

// ===================================================================

describe('camelToSnakeCase()', function () {
  it('converts a string from camelCase to snake_case', function () {
    assert.equal(camelToSnakeCase('fooBar'), 'foo_bar')
    assert.equal(camelToSnakeCase('ipv4Allowed'), 'ipv4_allowed')
  })

  it('does not alter snake_case strings', function () {
    assert.equal(camelToSnakeCase('foo_bar'), 'foo_bar')
    assert.equal(camelToSnakeCase('ipv4_allowed'), 'ipv4_allowed')
  })

  it('does not alter upper case letters expect those from the camelCase', function () {
    assert.equal(camelToSnakeCase('fooBar_BAZ'), 'foo_bar_BAZ')
  })
})

// -------------------------------------------------------------------

describe('diffItems', () => {
  it('computes the added/removed items between 2 iterables', () => {
    assert.deepEqual(diffItems(['foo', 'bar'], ['baz', 'foo']), [['bar'], ['baz']])
  })
})

// -------------------------------------------------------------------

describe('extractProperty()', function () {
  it('returns the value of the property', function () {
    const value = {}
    const obj = { prop: value }

    assert.equal(extractProperty(obj, 'prop'), value)
  })

  it('removes the property from the object', function () {
    const value = {}
    const obj = { prop: value }

    assert.equal(extractProperty(obj, 'prop'), value)
    assert.equal(obj.prop, undefined)
  })
})

// -------------------------------------------------------------------

describe('parseXml()', () => {
  // excerpt of http://updates.xensource.com/XenServer/updates.xml
  const strA = `<?xml version="1.0" ?>
<patchdata>
  <!-- Generated by cfu.py, do not edit -->
  <patches>
    <patch after-apply-guidance="" name-description="Security update when starting Linux VMs." name-label="Hotfix 2007-001" patch-url="http://downloadns.citrix.com.edgesuite.net/akdlm/9618/2007-001.zip" releasenotes="" timestamp="2007-09-19T00:00:00Z" url="https://support.citrix.com/article/CTX118090" uuid="0701" version="1.0">
      <!-- serverversion = '4.0.1' -->
    </patch>
    <patch after-apply-guidance="" name-description="Stability update for large hotfixes." name-label="Hotfix 2007-002" patch-url="http://downloadns.citrix.com.edgesuite.net/akdlm/9618/2007-002.zip" releasenotes="" timestamp="2007-10-29T00:00:00Z" url="https://support.citrix.com/article/CTX118097" uuid="0702" version="1.0">
      <!-- serverversion = '4.0.1' -->
    </patch>
  </patches>
</patchdata>`

  const bufA = Buffer.from(strA)
  const resultA = {
    patchdata: {
      patches: {
        patch: [
          {
            'after-apply-guidance': '',
            'name-description': 'Security update when starting Linux VMs.',
            'name-label': 'Hotfix 2007-001',
            'patch-url': 'http://downloadns.citrix.com.edgesuite.net/akdlm/9618/2007-001.zip',
            releasenotes: '',
            timestamp: '2007-09-19T00:00:00Z',
            url: 'https://support.citrix.com/article/CTX118090',
            uuid: '0701',
            version: '1.0',
          },
          {
            'after-apply-guidance': '',
            'name-description': 'Stability update for large hotfixes.',
            'name-label': 'Hotfix 2007-002',
            'patch-url': 'http://downloadns.citrix.com.edgesuite.net/akdlm/9618/2007-002.zip',
            releasenotes: '',
            timestamp: '2007-10-29T00:00:00Z',
            url: 'https://support.citrix.com/article/CTX118097',
            uuid: '0702',
            version: '1.0',
          },
        ],
      },
    },
  }
  const strB = `<?xml version="1.0" ?>
<iscsi-target>
  <LUN>
    <vendor>TrueNAS</vendor>
    <serial>9eaa394581f3003</serial>
    <LUNid>55</LUNid>
    <size>10995116277760</size>
    <SCSIid>36589cfc000000581d40d6d5140d9b9da</SCSIid>
  </LUN>
  <LUN>
    <vendor>TrueNAS</vendor>
    <serial>9eaa394581f3004</serial>
    <LUNid>56</LUNid>
    <size>10995116277761</size>
    <SCSIid>36589cfc000000581d40d6d5140d9b9df</SCSIid>
  </LUN>
</iscsi-target>`

  const bufB = Buffer.from(strB)
  const resultB = {
    'iscsi-target': {
      LUN: [
        {
          vendor: 'TrueNAS',
          serial: '9eaa394581f3003',
          LUNid: '55',
          size: '10995116277760',
          SCSIid: '36589cfc000000581d40d6d5140d9b9da',
        },
        {
          vendor: 'TrueNAS',
          serial: '9eaa394581f3004',
          LUNid: '56',
          size: '10995116277761',
          SCSIid: '36589cfc000000581d40d6d5140d9b9df',
        },
      ],
    },
  }

  it('supports strings', () => {
    assert.deepEqual(parseXml(strA), resultA)
    assert.deepEqual(parseXml(strB), resultB)
  })

  it('supports buffers', () => {
    assert.deepEqual(parseXml(bufA), resultA)
    assert.deepEqual(parseXml(bufB), resultB)
  })
})

// -------------------------------------------------------------------

describe('generateToken()', () => {
  it('generates a string', async () => {
    assert.equal(typeof (await generateToken()), 'string')
  })
})

// -------------------------------------------------------------------

describe('parseSize()', function () {
  it('parses a human size', function () {
    assert.equal(parseSize('1G'), 1e9)
  })

  it('returns the parameter if already a number', function () {
    assert.equal(parseSize(1e6), 1e6)
  })

  it('throws if the string cannot be parsed', function () {
    assert.throws(function () {
      parseSize('foo')
    })
  })

  it('supports the B unit as suffix', function () {
    assert.equal(parseSize('3MB'), 3e6)
  })
})

// ===================================================================

describe('getFromAsyncCache()', function () {
  const cacheTest = new Map()
  const cacheTimeout = 500
  const cacheExpiresIn = 1000
  const cacheTestOps = { timeout: cacheTimeout, expiresIn: cacheExpiresIn }
  const sleep = times => new Promise(resolve => setTimeout(resolve, times))

  // start the promise, advance time and return the promise
  const _getFromAsyncCache = async (t, ms, cache, key, fn, opts) => {
    const p = getFromAsyncCache(cache, key, fn, opts)
    t.mock.timers.tick(ms)
    return p
  }

  it('Ensure the callback is called', async t => {
    const cb = t.mock.fn(async () => {})

    assert.equal(cb.mock.callCount(), 0)
    await getFromAsyncCache(cacheTest, 'simpleTest', cb)
    assert.equal(cb.mock.callCount(), 1)
  })

  it('Returns the computed value', async function () {
    const result = await getFromAsyncCache(cacheTest, 'simpleTest', async () => 'foo')
    assert.equal(result.value, 'foo')
  })

  it('Returns the cached value', async function () {
    const result = await getFromAsyncCache(cacheTest, 'simpleTest', async () => 'bar')
    assert.equal(result.value, 'foo')
  })

  it('Recomputes the value if forceRefresh is passed', async function () {
    const result = await getFromAsyncCache(cacheTest, 'simpleTest', async () => 'baz', {
      forceRefresh: true,
    })
    assert.equal(result.value, 'baz')
  })

  it('Returns undefined if the fn takes too long to execute, then returns the computed value when the promise is resolved', async function (t) {
    t.mock.timers.enable({ apis: ['setTimeout'] })
    const cb = async () => {
      await sleep(cacheTimeout * 2.5)
      return 'foo'
    }

    const result = await _getFromAsyncCache(t, cacheTimeout, cacheTest, 'timeout', cb, cacheTestOps)
    assert.equal(result.value, undefined)

    const secondResult = await _getFromAsyncCache(t, cacheTimeout, cacheTest, 'timeout', undefined, cacheTestOps)
    assert.equal(secondResult.value, undefined)

    t.mock.timers.tick(cacheTimeout)

    const thirdResult = await getFromAsyncCache(cacheTest, 'timeout', undefined, cacheTestOps)
    assert.equal(thirdResult.value, 'foo')
  })

  it('If cached value is expired, returns the new computed value', async function (t) {
    t.mock.timers.enable({ apis: ['Date'], now: 0 })

    const result = await getFromAsyncCache(cacheTest, 'expired', async () => 'foo', cacheTestOps)
    assert.equal(result.value, 'foo')

    t.mock.timers.setTime(cacheExpiresIn * 2)

    const secondResult = await getFromAsyncCache(cacheTest, 'expired', async () => 'bar', cacheTestOps)
    assert.equal(secondResult.value, 'bar')
  })

  it('If cached value is expired and the fn takes too long time to execute, returns the expired cached value with "isExpired" property and updates the cache when the promise is resolved', async function (t) {
    t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 })
    const cb = async () => {
      await sleep(cacheTimeout * 1.5)
      return 'bar'
    }

    const result = await getFromAsyncCache(cacheTest, 'expiredAndTimeout', async () => 'foo', cacheTestOps)
    assert.equal(result.value, 'foo')

    t.mock.timers.setTime(cacheExpiresIn * 2)

    const secondResult = await _getFromAsyncCache(t, cacheTimeout, cacheTest, 'expiredAndTimeout', cb, cacheTestOps)
    assert.equal(secondResult.value, 'foo')
    assert.equal(secondResult.isExpired, true)

    t.mock.timers.tick(cacheTimeout)

    const thirdResult = await getFromAsyncCache(cacheTest, 'expiredAndTimeout', undefined, cacheTestOps)
    assert.equal(thirdResult.value, 'bar')
    assert.equal(thirdResult.isExpired, undefined)
  })
})
