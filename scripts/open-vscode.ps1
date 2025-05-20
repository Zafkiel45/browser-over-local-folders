param (
    [string]$Directory
)

# Garante que o VS Code está disponível no PATH
if (-not (Get-Command code -ErrorAction SilentlyContinue)) {
    Write-Error "O comando 'code' não está disponível no PATH."
    exit 1
}

# Abre o VS Code no diretório especificado
code $Directory
