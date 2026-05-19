@echo off
title 5EVEN - Supabase Edge Function Deployer
color 0b
cls
echo =======================================================================
echo                 5EVEN EDGE FUNCTION DEPLOYER (DENO)
echo =======================================================================
echo  This script will deploy your local 'send-email' Deno Edge Function
echo  to your remote Supabase project: grfvuhmptzqaxwlwbtsf
echo =======================================================================

rem Load environmental variables from .env.local
if exist .env.local (
  echo  [INFO] Loading local SMTP environment variables from .env.local...
  for /f "usebackq tokens=1,2 delims==" %%I in (`findstr /v "^#" .env.local`) do (
    set "%%I=%%J"
  )
)

echo.
echo  [STEP 1] Fetch a Supabase Access Token
rem If token is already present in environment, skip prompt
if "%SUPABASE_ACCESS_TOKEN%"=="" (
  echo  If you don't have a Supabase Access Token, open this link in your browser:
  echo  https://supabase.com/dashboard/account/tokens
  echo  Create a new token and copy it.
  echo.
  set /p token="  Enter your Supabase Access Token: "
  if "%token%"=="" (
    echo.
    echo  [ERROR] Access token cannot be empty!
    echo  Exiting...
    pause
    exit /b
  )
  set SUPABASE_ACCESS_TOKEN=%token%
) else (
  echo  [INFO] Using existing SUPABASE_ACCESS_TOKEN from environment.
)

echo.
echo  [STEP 2] Deploying 'send-email' function...
echo  -------------------------------------------
call npx supabase functions deploy send-email --project-ref grfvuhmptzqaxwlwbtsf --no-verify-jwt --use-api
if %errorlevel% neq 0 (
  echo.
  echo  [ERROR] Deployment failed! Please verify your token and network connection.
  pause
  exit /b
)

echo.
echo  [STEP 3] Configure Gmail SMTP Credentials on Supabase Secrets
echo  ---------------------------------------------------------
if not "%SMTP_PASSWORD%"=="" (
  set SMTP_PASSWORD=%SMTP_PASSWORD: =%
  echo  [FOUND] Local SMTP credentials detected in .env.local!
  echo  Automatically setting SMTP secrets on Supabase...
  call npx supabase secrets set SMTP_PASSWORD="%SMTP_PASSWORD%" --project-ref grfvuhmptzqaxwlwbtsf
  if not "%SMTP_HOST%"=="" (
    call npx supabase secrets set SMTP_HOST="%SMTP_HOST%" --project-ref grfvuhmptzqaxwlwbtsf
  )
  if not "%SMTP_PORT%"=="" (
    call npx supabase secrets set SMTP_PORT="%SMTP_PORT%" --project-ref grfvuhmptzqaxwlwbtsf
  )
  if not "%SMTP_USERNAME%"=="" (
    call npx supabase secrets set SMTP_USERNAME="%SMTP_USERNAME%" --project-ref grfvuhmptzqaxwlwbtsf
  )
) else (
  echo  To send directly from institution5even@gmail.com, you need a Google App Password.
  echo  Generate one here: https://myaccount.google.com/apppasswords
  echo.
  set /p gmailpass="  Enter your Gmail App Password: "
  if not "%gmailpass%"=="" (
    set gmailpass=%gmailpass: =%
    echo.
    echo  Setting SMTP_PASSWORD secret on Supabase...
    call npx supabase secrets set SMTP_PASSWORD="%gmailpass%" --project-ref grfvuhmptzqaxwlwbtsf
  )
)

echo.
echo =======================================================================
echo  DEPLOYMENT COMPLETE! 
echo  Your frontend is now ready to send emails securely via Gmail SMTP!
echo =======================================================================
echo.
pause
