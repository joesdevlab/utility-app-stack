New-Item -ItemType Directory -Force -Path 'C:\dev\utility-app-stack\apprentice-log\public\badges' | Out-Null
Copy-Item 'C:\Users\nz7dev\.gemini\antigravity\brain\06d40735-aff1-4641-8307-63b73b9c6da0\google_play_badge_1773379987632.png' -Destination 'C:\dev\utility-app-stack\apprentice-log\public\badges\google-play-badge.png' -Force
$size = (Get-Item 'C:\dev\utility-app-stack\apprentice-log\public\badges\google-play-badge.png').Length
Write-Host "Saved $size bytes"
