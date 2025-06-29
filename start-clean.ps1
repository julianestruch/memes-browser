# Puertos a limpiar
$ports = @(3000, 3001, 3002, 3003)

foreach ($port in $ports) {
    $lines = netstat -ano | findstr ":$port"
    foreach ($line in $lines) {
        if ($line -match '\s+(\d+)$') {
            $procId = $matches[1]
            if ($procId -ne 0) {
                Write-Host "Matando proceso en puerto $port (PID $procId)..."
                try {
                    taskkill /PID $procId /F | Out-Null
                } catch {}
            }
        }
    }
}

# Iniciar ambos servicios
npm run dev