
async function testRegister() {
  const url = 'http://localhost:8788/api/v1/auth/register';
  const body = {
    username: 'test_user_' + Date.now(),
    password: 'Password123!',
    email: 'test' + Date.now() + '@example.com',
    fullName: 'Test User'
  };

  console.log('Testing Registration...');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', JSON.stringify(data, null, 2));

  if (res.status === 201) {
    console.log('Checking if user was created in DB (should NOT be)...');
    // We can't check the DB directly here, but we can try to login.
    const loginUrl = 'http://localhost:8788/api/v1/auth/login';
    const loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: body.username, password: body.password })
    });
    console.log('Login Status (should be 401):', loginRes.status);
    if (loginRes.status === 401) {
      console.log('SUCCESS: User was NOT created before verification.');
    } else {
      console.log('FAILURE: User WAS created before verification!');
    }
  }
}

testRegister();
