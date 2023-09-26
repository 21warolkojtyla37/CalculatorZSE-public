#!/bin/bash
export FLASK_APP=run.py
export FLASK_CONFIG=development
python3.11 -m flask db init
python3.11  -m flask db migrate
python3.11  -m flask db upgrade