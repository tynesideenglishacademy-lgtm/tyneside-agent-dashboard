$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\admin\OneDrive\Escritorio\Tyneside Agent Dashboard.lnk")
$Shortcut.TargetPath = "C:\Users\admin\OneDrive\Escritorio\PROJECTS\Tyneside Agent Dashboard\launch_dashboard.bat"
$Shortcut.WorkingDirectory = "C:\Users\admin\OneDrive\Escritorio\PROJECTS\Tyneside Agent Dashboard"
$Shortcut.Description = "Launch Tyneside Agent Dashboard & Backend Engine"
$Shortcut.Save()

Copy-Item "C:\Users\admin\OneDrive\Escritorio\PROJECTS\Tyneside Agent Dashboard\launch_dashboard.bat" "C:\Users\admin\OneDrive\Escritorio\Launch Tyneside Agent Dashboard.bat" -Force
Write-Host "Desktop shortcuts created successfully!"
