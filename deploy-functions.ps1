#!/usr/bin/env pwsh
# deploy-functions.ps1
# Script para desplegar las Edge Functions de Supabase
# Uso: .\deploy-functions.ps1 -Token "sbp_tu_token_aqui"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$ProjectRef = "tcsljaqcmcadhhspdvco"
$Cwd = $PSScriptRoot

Write-Host "`n🔐 Haciendo login en Supabase CLI..." -ForegroundColor Cyan
npx supabase login --token $Token

Write-Host "`n🔗 Vinculando proyecto $ProjectRef..." -ForegroundColor Cyan
npx supabase link --project-ref $ProjectRef

Write-Host "`n🚀 Desplegando Edge Function: groq-chat..." -ForegroundColor Yellow
npx supabase functions deploy groq-chat --no-verify-jwt

Write-Host "`n📧 Desplegando Edge Function: send-order-email..." -ForegroundColor Yellow
npx supabase functions deploy send-order-email --no-verify-jwt

Write-Host "`n✅ Edge Functions desplegadas exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  RECUERDA agregar los secrets en Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "   → Settings > Edge Functions > Secrets" -ForegroundColor Yellow
Write-Host "   • GROQ_API_KEY = (tu clave de Groq)" -ForegroundColor White
Write-Host "   • RESEND_API_KEY = (tu clave de Resend.com)" -ForegroundColor White
Write-Host "   • ADMIN_EMAIL = info@mydhijosdelrey.com" -ForegroundColor White
Write-Host "   • FROM_EMAIL = noreply@mydhijosdelrey.com" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs de tus funciones:" -ForegroundColor Cyan
Write-Host "   groq-chat: https://$ProjectRef.supabase.co/functions/v1/groq-chat"
Write-Host "   send-order-email: https://$ProjectRef.supabase.co/functions/v1/send-order-email"
