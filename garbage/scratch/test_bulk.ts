
import axios from "axios";

async function testBulkUser() {
  const userId = "1e962773-7f00-4730-bae4-c0f64d1a49af";
  const url = `http://127.0.0.1:8788/api/v1/bulk/user?userId=${userId}`;
  
  try {
    console.log(`Testing bulk user endpoint: ${url}`);
    const response = await axios.get(url);
    console.log("Success! Status:", response.status);
    console.log("Orders count:", response.data.orders.items.length);
  } catch (error: any) {
    console.error("Endpoint failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Details:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testBulkUser();
