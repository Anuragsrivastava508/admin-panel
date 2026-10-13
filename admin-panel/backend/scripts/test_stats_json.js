async function checkStats() {
  const res = await fetch("http://localhost:3001/api/stats");
  const data = await res.json();
  console.log("Stats response:", JSON.stringify(data, null, 2));
}

checkStats();
