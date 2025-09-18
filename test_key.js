async function testApiKey() {
  const res = await fetch("https://api.cal.com/v1/event-types", {
    headers: {
      "Authorization": "Bearer cal_live_3386581f0ae9a9e3eb2e0c11c06570ad"
    }
  });

  console.log("HTTP status:", res.status);
  const data = await res.json();
  console.log("Response:", data);
}

testApiKey();
