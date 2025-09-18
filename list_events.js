const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function listEventTypes() {
    const res = await fetch("https://api.cal.com/v1/event-types", {
        headers: {
            "Authorization": "Bearer cal_live_1aa4e95dc0ededd00c0b5090d550a79c"
        }
    });
    const data = await res.json();
    console.log(data);
}

listEventTypes();
