<#
.SYNOPSIS
    Registers an automated Windows Scheduled Task to run AirGo daily harvest at 03:00 AM.
.DESCRIPTION
    Creates or updates the "AirGo_Daily_Harvest" scheduled task in Windows Task Scheduler.
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts/setup_windows_task.ps1
#>

$TaskName = "AirGo_Daily_Harvest"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$PythonExe = (Get-Command python.exe).Source
$RunnerScript = Join-Path $RootDir "scripts\run_daily_harvest.py"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " AirGo: Setting up Windows Task Scheduler Daily Runner " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  Python: $PythonExe"
Write-Host "  Script: $RunnerScript"
Write-Host "  Working Dir: $RootDir"

# Create action: execute python scripts/run_daily_harvest.py --top-n 5 --horizons 1,7,15,30,45
$Action = New-ScheduledTaskAction -Execute $PythonExe -Argument "`"$RunnerScript`" --top-n 5 --horizons 1,7,15,30,45" -WorkingDirectory $RootDir

# Create trigger: Daily at 03:00 AM
$Trigger = New-ScheduledTaskTrigger -Daily -At "03:00AM"

# Settings: Allow on battery, wake computer to run, retry on failure
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -WakeToRun -StartWhenAvailable

# Register or update task
try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "AirGo Automated Daily Flight Price Ingestion and APIx Calculation"
    Write-Host "`n[SUCCESS] Windows Scheduled Task '$TaskName' registered successfully!" -ForegroundColor Green
    Write-Host "It will trigger every morning at 03:00 AM automatically." -ForegroundColor Green
    Write-Host "To test-run it immediately, run: Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Yellow
} catch {
    Write-Error "Failed to register task: $_"
}
