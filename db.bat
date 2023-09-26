cd C:\Projekty\CalculatorZSE
set FLASK_APP=run.py
set FLASK_CONFIG=development
C:\"Program Files"\Python310\python.exe -m flask db init
C:\"Program Files"\Python310\python.exe -m flask db migrate
C:\"Program Files"\Python310\python.exe -m flask db upgrade
pause
