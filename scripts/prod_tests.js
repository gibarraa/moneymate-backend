(async function(){
  const baseUrl = (process.env.API_URL || 'https://moneymate-backend-production.up.railway.app').replace(/\/$/, '');
  const testEmail = `bot-test-${Date.now()}@example.test`;
  let token = '';
  const urls = {
    health: `${baseUrl}/api/health`,
    register: `${baseUrl}/api/auth/register`,
    login: `${baseUrl}/api/auth/login`,
    categories: `${baseUrl}/api/categories`
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
    const regBody = { name: 'Bot Test', email: testEmail, password: 'Test1234!' };
    let r = await fetch(urls.register, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regBody) });
    console.log('status', r.status);
    const text = await r.text();
    console.log(text);
    try { token = JSON.parse(text).token || token; } catch {}
  } catch(e){ console.error('REGISTER ERROR', e.message || e); }

  try{
    console.log('\n=== LOGIN ===');
    const loginBody = { email: testEmail, password: 'Test1234!' };
    let r = await fetch(urls.login, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginBody) });
    console.log('status', r.status);
    const text = await r.text();
    console.log(text);
    try { token = JSON.parse(text).token || token; } catch {}
  } catch(e){ console.error('LOGIN ERROR', e.message || e); }

  try{
    console.log('\n=== CATEGORIES ===');
    let r = await fetch(urls.categories);
    console.log('status', r.status);
    console.log(await r.text());
  } catch(e){ console.error('CATEGORIES ERROR', e.message || e); }

  if (token) {
    try{
      console.log('\n=== MONGO RECOMMENDATIONS ===');
      let r = await fetch(`${baseUrl}/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: 'Prueba Mongo',
          message: 'Documento de recomendacion creado desde prueba de produccion.',
          type: 'habit',
          priority: 'low',
          source: 'prod-test'
        })
      });
      console.log('create status', r.status);
      console.log(await r.text());
      r = await fetch(`${baseUrl}/api/recommendations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('list status', r.status);
      console.log(await r.text());
    } catch(e){ console.error('MONGO RECOMMENDATIONS ERROR', e.message || e); }
  }

})();
