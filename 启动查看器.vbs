Set WshShell = CreateObject("WScript.Shell")
Dim objFSO
Set objFSO = CreateObject("Scripting.FileSystemObject")

' ????????
Dim scriptDir
scriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' ???????
WshShell.CurrentDirectory = scriptDir

' ??pythonw.exe????
Dim pythonwPath
pythonwPath = WshShell.ExpandEnvironmentStrings("%PYTHONW%")

If pythonwPath = "%PYTHONW%" Or Not objFSO.FileExists(pythonwPath) Then
    ' ????pythonw.exe
    Dim pythonPath
    pythonPath = WshShell.ExpandEnvironmentStrings("%PYTHON%")
    
    If pythonPath = "%PYTHON%" Or Not objFSO.FileExists(pythonPath) Then
        ' ????Python??
        pythonPath = "python.exe"
    End If
    
    ' ?python.exe???pythonw.exe
    pythonwPath = Replace(pythonPath, "python.exe", "pythonw.exe")
    
    ' ???????????python.exe
    If Not objFSO.FileExists(pythonwPath) Then
        pythonwPath = pythonPath
    End If
End If

' ??????????
WshShell.Run """" & pythonwPath & """ src\main.py", 0, False
