// Native fetch


async function test() {
  try {
    const res = await fetch('http://localhost:8788/api/v1/orders', {
      headers: { 'Authorization': 'Bearer adm_sk_72e829fc89d4e37decb405dace50ba5c' }
    });
    console.log('Status:', res.status);
    const data = await res.text();
    console.log('Body:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}
await test();

