$url = "https://mceovnbaiuxdphoglook.supabase.co"
$key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZW92bmJhaXV4ZHBob2dsb29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNzMyMDYsImV4cCI6MjA4Njc0OTIwNn0.aHGzHInsFp0QBQFGwoujEXJQhvVFPFItgBPgCl4HTJo"
$h = @{ 'apikey' = $key; 'Authorization' = "Bearer $key" }

Write-Host "=== Testing Supabase Tables ==="

$tables = @('faculty', 'academics', 'courses', 'services', 'notes', 'founders')
foreach ($t in $tables) {
    try {
        $uri = "$url/rest/v1/$t`?select=id&limit=1"
        $r = Invoke-RestMethod -Uri $uri -Headers $h -Method GET -ErrorAction Stop
        Write-Host "OK  $t => $($r.Count) rows visible"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "ERR $t => HTTP $code : $($_.Exception.Message)"
    }
}
