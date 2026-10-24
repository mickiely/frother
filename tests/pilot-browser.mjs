import { chromium } from 'playwright'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const f=JSON.parse(fs.readFileSync(process.env.FROTHER_TEST_FIXTURE || '/tmp/frother-e2e.json','utf8'))
const base=process.env.FROTHER_TEST_URL || 'http://127.0.0.1:5173'
const browser=await chromium.launch({headless:true,executablePath:process.env.FROTHER_BROWSER_PATH || chromium.executablePath(),args:['--no-sandbox']})
const errors=[]
const customerContext=await browser.newContext({viewport:{width:390,height:844}})
const staffContext=await browser.newContext({viewport:{width:1280,height:900}})
// A known disposable key allows the API test harness to identify its synthetic card.
await customerContext.addInitScript(({venueId,key})=>{localStorage.setItem('frother:guest-card:'+venueId,key)},{venueId:f.venueId,key:f.guestToken})
async function pageIn(context,path){const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+path);return p}
async function login(page,email){await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(f.password);await page.getByRole('button',{name:'Sign in',exact:true}).click()}
try {
 const customer=await pageIn(customerContext,`/pilot/${f.slug}`)
 await customer.getByRole('heading',{name:'Your stamp card is open.'}).waitFor()
 assert.equal(await customer.getByLabel('Email',{exact:true}).count(),0)
 assert.equal(await customer.getByLabel('Mobile',{exact:true}).count(),0)
 await customer.reload();await customer.getByRole('heading',{name:'Your stamp card is open.'}).waitFor()
 console.log('PASS open guest card has no account/details form and survives reload')
 const code=await customer.locator('p').filter({hasText:/^F-[A-F0-9]{12}$/}).innerText()
 const staff=await pageIn(staffContext,`/pilot/${f.slug}/staff`)
 await login(staff,f.staffEmail)
 await staff.getByRole('button',{name:new RegExp(code)}).click()
 for(let i=0;i<3;i++){await staff.getByRole('button',{name:'Add 3',exact:true}).click();await staff.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Add 3')?.disabled)}
 assert.equal(await staff.getByRole('button',{name:'Redeem one reward',exact:true}).isDisabled(),true)
 await customer.getByRole('button',{name:'Refresh my stamps',exact:true}).click()
 await customer.getByText('Reward earned — complete details to claim.',{exact:true}).waitFor()
 await customer.getByRole('button',{name:'Complete details to claim',exact:true}).click()
 await customer.getByRole('heading',{name:'Your reward is earned.'}).waitFor()
 console.log('PASS first account/details request appears at earned reward; staff redemption stays locked')
 await customer.getByRole('button',{name:'Already have an account? Sign in',exact:true}).click();await login(customer,f.customerEmail)
 await customer.getByRole('button',{name:'Complete details to claim',exact:true}).click()
 await customer.getByLabel('First name',{exact:true}).fill('Browser Test');await customer.getByLabel('Mobile',{exact:true}).fill('0400000011')
 await customer.getByRole('button',{name:'Save details and unlock reward',exact:true}).click()
 await customer.getByText('Reward ready — show staff.',{exact:true}).waitFor()
 await staff.getByRole('button',{name:'Refresh customer list',exact:true}).click()
 await staff.getByRole('button',{name:'Redeem one reward',exact:true}).click()
 await staff.getByText('Reward redeemed. Remaining stamps are saved.',{exact:true}).waitFor()
 await customer.getByRole('button',{name:'Refresh my stamps',exact:true}).click()
 await customer.getByText('9 more until your reward.',{exact:true}).waitFor()
 console.log('PASS verified details unlock original card; staff redemption updates saved balance')
 assert.deepEqual(errors,[])
 console.log('PASS no browser runtime errors')
} finally {await browser.close()}
