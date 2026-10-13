async function checkServers() {
  try {
    const res = await fetch("http://localhost:3000", { signal: AbortSignal.timeout(2000) });
    console.log("Port 3000 status:", res.status);
  } catch (e) {
    console.log("Port 3000 not responding:", e.message);
  }

  try {
    const res = await fetch("http://localhost:3001", { signal: AbortSignal.timeout(2000) });
    console.log("Port 3001 status:", res.status);
  } catch (e) {
    console.log("Port 3001 not responding:", e.message);
  }
}

checkServers();
