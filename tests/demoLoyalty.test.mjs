import { test } from 'node:test'
import assert from 'node:assert/strict'
import { freshDemoCustomers, updateDemoCustomer, searchDemoCustomers, readDemoCustomers } from '../src/lib/demoLoyalty.js'

test('search handles names, whitespace, formatted and unformatted phones', () => {
  const customers = freshDemoCustomers()
  assert.equal(searchDemoCustomers(customers, '0255500100')[0].name, 'Alex')
  assert.equal(searchDemoCustomers(customers, '02 5550 0100')[0].name, 'Alex')
  assert.equal(searchDemoCustomers(customers, '  MORGAN  ')[0].name, 'Morgan')
  assert.equal(searchDemoCustomers(customers, 'nobody').length, 0)
})
test('profile gates rewards; redemption preserves overflow and cannot repeat without stamps', () => {
  const jordan = freshDemoCustomers().find(c => c.name === 'Jordan')
  assert.equal(updateDemoCustomer(jordan, { type: 'redeem' }), jordan)
  const full = updateDemoCustomer(jordan, { type: 'profile', lastName: 'Sample', suburb: 'Berry' })
  const extra = updateDemoCustomer(full, { type: 'stamp', count: 3 })
  const redeemed = updateDemoCustomer(extra, { type: 'redeem' })
  assert.equal(redeemed.stamps, 3)
  assert.equal(redeemed.rewardsRedeemed, jordan.rewardsRedeemed + 1)
  assert.equal(updateDemoCustomer(redeemed, { type: 'redeem' }), redeemed)
})
test('a multi-coffee purchase adds multiple stamps and one purchase without mutating other customers', () => {
  const customers = freshDemoCustomers()
  const next = updateDemoCustomer(customers[0], { type: 'stamp', count: 3 })
  assert.equal(next.stamps, 10)
  assert.equal(next.purchases, 3)
  assert.equal(customers[0].stamps, 7)
  assert.equal(customers[1].stamps, 3)
  for (const count of [0, -1, 1.5, 21, NaN]) assert.equal(updateDemoCustomer(next, { type: 'stamp', count }), next)
})
test('saved demo state survives reload; invalid storage falls back to safe samples', () => {
  const customers = freshDemoCustomers()
  assert.deepEqual(readDemoCustomers(JSON.stringify(customers)), customers)
  assert.deepEqual(readDemoCustomers('{bad'), customers)
  assert.deepEqual(readDemoCustomers(JSON.stringify(customers.map(c => ({ ...c, stamps: -1 })))), customers)
})
