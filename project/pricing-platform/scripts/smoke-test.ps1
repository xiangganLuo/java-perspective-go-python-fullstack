$ErrorActionPreference = "Stop"

$body = '{"sku":"SKU-1001","memberLevel":"GOLD"}'
$result = Invoke-RestMethod -Method Post -Uri "http://localhost:8081/api/v1/price/calculate" -ContentType "application/json" -Body $body

if ($result.code -ne 0) {
  throw "Unexpected code: $($result.code)"
}

if ($result.data.finalPriceCents -ne 110415) {
  throw "Unexpected final price: $($result.data.finalPriceCents)"
}

Write-Host "SMOKE TEST PASSED: Java price service returned $($result.data.finalPriceCents)"
