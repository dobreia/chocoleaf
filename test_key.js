async function testApiKey() {
  const apiKey = "cal_live_b6ed7fdff373b73dc0ebb900bf16016b";

  const res = await fetch("https://api.cal.com/v1/event-types", {
    headers: {
      "x-api-key": apiKey,       // <-- próbaképp nem Authorization-ban
      "Accept": "application/json"
    }
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}

testApiKey();
