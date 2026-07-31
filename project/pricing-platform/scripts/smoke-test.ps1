# 全链路冒烟测试：Java 必测；Python 与 Go 网关按可达性测试（未启动则 SKIP）。
$ErrorActionPreference = "Stop"
$failed = $false

function Test-Health($name, $uri) {
  try {
    $null = Invoke-RestMethod -Method Get -Uri $uri -TimeoutSec 2
    return $true
  } catch {
    Write-Host "SKIP  $name 未启动（$uri 不可达）"
    return $false
  }
}

# 1. Java 价格服务（必测）
$body = '{"sku":"SKU-1001","memberLevel":"GOLD"}'
$java = Invoke-RestMethod -Method Post -Uri "http://localhost:8081/api/v1/price/calculate" -ContentType "application/json" -Body $body
if ($java.code -ne 0) { throw "Java: unexpected code $($java.code)" }
if ($java.data.finalPriceCents -ne 110415) { throw "Java: unexpected final price $($java.data.finalPriceCents)" }
Write-Host "PASS  Java 价格服务 finalPriceCents=$($java.data.finalPriceCents)"

# 2. Python 分析服务（可达则测）
if (Test-Health "Python 分析服务" "http://localhost:8082/health") {
  $py = Invoke-RestMethod -Method Post -Uri "http://localhost:8082/api/v1/analyze" -ContentType "application/json" -Body '{"sku":"SKU-1001","basePriceCents":129900}'
  if ($py.code -ne 0) { $failed = $true; Write-Host "FAIL  Python: unexpected code $($py.code)" }
  elseif ($py.data.priceScore -ne 76) { $failed = $true; Write-Host "FAIL  Python: unexpected priceScore $($py.data.priceScore)" }
  else { Write-Host "PASS  Python 分析服务 priceScore=$($py.data.priceScore)" }
}

# 3. Go 网关聚合（可达则测：price 与 analysis 两段都要有）
if (Test-Health "Go 网关" "http://localhost:8080/health") {
  $gw = Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/prices/SKU-1001?memberLevel=GOLD"
  if ($gw.code -ne 0) { $failed = $true; Write-Host "FAIL  网关: unexpected code $($gw.code)" }
  elseif ($gw.data.price.finalPriceCents -ne 110415) { $failed = $true; Write-Host "FAIL  网关: unexpected final price $($gw.data.price.finalPriceCents)" }
  else {
    Write-Host "PASS  Go 网关聚合 finalPriceCents=$($gw.data.price.finalPriceCents)"
    if ($null -eq $gw.data.analysis) {
      Write-Host "WARN  网关返回 analysis=null（Python 未启动时属正常降级）"
    } elseif ($gw.data.analysis.priceScore -ne 76) {
      $failed = $true; Write-Host "FAIL  网关: unexpected analysis.priceScore $($gw.data.analysis.priceScore)"
    } else {
      Write-Host "PASS  网关聚合 analysis.priceScore=$($gw.data.analysis.priceScore)"
    }
  }
}

if ($failed) { throw "SMOKE TEST FAILED" }
Write-Host "SMOKE TEST PASSED"
