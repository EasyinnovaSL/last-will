
@echo off

:: Move to Web folder
cd Web

:: Make Sure NSSM.exe is in the path and installed
WHERE nssm >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO ERROR. Nssm wasn't found. Please, install it and make sure that it is in the path.
    GOTO end
)

:: Make Sure node.exe is in the path and installed
WHERE node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO ERROR. Node wasn't found. Please, install it and make sure that it is in the path.
    GOTO end
)

:: Make sure we are in NodeJS Folder
if NOT exist app.js (
    echo ERROR. No app.js found in Web directory.
    GOTO end
)

:: Make sure logs folder exists
IF NOT exist "logs" mkdir logs

:: Install service
nssm install back-to-life "node.exe"
nssm set back-to-life AppDirectory "%CD%"
nssm set back-to-life AppParameters "app.js"
nssm set back-to-life AppStdout "%CD%\logs\out.log"
nssm set back-to-life AppStderr "%CD%\logs\err.log"
nssm set back-to-life AppEnvironmentExtra "PORT=3001"
nssm set back-to-life Start SERVICE_AUTO_START

net start back-to-life

echo Service installed and started successfully!

:: End function
:end
    cd ..
    goto:eof