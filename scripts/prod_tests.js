(async function(){
  const urls = {
    health: 'https://moneymate-backend-production.up.railway.app/api/health',
    register: 'https://moneymate-backend-production.up.railway.app/api/auth/register',
    login: 'https://moneymate-backend-production.up.railway.app/api/auth/login'
  };

  const fetch = globalThis.fetch || (await import('node-fetch')).default;

  try{
    console.log('=== HEALTH ===');
    let r = await fetch(urls.health);
    console.log('status', r.status);
    console.log(await r.text());
  } catch(e){ console.error('HEALTH ERROR', e.message || e); }

  try{
    console.log('\n=== REGISTER ===');
    const regBody = { name: 'Bot Test', email: 'bot-test@example.test', password: 'Test1234!' };
    let r = await fetch(urls.register, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regBody) });
    console.log('status', r.status);
    console.log(await r.text());
  } catch(e){ console.error('REGISTER ERROR', e.message || e); }

  try{
    console.log('\n=== LOGIN ===');
    const loginBody = { email: 'bot-test@example.test', password: 'Test1234!' };
    let r = await fetch(urls.login, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginBody) });
    console.log('status', r.status);
    console.log(await r.text());
  } catch(e){ console.error('LOGIN ERROR', e.message || e); }

})();